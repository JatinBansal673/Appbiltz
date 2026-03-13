import axios from "axios";

// Fetch user profile
export const fetchUserData = async (username) => {
  try {
    const response = await axios.get(
      `https://api.github.com/users/${username}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

// Fetch repos with pagination
export const fetchUserRepos = async (username, page = 1) => {
  try {
    const response = await axios.get(
      `https://api.github.com/users/${username}/repos`,
      {
        params: {
          per_page: 100,
          page: page,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching repos:", error);
    throw error;
  }
};

// Fetch commit counts per repo
export const fetchUserCommits = async (username, userRepos) => {
  try {
    const commitPromises = userRepos.map(async (repo) => {
      try {
        const response = await axios.get(
          `https://api.github.com/repos/${username}/${repo.name}/commits`
        );

        return {
          repo: repo.name,
          commits: response.data.length,
        };
      } catch (error) {
        if (
          error.response?.status === 404 ||
          error.response?.status === 409
        ) {
          return {
            repo: repo.name,
            commits: 0,
          };
        }

        console.error(`Error fetching commits for ${repo.name}:`, error);
        return {
          repo: repo.name,
          commits: 0,
        };
      }
    });

    return await Promise.all(commitPromises);
  } catch (error) {
    console.error("Error fetching commits:", error);
    throw error;
  }
};