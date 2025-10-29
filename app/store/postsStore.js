// app/store/postsStore.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Helpers
const avatar = (seed) => `https://i.pravatar.cc/150?img=${(seed % 70) + 1}`;
const timeAgoISO = (h) => new Date(Date.now() - h * 3600 * 1000).toISOString();
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const DESTINATIONS = [
  "Paris, France","Tokyo, Japan","Santorini, Greece","Lagos, Nigeria",
  "Cape Town, South Africa","New York, USA","Marrakesh, Morocco","Bali, Indonesia",
  "Reykjavík, Iceland","Sydney, Australia","Rome, Italy","Dubai, UAE",
];
const CAPTIONS = [
  "Sunrise hikes are undefeated.","Street food >>> fancy restaurants.",
  "Solo trip that didn’t feel solo ✨","Views that don’t fit in frame.",
  "One more stamp, one more story.","Lost the map, found a memory.",
  "Chasing light, catching smiles.","If coffee is a love language, I’m fluent.",
  "Notes from a moving train 🚆","Skies knew my name today.",
];
// primary and fallback photos
const photo = (seed) => `https://picsum.photos/seed/travel-${seed}/1080/1350`;
const fallbackPhoto = (seed) => `https://source.unsplash.com/random/1080x1350/?travel,city,nature&sig=${seed}`;

function makeDemo(n = 12) {
  return Array.from({ length: n }, (_, i) => {
    const idx = i + 1;
    return {
      id: String(idx),
      user: { name: `Traveler ${idx}`, avatar: avatar(idx + 7) },
      location: DESTINATIONS[idx % DESTINATIONS.length],
      image: photo(idx),
      caption: CAPTIONS[idx % CAPTIONS.length],
      likes: rand(20, 2000),
      comments: rand(0, 25),
      createdAt: timeAgoISO(rand(1, 96)),
      liked: false,
      fallbackUsed: false,
      // NEW: keep the actual list of comment items
      commentsList: [
        // sample few
        ...(rand(0, 1)
          ? [
              {
                id: `${idx}-c1`,
                user: { name: "Alex", avatar: avatar(idx + 20) },
                text: "Looks amazing!",
                createdAt: timeAgoISO(rand(1, 48)),
              },
            ]
          : []),
      ],
    };
  });
}

export const usePostsStore = create(
  persist(
    (set, get) => ({
      posts: [],

      seedIfEmpty() {
        const { posts } = get();
        if (!posts || posts.length === 0) {
          set({ posts: makeDemo(16) });
        }
      },

      setPhotoFallback(id) {
        set((state) => {
          const posts = state.posts.map((p) => {
            if (p.id !== id || p.fallbackUsed) return p;
            const seed = parseInt(p.id, 10) || rand(1, 9999);
            return { ...p, image: fallbackPhoto(seed), fallbackUsed: true };
          });
          return { posts };
        });
      },

      toggleLike(id) {
        set((state) => {
          const posts = state.posts.map((p) => {
            if (p.id !== id) return p;
            const liked = !p.liked;
            const likes = Math.max(0, (p.likes || 0) + (liked ? 1 : -1));
            return { ...p, liked, likes };
          });
          return { posts };
        });
      },

      // Called by Create screen
      addPost({ imageUri, caption, location, userName, userAvatar }) {
        const id = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
        const newPost = {
          id,
          user: { name: userName || "You", avatar: userAvatar || avatar(99) },
          location: location?.trim() || "Somewhere on Earth",
          image: imageUri, // local file URI ok
          caption: caption?.trim() || "",
          likes: 0,
          comments: 0,
          createdAt: new Date().toISOString(),
          liked: false,
          fallbackUsed: false,
          local: true,
          commentsList: [], // NEW
        };
        set({ posts: [newPost, ...get().posts] });
        return newPost;
      },

      // ---------- COMMENTS ----------
      addComment(postId, text, user) {
        const trimmed = String(text || "").trim();
        if (!trimmed) return;
        const comment = {
          id: `${postId}-c-${Date.now()}`,
          user: {
            name: user?.name || "You",
            avatar: user?.avatar || avatar(120),
          },
          text: trimmed,
          createdAt: new Date().toISOString(),
        };
        set((state) => {
          const posts = state.posts.map((p) => {
            if (p.id !== postId) return p;
            const list = Array.isArray(p.commentsList) ? p.commentsList : [];
            return {
              ...p,
              commentsList: [comment, ...list],
              comments: (p.comments || 0) + 1,
            };
          });
          return { posts };
        });
      },
    }),
    {
      name: "travelogue-posts",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ posts: s.posts }),
    }
  )
);
