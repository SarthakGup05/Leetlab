// updated ProblemTable.jsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useAuthStore } from "../store/userAAuth";
import { Link } from "react-router-dom";
import {
  Bookmark,
  PencilIcon,
  TrashIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { usePlaylistStore } from "../store/Playliststore";

const ProblemTable = ({ problems }) => {
  const { authUser } = useAuthStore();
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("ALL");
  const [selectedTag, setSelectedTag] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProblemId, setSelectedProblemId] = useState(null);
  const dropdownRef = useRef(null);

  const {
    playlists,
    fetchUserPlaylists,
    createNewPlaylist,
    deletePlaylist,
    addProblemToPlaylist,
  } = usePlaylistStore();

  useEffect(() => {
    if (authUser?.id) fetchUserPlaylists();
  }, [authUser]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setSelectedProblemId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return toast.error("Enter a playlist name");
    try {
      await createNewPlaylist({
        name: newPlaylistName,
        description: newPlaylistDescription,
        userId: authUser.id,
      });
      toast.success("Playlist created");
      setNewPlaylistName("");
      setNewPlaylistDescription("");
      setShowCreateModal(false);
      fetchUserPlaylists();
    } catch (err) {
      toast.error("Failed to create playlist");
    }
  };

  const handleAddToPlaylist = async (playlistId, problemId) => {
    try {
      await addProblemToPlaylist({ playlistId, problemId });
      toast.success("Added to playlist");
      setSelectedProblemId(null);
    } catch (err) {
      toast.error("Failed to add to playlist");
    }
  };

  const handleDeletePlaylist = async (id) => {
    try {
      await deletePlaylist(id);
      toast.success("Playlist deleted");
      fetchUserPlaylists();
    } catch (err) {
      toast.error("Failed to delete playlist");
    }
  };

  const allTags = useMemo(() => {
    if (!Array.isArray(problems)) return [];
    const tagsSet = new Set();
    problems.forEach((p) => p.tags?.forEach((t) => tagsSet.add(t)));
    return Array.from(tagsSet);
  }, [problems]);

  const difficulties = ["EASY", "MEDIUM", "HARD"];
  const itemsPerPage = 5;

  const filteredProblems = useMemo(() => {
    return (problems || [])
      .filter((problem) =>
        problem.title.toLowerCase().includes(search.toLowerCase())
      )
      .filter((problem) =>
        difficulty === "ALL" ? true : problem.difficulty === difficulty
      )
      .filter((problem) =>
        selectedTag === "ALL" ? true : problem.tags?.includes(selectedTag)
      );
  }, [problems, search, difficulty, selectedTag]);

  const totalPages = Math.ceil(filteredProblems.length / itemsPerPage);
  const paginatedProblems = useMemo(() => {
    return filteredProblems.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredProblems, currentPage]);

  const handleDelete = (id) => {
    console.log("Delete problem:", id);
    // TODO: integrate delete API
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-10 px-2 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold">Problems</h2>
        <button
          className="btn btn-primary gap-2"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="w-4 h-4" />
          Create Playlist
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by title"
          className="input input-bordered w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="select select-bordered w-full"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="ALL">All Difficulties</option>
          {difficulties.map((diff) => (
            <option key={diff} value={diff}>
              {diff}
            </option>
          ))}
        </select>
        <select
          className="select select-bordered w-full"
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
        >
          <option value="ALL">All Tags</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Solved</th>
              <th>Title</th>
              <th>Tags</th>
              <th>Difficulty</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProblems.length ? (
              paginatedProblems.map((problem) => {
                const isSolved = problem.solvedBy?.some(
                  (u) => u.userId === authUser?.id
                );
                return (
                  <tr key={problem.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isSolved}
                        readOnly
                        className="checkbox checkbox-sm"
                      />
                    </td>
                    <td>
                      <Link
                        to={`/problem/${problem.id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {problem.title}
                      </Link>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {problem.tags?.map((tag, i) => (
                          <span key={i} className="badge badge-warning badge-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge text-white font-bold badge-sm ${
                          problem.difficulty === "EASY"
                            ? "badge-success"
                            : problem.difficulty === "MEDIUM"
                            ? "badge-warning"
                            : "badge-error"
                        }`}
                      >
                        {problem.difficulty}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
                        {authUser?.role === "ADMIN" && (
                          <>
                            <button
                              onClick={() => handleDelete(problem.id)}
                              className="btn btn-sm btn-error"
                            >
                              <TrashIcon className="w-4 h-4 text-white" />
                            </button>
                            <button disabled className="btn btn-sm btn-warning">
                              <PencilIcon className="w-4 h-4 text-white" />
                            </button>
                          </>
                        )}
                        <div ref={dropdownRef} className="dropdown dropdown-hover">
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => setSelectedProblemId(problem.id)}
                          >
                            <Bookmark className="w-4 h-4" />
                            <span className="hidden sm:inline">Save</span>
                          </button>
                          {selectedProblemId === problem.id && (
                            <ul className="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-52 z-30">
                              {playlists.map((p) => (
                                <li key={p.id} className="flex justify-between items-center">
                                  <button
                                    className="w-full text-left"
                                    onClick={() => handleAddToPlaylist(p.id, problem.id)}
                                  >
                                    {p.name}
                                  </button>
                                  {(authUser?.role === "ADMIN" ||
                                    p.userId === authUser?.id) && (
                                    <X
                                      className="text-red-500 cursor-pointer w-4 h-4 ml-2"
                                      onClick={() => handleDeletePlaylist(p.id)}
                                    />
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  No problems found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-2">
          <button
            className="btn btn-sm btn-outline"
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>
          <span className="btn btn-sm btn-ghost">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-sm btn-outline"
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-black p-6 rounded-lg w-full max-w-sm shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-white">Create New Playlist</h3>
            <input
              type="text"
              className="input input-bordered w-full mb-4"
              placeholder="Enter playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
            />
            <textarea
              className="textarea textarea-bordered w-full mb-4"
              placeholder="Enter playlist description"
              value={newPlaylistDescription}
              onChange={(e) => setNewPlaylistDescription(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleCreatePlaylist}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemTable;
