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

  useEffect(() => {
    const stored = localStorage.getItem('githubProfile');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUserData(parsed.userData);
      setRepos(parsed.repos);
      setCommits(parsed.commits);
    }
  }, []);

  useEffect(() => {
    if (userData) {
      localStorage.setItem(
        'githubProfile',
        JSON.stringify({ userData, repos, commits })
      );
    }
  }, [userData, repos, commits]);

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
    <div className="flex flex-col gap-4 mb-8 p-6 w-screen md:w-fit">

      <h2 className="text-2xl font-bold">GitHub Profile</h2>

      {/* Search */}
      <div className="flex gap-5">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter GitHub username"
          className="border border-[#d1d5db] rounded-md p-2 text-sm w-64 bg-[#ffffff] text-[#1a1a2e] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all"
        />

        <button
          onClick={() => {
            setPage(1);
            handleFetch();
          }}
          disabled={loading}
          className="bg-[#3b82f6] hover:bg-[#2563eb] text-[#ffffff] px-5 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Fetching..." : "Fetch Profile"}
        </button>
      </div>

      {error && <p className="text-[#ef4444] text-sm font-medium">{error}</p>}

      {userData && (
        <div>

          {/* Profile */}
          <div className="mb-6 p-5 rounded-xl border border-[#e5e7eb]">
            <h3 className="text-xl font-semibold mb-3">
              {userData.name || userData.login}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#ffffff] rounded-lg p-3 border border-[#e5e7eb] text-center">
                <p className="text-xs text-[#6b7280] uppercase tracking-wide">Followers</p>
                <p className="text-lg font-bold text-[#1a1a2e]">{userData.followers}</p>
              </div>
              <div className="bg-[#ffffff] rounded-lg p-3 border border-[#e5e7eb] text-center">
                <p className="text-xs text-[#6b7280] uppercase tracking-wide">Public Repos</p>
                <p className="text-lg font-bold text-[#1a1a2e]">{userData.public_repos}</p>
              </div>
              <div className="bg-[#ffffff] rounded-lg p-3 border border-[#e5e7eb] text-center">
                <p className="text-xs text-[#6b7280] uppercase tracking-wide">Total Stars</p>
                <p className="text-lg font-bold text-[#f59e0b]">{totalStars}</p>
              </div>
              <div className="bg-[#ffffff] rounded-lg p-3 border border-[#e5e7eb] text-center">
                <p className="text-xs text-[#6b7280] uppercase tracking-wide">Total Commits</p>
                <p className="text-lg font-bold text-[#10b981]">{totalCommits}</p>
              </div>
            </div>
          </div>

          {/* Repo Cards */}
          <h4 className="text-lg font-semibold mb-3">
            Repositories & Commits
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-[80vw] mx-auto mb-8">
            {commits.map((commit) => (
              <div
                key={commit.repo}
                className="flex flex-col border border-[#e5e7eb] p-4 rounded-lg bg-[#ffffff] hover:shadow-md hover:border-[#3b82f6] transition-all"
              >
                <strong className="text-sm font-semibold text-[#1a1a2e] truncate">{commit.repo}</strong>
                <p className="text-xs text-[#6b7280] mt-1">Commits: <span className="font-medium text-[#1a1a2e]">{commit.commits}</span></p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 border rounded-md text-sm font-medium transition-colors ${
                  page === i + 1
                    ? "bg-[#3b82f6] text-[#ffffff] border-[#3b82f6]"
                    : "bg-[#ffffff] text-[#374151] border-[#d1d5db] hover:bg-[#f3f4f6]"
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
