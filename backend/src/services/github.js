/**
 * Fetches public profile and top repositories for a GitHub username
 * @param {string} username - GitHub username
 * @returns {Promise<{ profile: object, repos: Array<object> }>}
 */
export async function fetchGitHubData(username) {
  if (!username || typeof username !== 'string') {
    throw new Error('Valid GitHub username is required');
  }

  const cleanUsername = username.trim().replace(/^@/, '');
  const headers = {
    'User-Agent': 'Thirty-Seconds-Portfolio-Builder'
  };

  try {
    // 1. Fetch user profile
    const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`, { headers });
    if (!userRes.ok) {
      if (userRes.status === 404) {
        throw new Error(`GitHub user "${cleanUsername}" not found.`);
      }
      throw new Error(`GitHub API error: ${userRes.statusText}`);
    }
    const userData = await userRes.json();

    // 2. Fetch top public repos (sorted by updated or stars)
    const reposRes = await fetch(
      `https://api.github.com/users/${encodeURIComponent(cleanUsername)}/repos?sort=updated&per_page=8`,
      { headers }
    );
    const reposData = reposRes.ok ? await reposRes.json() : [];

    const simplifiedRepos = Array.isArray(reposData)
      ? reposData
          .filter((repo) => !repo.fork) // Prefer non-forks
          .slice(0, 6)
          .map((repo) => ({
            name: repo.name,
            description: repo.description || 'Open source project on GitHub',
            language: repo.language || 'Code',
            stars: repo.stargazers_count,
            html_url: repo.html_url,
            homepage: repo.homepage || ''
          }))
      : [];

    return {
      profile: {
        name: userData.name || userData.login,
        login: userData.login,
        bio: userData.bio || '',
        avatar_url: userData.avatar_url,
        company: userData.company || '',
        location: userData.location || '',
        blog: userData.blog || '',
        public_repos: userData.public_repos
      },
      repos: simplifiedRepos
    };
  } catch (error) {
    console.error('GitHub fetch error:', error.message);
    throw error;
  }
}
