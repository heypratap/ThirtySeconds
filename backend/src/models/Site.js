import mongoose from 'mongoose';
import { isDbConnected } from '../config/db.js';
import { localSiteStore } from './localStore.js';

const SiteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      default: 'My Portfolio',
      maxlength: 120
    },
    draft: {
      type: Object, // Validated site JSON block tree
      required: true
    },
    published: {
      type: Object, // Published site JSON snapshot, null until published
      default: null
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    publishedAt: {
      type: Date,
      default: null
    },
    schemaVersion: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

const MongooseSite = mongoose.models.Site || mongoose.model('Site', SiteSchema);

// Smart Dual-Mode Export: Uses MongoDB when connected, or local persistence when offline
export const Site = new Proxy(MongooseSite, {
  get(target, prop) {
    if (isDbConnected()) {
      return target[prop];
    }
    if (prop in localSiteStore) {
      return localSiteStore[prop];
    }
    return target[prop];
  }
});
