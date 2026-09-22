import { extractTextFromPdf } from '../services/pdf.js';
import { fetchGitHubData } from '../services/github.js';
import {
  generateSiteFromPrompt,
  extractProfileFromInputs,
  generateSiteFromProfile,
  refineSite
} from '../services/generator.js';
import { Site } from '../models/Site.js';

export async function generatePrompt(req, res, next) {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({ error: 'Please provide a prompt describing your portfolio.' });
    }

    const siteDocument = await generateSiteFromPrompt(prompt.trim());

    res.json({
      success: true,
      site: siteDocument,
      quotaRemaining: req.quotaRemaining
    });
  } catch (error) {
    next(error);
  }
}

export async function extractProfile(req, res, next) {
  try {
    const { githubUsername, pastedText } = req.body;
    let pdfText = '';

    // If PDF was uploaded
    if (req.file) {
      try {
        pdfText = await extractTextFromPdf(req.file.buffer);
      } catch (pdfErr) {
        console.warn('PDF extraction warning:', pdfErr.message);
      }
    }

    // If GitHub username was provided
    let githubData = null;
    if (githubUsername && githubUsername.trim()) {
      try {
        githubData = await fetchGitHubData(githubUsername.trim());
      } catch (ghErr) {
        console.warn('GitHub fetch warning:', ghErr.message);
      }
    }

    if (!pdfText && !githubData && (!pastedText || !pastedText.trim())) {
      return res.status(400).json({
        error: 'Please provide at least one source of information: a resume PDF, GitHub username, or bio text.'
      });
    }

    const profile = await extractProfileFromInputs({
      pdfText,
      githubData,
      pastedText: pastedText || ''
    });

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    next(error);
  }
}

export async function generateFromProfile(req, res, next) {
  try {
    const { profile, stylePrompt } = req.body;

    if (!profile || typeof profile !== 'object') {
      return res.status(400).json({ error: 'Valid confirmed profile object is required.' });
    }

    const siteDocument = await generateSiteFromProfile(profile, stylePrompt || 'clean, modern, minimal');

    res.json({
      success: true,
      site: siteDocument,
      quotaRemaining: req.quotaRemaining
    });
  } catch (error) {
    next(error);
  }
}

export async function refine(req, res, next) {
  try {
    const { siteId, siteJson, instruction } = req.body;

    if (!instruction || !instruction.trim()) {
      return res.status(400).json({ error: 'Instruction text is required to refine the site.' });
    }

    let currentSite = siteJson;
    if (!currentSite && siteId) {
      const siteDoc = await Site.findOne({ _id: siteId, userId: req.user._id });
      if (siteDoc) {
        currentSite = siteDoc.draft;
      }
    }

    if (!currentSite) {
      return res.status(400).json({ error: 'Current site document is required for refinement.' });
    }

    const updatedSite = await refineSite(currentSite, instruction.trim());

    res.json({
      success: true,
      site: updatedSite,
      quotaRemaining: req.quotaRemaining
    });
  } catch (error) {
    next(error);
  }
}
