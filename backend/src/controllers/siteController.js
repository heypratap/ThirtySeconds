import { Site } from '../models/Site.js';
import { validateSite, getDefaultBlock } from '../schema/siteSchema.js';

export async function listSites(req, res, next) {
  try {
    const sites = await Site.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json({ sites });
  } catch (error) {
    next(error);
  }
}

export async function createSite(req, res, next) {
  try {
    const { title, draft } = req.body;

    let initialDraft = draft;
    if (!initialDraft) {
      initialDraft = {
        schemaVersion: 1,
        theme: {
          mode: 'light',
          primaryColor: '#E43D12',
          fontFamily: 'Space Grotesk',
          radius: 'md'
        },
        blocks: [getDefaultBlock('hero'), getDefaultBlock('about'), getDefaultBlock('projects'), getDefaultBlock('contact')]
      };
    }

    const validation = validateSite(initialDraft);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid site block structure',
        details: validation.errors
      });
    }

    const newSite = await Site.create({
      userId: req.user._id,
      title: title || 'My Portfolio',
      draft: validation.data,
      published: null,
      isPublished: false
    });

    res.status(201).json({
      message: 'Site created successfully',
      site: newSite
    });
  } catch (error) {
    next(error);
  }
}

export async function getSite(req, res, next) {
  try {
    const site = await Site.findOne({ _id: req.params.id, userId: req.user._id });
    if (!site) {
      return res.status(404).json({ error: 'Site not found.' });
    }
    res.json({ site });
  } catch (error) {
    next(error);
  }
}

export async function updateDraft(req, res, next) {
  try {
    const { draft, title } = req.body;

    if (!draft) {
      return res.status(400).json({ error: 'Draft JSON document is required.' });
    }

    // Always validate with Zod before saving
    const validation = validateSite(draft);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Draft failed validation against Zod schema.',
        details: validation.errors
      });
    }

    const site = await Site.findOne({ _id: req.params.id, userId: req.user._id });
    if (!site) {
      return res.status(404).json({ error: 'Site not found.' });
    }

    site.draft = validation.data;
    if (title && typeof title === 'string') {
      site.title = title.trim();
    }

    await site.save();

    res.json({
      message: 'Draft saved successfully',
      site
    });
  } catch (error) {
    next(error);
  }
}

export async function publishSite(req, res, next) {
  try {
    const site = await Site.findOne({ _id: req.params.id, userId: req.user._id });
    if (!site) {
      return res.status(404).json({ error: 'Site not found.' });
    }

    // Copy latest draft to published snapshot
    site.published = JSON.parse(JSON.stringify(site.draft));
    site.isPublished = true;
    site.publishedAt = new Date();

    await site.save();

    res.json({
      message: 'Site published successfully! It is now live.',
      site,
      publicUrl: `/p/${req.user.username}`
    });
  } catch (error) {
    next(error);
  }
}

export async function unpublishSite(req, res, next) {
  try {
    const site = await Site.findOne({ _id: req.params.id, userId: req.user._id });
    if (!site) {
      return res.status(404).json({ error: 'Site not found.' });
    }

    site.isPublished = false;
    await site.save();

    res.json({
      message: 'Site unpublished successfully.',
      site
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteSite(req, res, next) {
  try {
    const result = await Site.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!result) {
      return res.status(404).json({ error: 'Site not found.' });
    }

    res.json({ message: 'Site deleted successfully.' });
  } catch (error) {
    next(error);
  }
}
