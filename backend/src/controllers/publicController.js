import { User } from '../models/User.js';
import { Site } from '../models/Site.js';

export async function getPublicSite(req, res, next) {
  try {
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({ error: 'Username is required.' });
    }

    const cleanUsername = username.toLowerCase().trim();
    const user = await User.findOne({ username: cleanUsername });

    if (!user) {
      return res.status(404).json({ error: `Portfolio not found for user "${cleanUsername}".` });
    }

    // Find the published site
    const site = await Site.findOne({ userId: user._id, isPublished: true }).sort({ publishedAt: -1 });

    if (!site || !site.published) {
      return res.status(404).json({
        error: `User @${cleanUsername} has not published a portfolio yet.`
      });
    }

    res.json({
      user: {
        name: user.name,
        username: user.username
      },
      title: site.title,
      publishedAt: site.publishedAt,
      site: site.published
    });
  } catch (error) {
    next(error);
  }
}
