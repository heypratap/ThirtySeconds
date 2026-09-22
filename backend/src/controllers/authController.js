import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Site } from '../models/Site.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_thirty_seconds_2025';

export async function register(req, res, next) {
  try {
    const { name, email, password, username } = req.body;

    if (!name || !email || !password || !username) {
      return res.status(400).json({ error: 'Please provide all required fields (name, email, password, username).' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');

    if (cleanUsername.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 alphanumeric characters.' });
    }

    // Check if email or username already exists
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const existingUsername = await User.findOne({ username: cleanUsername });
    if (existingUsername) {
      return res.status(400).json({ error: 'This username is already taken. Please choose another.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      username: cleanUsername,
      passwordHash
    });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Account registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        generationsToday: user.generationsToday,
        remainingGenerations: 5 - user.generationsToday
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    // Sync the quota date without using a generation.
    const today = new Date().toISOString().split('T')[0];
    if (user.lastGenerationDate !== today) {
      user.generationsToday = 0;
      user.lastGenerationDate = today;
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        generationsToday: user.generationsToday,
        remainingGenerations: Math.max(0, 5 - user.generationsToday)
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = req.user;
    const today = new Date().toISOString().split('T')[0];
    if (user.lastGenerationDate !== today) {
      user.generationsToday = 0;
      user.lastGenerationDate = today;
      await user.save();
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        generationsToday: user.generationsToday,
        remainingGenerations: Math.max(0, 5 - user.generationsToday)
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAccount(req, res, next) {
  try {
    const userId = req.user._id;

    // Delete all sites created by user
    await Site.deleteMany({ userId });
    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Your account and all associated sites have been deleted.' });
  } catch (error) {
    next(error);
  }
}
