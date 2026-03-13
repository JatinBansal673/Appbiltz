import React, { useState, useEffect } from "react";
import {
  fetchUserCommits,
  fetchUserData,
  fetchUserRepos,
} from "../services/GithubAPI";

const GithubProfile = () => {
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState(null);
  const [repos, setRepos] = useState([]);
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleFetch = async () => {
    if (!username) return;

    setLoading(true);
    setError("");

    try {
      const user = await fetchUserData(username);
      setUserData(user);

      const pages = Math.ceil(user.public_repos / 100);
      setTotalPages(pages);

      const userRepos = await fetchUserRepos(username, page);
      const userCommits = await fetchUserCommits(username, userRepos);

      setRepos(userRepos);
      setCommits(userCommits);
    } catch (err) {
      setError("Failed to fetch data. Check username.");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (username) {
      handleFetch();
    }
  }, [page]);

  const totalStars = repos.reduce(
    (sum, repo) => sum + repo.stargazers_count,
    0
  );

  const totalCommits = commits.reduce(
    (sum, c) => sum + c.commits,
    0
  );

  return (
    <div className="flex flex-col gap-4 mb-8">

      <h2 className="text-2xl font-bold">GitHub Profile</h2>

      {/* Search */}
      <div className="flex gap-5">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter GitHub username"
          className="border rounded-md p-2"
        />

        <button
          onClick={() => {
            setPage(1);
            handleFetch();
          }}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {loading ? "Fetching..." : "Fetch Profile"}
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {userData && (
        <div>

          {/* Profile */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold">
              {userData.name || userData.login}
            </h3>

            <p>Followers: {userData.followers}</p>
            <p>Public Repos: {userData.public_repos}</p>
            <p>Total Stars: {totalStars}</p>
            <p>Total Commits: {totalCommits}</p>
          </div>

          {/* Repo Cards */}
          <h4 className="text-lg font-semibold mb-3">
            Repositories & Commits
          </h4>

          <div className="grid grid-cols-4 gap-4 max-w-[80vw] mx-auto mb-8">
            {commits.map((commit) => (
              <div
                key={commit.repo}
                className="flex flex-col border p-4 rounded"
              >
                <strong>{commit.repo}</strong>
                <p>Commits: {commit.commits}</p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 border rounded ${
                  page === i + 1
                    ? "bg-blue-500 text-white"
                    : ""
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

        </div>
      )}
    </div>
  );
};

export default GithubProfile;