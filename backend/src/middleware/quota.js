export async function checkGenerationQuota(req, res, next) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'User authentication required for AI generations.' });
    }

    const quotaResult = user.checkAndIncrementQuota(5);

    if (!quotaResult.allowed) {
      return res.status(429).json({
        error: 'Daily generation quota exceeded',
        message: 'You have used all 5 free AI generations for today. Quota resets at midnight.',
        generationsToday: quotaResult.generationsToday,
        remaining: 0
      });
    }

  
    await user.save();
    req.quotaRemaining = quotaResult.remaining;
    next();
  } catch (error) {
    next(error);
  }
}
