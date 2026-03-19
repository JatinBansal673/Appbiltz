export const fetchUserData = async (username) => {
  const res = await fetch(`https://api.github.com/users/${username}`);
  if (!res.ok) throw new Error("User not found");
  return res.json();
};

export const fetchUserRepos = async (username, page) => {
  const res = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=100&page=${page}`
  );
  if (!res.ok) throw new Error("Failed to fetch repos");
  return res.json();
};

export const fetchUserCommits = async (username, repos) => {
  const commitPromises = repos.map(async (repo) => {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${username}/${repo.name}/commits?per_page=1`
      );
      if (!res.ok) return { repo: repo.name, commits: 0 };
      const linkHeader = res.headers.get("Link");
      let count = 1;
      if (linkHeader) {
        const match = linkHeader.match(/page=(\d+)>; rel="last"/);
        if (match) count = parseInt(match[1], 10);
      }
      return { repo: repo.name, commits: count };
    } catch {
      return { repo: repo.name, commits: 0 };
    }
  });
  return Promise.all(commitPromises);
};
