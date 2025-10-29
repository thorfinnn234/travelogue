// app/store/bookmarksStore.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useBookmarksStore = create(
  persist(
    (set, get) => ({
      saved: {}, // { [postId]: true }
      toggle(postId) {
        const cur = { ...get().saved };
        if (cur[postId]) delete cur[postId];
        else cur[postId] = true;
        set({ saved: cur });
      },
      isSaved(postId) {
        return !!get().saved[postId];
      },
      clear() { set({ saved: {} }); },
    }),
    {
      name: "bookmarks:v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ saved: s.saved }),
    }
  )
);
