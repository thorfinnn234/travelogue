// app/store/commentsStore.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

const nowIso = () => new Date().toISOString();

export const useCommentsStore = create(
  persist(
    (set, get) => ({
      // commentsByPost: { [postId]: [{ id, authorName, authorAvatar, body, createdAt }] }
      commentsByPost: {},

      getFor(postId) {
        return get().commentsByPost[postId] || [];
      },

      add(postId, comment) {
        const map = { ...get().commentsByPost };
        const arr = map[postId] ? [...map[postId]] : [];
        const row = {
          id: String(Date.now()),
          authorName: comment.authorName || "You",
          authorAvatar: comment.authorAvatar || "https://i.pravatar.cc/150?u=you",
          body: comment.body?.trim() || "",
          createdAt: nowIso(),
        };
        arr.unshift(row); // newest first
        map[postId] = arr;
        set({ commentsByPost: map });
        return row;
      },

      remove(postId, id) {
        const map = { ...get().commentsByPost };
        map[postId] = (map[postId] || []).filter((c) => c.id !== id);
        set({ commentsByPost: map });
      },

      clearPost(postId) {
        const map = { ...get().commentsByPost };
        delete map[postId];
        set({ commentsByPost: map });
      },
    }),
    {
      name: "comments:v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ commentsByPost: s.commentsByPost }),
    }
  )
);
