import { create } from "zustand";
import { axiosInstance } from "../utils/Axios"; // adjust as needed
import toast from "react-hot-toast"; // make sure you have this

export const usePlaylistStore = create((set, get) => ({
  playlists: [],
  selectedPlaylistId: "",
  loading: false,
  error: null,

  // Set selected playlist
  setSelectedPlaylistId: (id) => set({ selectedPlaylistId: id }),

  // Reset the store (useful on logout or unmount)
  reset: () =>
    set({
      playlists: [],
      selectedPlaylistId: "",
      loading: false,
      error: null,
    }),

  // ✅ GET /playlist
  fetchUserPlaylists: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get("/playlist");
      set({ playlists: res.data.playlists });
    } catch (err) {
      console.error("Failed to fetch playlists", err);
      toast.error("Failed to load playlists.");
      set({ error: "Failed to load playlists." });
    } finally {
      set({ loading: false });
    }
  },

  // ✅ POST /playlist/create-playlist
createNewPlaylist: async ({ name, description, userId }) => {
  try {
    const res = await axiosInstance.post("/playlist/create-playlist", {
      name,
      description,
      userId,
    });
    set((state) => ({
      playlists: [...state.playlists, res.data],
    }));
  } catch (err) {
    console.error("Failed to create playlist", err);
  }
},


  // ✅ POST /playlist/:playlistId/add-problem
  addProblem: async (playlistId, problemId) => {
    try {
      const state = get();
      const playlist = state.playlists.find((p) => p.id === playlistId);
      const alreadyExists = playlist?.problems?.some(
        (prob) => prob.id === problemId
      );

      if (alreadyExists) {
        toast("Problem already in playlist.");
        return false;
      }

      await axiosInstance.post(`/playlist/${playlistId}/add-problem`, {
        problemIds: [problemId],
      });

      toast.success("Problem added to playlist!");
      return true;
    } catch (err) {
      console.error("Failed to add problem", err);
      toast.error("Failed to add problem.");
      return false;
    }
  },

  // ✅ DELETE /playlist/:playlistId/remove-problem
  removeProblem: async (playlistId, problemId) => {
    try {
      await axiosInstance.delete(`/playlist/${playlistId}/remove-problem`, {
        data: {
          problemIds: [problemId],
        },
      });

      toast.success("Problem removed from playlist.");
      return true;
    } catch (err) {
      console.error("Failed to remove problem", err);
      toast.error("Failed to remove problem.");
      return false;
    }
  },

  // ✅ DELETE /playlist/:playlistId
  deletePlaylist: async (playlistId) => {
    try {
      await axiosInstance.delete(`/playlist/${playlistId}`);
      set((state) => ({
        playlists: state.playlists.filter((p) => p.id !== playlistId),
      }));

      // Clear selected ID if the deleted one was selected
      if (get().selectedPlaylistId === playlistId) {
        set({ selectedPlaylistId: "" });
      }

      toast.success("Playlist deleted successfully!");
      return true;
    } catch (err) {
      console.error("Failed to delete playlist", err);
      toast.error("Error deleting playlist.");
      return false;
    }
  },
}));
