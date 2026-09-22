// localStore.js - Simple file-based database for when MongoDB is not running.
// All data is saved in backend/data/db.json
// This lets beginners use the project without setting up MongoDB!

import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Make a random ID (like MongoDB's _id)
function generateId() {
  return randomBytes(12).toString('hex');
}

// Read the database file
function loadDB() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const empty = { users: [], sites: [] };
      fs.writeFileSync(DB_FILE, JSON.stringify(empty, null, 2), 'utf-8');
      return empty;
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch (err) {
    console.warn('Could not read db.json, starting fresh:', err.message);
    return { users: [], sites: [] };
  }
}

// Write to the database file
function saveDB(data) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Could not save db.json:', err.message);
  }
}

// Add .save() and .checkAndIncrementQuota() methods to a user object
function makeUserDoc(raw) {
  if (!raw) return null;

  const doc = { ...raw };

  // Save any changes to this user back to the file
  doc.save = async function () {
    const db = loadDB();
    const idx = db.users.findIndex((u) => u._id === doc._id);
    if (idx !== -1) {
      db.users[idx] = { ...doc };
      // Remove the methods before saving to JSON file
      delete db.users[idx].save;
      delete db.users[idx].checkAndIncrementQuota;
      saveDB(db);
    }
    return doc;
  };

  // Check if user can still generate today, and if yes increment their count
  doc.checkAndIncrementQuota = function (maxQuota = 5) {
    const today = new Date().toISOString().split('T')[0];

    // New day? Reset the counter
    if (doc.lastGenerationDate !== today) {
      doc.generationsToday = 0;
      doc.lastGenerationDate = today;
    }

    if (doc.generationsToday >= maxQuota) {
      return { allowed: false, remaining: 0, generationsToday: doc.generationsToday, maxQuota };
    }

    doc.generationsToday += 1;
    return { allowed: true, remaining: maxQuota - doc.generationsToday, generationsToday: doc.generationsToday, maxQuota };
  };

  return doc;
}

// Add .save() method to a site object
function makeSiteDoc(raw) {
  if (!raw) return null;

  const doc = { ...raw };

  doc.save = async function () {
    const db = loadDB();
    const idx = db.sites.findIndex((s) => s._id === doc._id);
    if (idx !== -1) {
      doc.updatedAt = new Date().toISOString();
      db.sites[idx] = { ...doc };
      delete db.sites[idx].save; // Don't store methods in the file
      saveDB(db);
    }
    return doc;
  };

  return doc;
}

// ========================
// USER STORE
// ========================
export const localUserStore = {
  // Find one user matching a query object like { email: '...' }
  async findOne(query) {
    const db = loadDB();
    const found = db.users.find((u) => {
      return Object.keys(query).every((key) => u[key] === query[key]);
    });
    return makeUserDoc(found);
  },

  // Find a user by their ID. Returns null if not found.
  // Supports optional .select('-passwordHash') to hide the password
  findById(id) {
    const db = loadDB();
    const found = db.users.find((u) => u._id === id?.toString());
    let doc = makeUserDoc(found);

    // Return a promise-like object that also supports .select()
    const result = Promise.resolve(doc);
    result.select = function (fields) {
      if (doc && fields && fields.includes('-passwordHash')) {
        const copy = { ...doc };
        delete copy.passwordHash;
        // Keep the methods on the copy
        copy.save = doc.save;
        copy.checkAndIncrementQuota = doc.checkAndIncrementQuota;
        return Promise.resolve(copy);
      }
      return Promise.resolve(doc);
    };

    return result;
  },

  // Create a new user and save to the file
  async create(data) {
    const db = loadDB();

    // Check for duplicates
    if (db.users.find((u) => u.email === data.email)) {
      const err = new Error('Email already in use.');
      err.code = 11000;
      throw err;
    }
    if (db.users.find((u) => u.username === data.username)) {
      const err = new Error('Username already taken.');
      err.code = 11000;
      throw err;
    }

    const newUser = {
      _id: generateId(),
      name: data.name,
      email: data.email,
      username: data.username,
      passwordHash: data.passwordHash,
      generationsToday: 0,
      lastGenerationDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDB(db);
    return makeUserDoc(newUser);
  },

  // Delete a user by ID
  async findByIdAndDelete(id) {
    const db = loadDB();
    const idx = db.users.findIndex((u) => u._id === id?.toString());
    if (idx !== -1) {
      const [deleted] = db.users.splice(idx, 1);
      saveDB(db);
      return deleted;
    }
    return null;
  }
};

// ========================
// SITE STORE
// ========================
export const localSiteStore = {
  // Find all sites matching a query, sorted newest first
  async find(query) {
    const db = loadDB();
    const matches = db.sites
      .filter((s) => Object.keys(query).every((key) => s[key]?.toString() === query[key]?.toString()))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .map(makeSiteDoc);
    return matches;
  },

  // Find one site matching a query, sorted newest first
  async findOne(query) {
    const db = loadDB();
    const sorted = db.sites.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const found = sorted.find((s) =>
      Object.keys(query).every((key) => s[key]?.toString() === query[key]?.toString())
    );
    return makeSiteDoc(found);
  },

  // Create a new site and save to the file
  async create(data) {
    const db = loadDB();
    const now = new Date().toISOString();

    const newSite = {
      _id: generateId(),
      userId: data.userId?.toString(),
      title: data.title || 'My Portfolio',
      draft: data.draft,
      published: data.published || null,
      isPublished: !!data.isPublished,
      publishedAt: data.publishedAt || null,
      schemaVersion: data.schemaVersion || 1,
      createdAt: now,
      updatedAt: now
    };

    db.sites.push(newSite);
    saveDB(db);
    return makeSiteDoc(newSite);
  },

  // Find one site and delete it
  async findOneAndDelete(query) {
    const db = loadDB();
    const idx = db.sites.findIndex((s) =>
      Object.keys(query).every((key) => s[key]?.toString() === query[key]?.toString())
    );
    if (idx !== -1) {
      const [deleted] = db.sites.splice(idx, 1);
      saveDB(db);
      return deleted;
    }
    return null;
  },

  // Delete all sites belonging to a user (used when deleting account)
  async deleteMany(query) {
    const db = loadDB();
    const before = db.sites.length;
    db.sites = db.sites.filter((s) =>
      !Object.keys(query).every((key) => s[key]?.toString() === query[key]?.toString())
    );
    saveDB(db);
    return { deletedCount: before - db.sites.length };
  }
};
