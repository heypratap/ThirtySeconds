import mongoose from 'mongoose';
import { isDbConnected } from '../config/db.js';
import { localUserStore } from './localStore.js';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      index: true
    },
    generationsToday: {
      type: Number,
      default: 0
    },
    lastGenerationDate: {
      type: String, // Stored as YYYY-MM-DD
      default: () => new Date().toISOString().split('T')[0]
    }
  },
  {
    timestamps: true
  }
);

// Method to check and update daily generation quota
UserSchema.methods.checkAndIncrementQuota = function (maxQuota = 5) {
  const today = new Date().toISOString().split('T')[0];

  if (this.lastGenerationDate !== today) {
    this.generationsToday = 0;
    this.lastGenerationDate = today;
  }

  if (this.generationsToday >= maxQuota) {
    return {
      allowed: false,
      remaining: 0,
      generationsToday: this.generationsToday,
      maxQuota
    };
  }

  this.generationsToday += 1;
  return {
    allowed: true,
    remaining: maxQuota - this.generationsToday,
    generationsToday: this.generationsToday,
    maxQuota
  };
};

const MongooseUser = mongoose.models.User || mongoose.model('User', UserSchema);

// Smart Dual-Mode Export: Uses MongoDB when connected, or local persistence when offline
export const User = new Proxy(MongooseUser, {
  get(target, prop) {
    if (isDbConnected()) {
      return target[prop];
    }
    if (prop in localUserStore) {
      return localUserStore[prop];
    }
    return target[prop];
  }
});
