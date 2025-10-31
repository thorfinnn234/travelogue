// app/store/postsStore.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/* ----------------------------- Curated assets ----------------------------- */

// High-quality portrait avatars (Unsplash still URLs; stable, no API key)
const PORTRAITS = [
  // diverse, neutral portrait crops
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=640&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=640&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=640&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?q=80&w=640&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=640&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544005316-04ce1f9e63e0?q=80&w=640&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1547106634-56dcd53ae883?q=80&w=640&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1545996124-0501ebae84d5?q=80&w=640&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=640&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=640&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1524504388940-f5bc38b1d022?q=80&w=640&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=640&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1502767089025-6572583495b0?q=80&w=640&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=640&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=640&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=640&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519345178453-13b2f02b4b05?q=80&w=640&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1514790193030-c89d266d5a9d?q=80&w=640&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=640&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=640&auto=format&fit=crop",
];

// Destinations we’ll rotate through for demo seeds
const DESTINATIONS = [
  "Maldives, Maldives",
  "Paris, France",
  "Tokyo, Japan",
  "Santorini, Greece",
  "Bali, Indonesia",
  "Lagos, Nigeria",
  "Cape Town, South Africa",
  "New York City, USA",
  "Marrakesh, Morocco",
  "Reykjavík, Iceland",
  "Sydney, Australia",
  "Rome, Italy",
  "Kyoto, Japan",
  "Dubai, UAE",
];

// Destination → hero photo (city/region matched)
// 1) Replace your PLACE_IMAGES with this (arrays per location)
const PLACE_IMAGES = {
  "paris, france": [
    "https://i.pinimg.com/736x/74/87/c8/7487c8379bf893a1c7b6c15cb44aa2ea.jpg"
  ],
  "tokyo, japan": [
    "https://i.pinimg.com/736x/9f/87/dc/9f87dcc6f6f7c65fae713bac4f1ea69e.jpg"
  ],
  "santorini, greece": [
    "https://images.unsplash.com/photo-1493558103817-58b2924bce98?q=80&w=1400&auto=format&fit=crop"
  ],
  "bali, indonesia": [
    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1400&auto=format&fit=crop"
  ],
  "lagos, nigeria": [
    "https://i.pinimg.com/736x/f8/69/e2/f869e2d3ff1d36aaa75e062d35170651.jpg"
  ],
  "cape town, south africa": [
    "https://i.pinimg.com/736x/da/9a/61/da9a613b95ec3de558de9f7c7b7d4a88.jpg"
  ],
  "new york city, usa": [
    "https://i.pinimg.com/1200x/4d/eb/a0/4deba0a54d9d207feeeaba12f89948c4.jpg"
  ],
  "marrakesh, morocco": [
    "https://i.pinimg.com/736x/e9/7d/d3/e97dd351605a6ed6025148a53c2d0680.jpg"
  ],
  "reykjavík, iceland": [
    "https://i.pinimg.com/1200x/e9/4f/7d/e94f7d24e604f433e55b41bf2992e793.jpg"
  ],
  "sydney, australia": [
    "https://i.pinimg.com/736x/4c/49/75/4c497530e4aaca38ef7da0855cb3f58c.jpg"
  ],
  "rome, italy": [
    "https://i.pinimg.com/1200x/79/f1/da/79f1dafa120a2758c48efd76cc31a4ad.jpg"
  ],
  "dubai, uae": [
    "https://i.pinimg.com/736x/81/f0/db/81f0db8467ae5ded650017f0a5bd0b83.jpg"
  ],
  "maldives, maldives": [
    "https://i.pinimg.com/1200x/43/67/96/4367969e17cb575a9e1d2be7eed2b197.jpg"
  ],
  "kyoto, japan": [
    "https://i.pinimg.com/1200x/47/55/ca/4755ca0523caf299505ae160c2a2ca8b.jpg"
  ],

  // generic fallbacks (arrays too)
  "_alps": [
    "https://images.unsplash.com/photo-1500048993953-d23a436266cf?q=80&w=1400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?q=80&w=1400&auto=format&fit=crop"
  ],
  "_nature": [
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1400&auto=format&fit=crop"
  ]
};

// 2) Update your picker to support arrays
function placeImageFor(location = "", seed = 1) {
  const key = (location || "").trim().toLowerCase();
  const entry = PLACE_IMAGES[key];

  // when we have an array for the location
  if (Array.isArray(entry) && entry.length > 0) {
    return entry[Math.abs(seed) % entry.length];
  }

  // string support (if you ever keep single strings)
  if (typeof entry === "string") return entry;

  // smart fallbacks
  if (/alps|peak|mountain/.test(key)) {
    const arr = PLACE_IMAGES["_alps"];
    return arr[Math.abs(seed) % arr.length];
  }
  const arr = PLACE_IMAGES["_nature"];
  return arr[Math.abs(seed) % arr.length];
}


// Caption generator tied to destination keywords
function captionFor(location = "") {
  const l = location.toLowerCase();
  if (l.includes("maldives")) return "Overwater villas and glassy lagoons—Maldives magic.";
  if (l.includes("paris")) return "Golden hour by the Seine. Paris just hits different.";
  if (l.includes("tokyo")) return "Neon nights, quiet shrines, perfect ramen runs.";
  if (l.includes("santorini")) return "Blue domes, white lanes, sunsets that linger.";
  if (l.includes("bali")) return "Palm breeze + temple bells + turquoise coves.";
  if (l.includes("lagos")) return "Island drives, city lights, street suya after dark.";
  if (l.includes("cape town")) return "Table Mountain this morning, vineyards by noon.";
  if (l.includes("new york")) return "Skyline views and subway stories—NYC never sleeps.";
  if (l.includes("marrakesh")) return "Souks, mint tea, and rose-tinted riads.";
  if (l.includes("reykjav") || l.includes("iceland"))
    return "Waterfalls, black sand, maybe the aurora tonight.";
  if (l.includes("sydney")) return "Harbour breeze, ferry rides, Bondi afterglow.";
  if (l.includes("rome")) return "Ancient stones, fresh pasta, long piazza nights.";
  if (l.includes("dubai")) return "Desert gold and glass towers—contrast everywhere.";
  if (l.includes("kyoto")) return "Gates and gardens, tea and tranquility.";
  return "One more stamp, one more story.";
}

// Normalize a location key (e.g. “Paris, France” → “paris, france”)
const keyOf = (loc = "") => loc.trim().toLowerCase();

// Pick a hero image for a given location (with soft fallbacks)


// Pick a portrait from the curated list
const portrait = (seed = 1) => PORTRAITS[Math.abs(seed) % PORTRAITS.length];

// Helpers
const timeAgoISO = (h) => new Date(Date.now() - h * 3600 * 1000).toISOString();
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/* ------------------------------- Demo seeding ------------------------------ */

function makeDemo(n = 12) {
  return Array.from({ length: n }, (_, i) => {
    const idx = i + 1;
    const location = DESTINATIONS[i % DESTINATIONS.length];
    return {
      id: String(idx),
      user: { name: demoName(idx), avatar: portrait(idx + 7) },
      location,
      image: placeImageFor(location, idx),
      caption: captionFor(location),
      likes: rand(120, 4200),
      comments: rand(0, 25),
      createdAt: timeAgoISO(rand(1, 96)),
      liked: false,
      fallbackUsed: false,
      commentsList: rand(0, 1)
        ? [
            {
              id: `${idx}-c1`,
              user: { name: "Alex", avatar: portrait(idx + 20) },
              text: "Looks amazing!",
              createdAt: timeAgoISO(rand(1, 48)),
            },
          ]
        : [],
    };
  });
}

function demoName(i) {
  const names = [
    "Aisha Bello","Daniel Okeke","Sophia Martins","Kemi Adedeji","Liam Carter",
    "Olivia James","Noah Thompson","Amara Nwosu","Ethan Moore","Zara Ahmed",
    "Emeka Obi","Maya Patel","Jayden Brooks","Chioma Eze","Lucas Wright",
    "Ava Robinson","Muhammad Aliyu","Nora Williams","David Green","Adaora Ugwu",
    "Samuel Johnson","Isioma Okon","Henry Scott","Fatima Sanni","Damilola Adeyemi",
  ];
  return names[i % names.length];
}

/* --------------------------------- Store ---------------------------------- */

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

      // When an image fails, fall back to the place-matched photo, not a random feed
      setPhotoFallback(id) {
        set((state) => {
          const posts = state.posts.map((p) => {
            if (p.id !== id || p.fallbackUsed) return p;
            const img = placeImageFor(p.location, Number(p.id) || rand(1, 9999));
            return { ...p, image: img, fallbackUsed: true };
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
        const loc = location?.trim() || "Somewhere on Earth";
        const finalImage =
          (typeof imageUri === "string" && imageUri.trim()) || placeImageFor(loc, Date.now());

        const newPost = {
          id,
          user: {
            name: userName || "You",
            avatar:
              (typeof userAvatar === "string" && userAvatar.trim()) ||
              portrait(99 + Math.floor(Math.random() * 500)),
          },
          location: loc,
          image: finalImage, // plain string; expo-image will handle it
          caption: (caption?.trim() || captionFor(loc)),
          likes: 0,
          comments: 0,
          createdAt: new Date().toISOString(),
          liked: false,
          fallbackUsed: false,
          local: true,
          commentsList: [],
        };

        set({ posts: [newPost, ...get().posts] });
        try { console.debug('postsStore.addPost saved ->', { id: newPost.id, image: newPost.image }); } catch (e) {}
        return newPost;
      },

      // Update ONLY the image (immutably) and auto-refresh caption if empty
      setPostImage(postId, imageUrl) {
        const clean = typeof imageUrl === "string" ? imageUrl.trim() : "";
        if (!clean) return;

        set((state) => ({
          posts: state.posts.map((p) => {
            if (p.id !== postId) return p;
            const updated = {
              ...p,
              image: clean,
              fallbackUsed: false,
            };
            if (!p.caption || p.caption.trim().length < 4) {
              updated.caption = captionFor(p.location);
            }
            return updated;
          }),
        }));
      },

      // ---------- COMMENTS ----------
      addComment(postId, text, user) {
        const trimmed = String(text || "").trim();
        if (!trimmed) return;
        const comment = {
          id: `${postId}-c-${Date.now()}`,
          user: {
            name: user?.name || "You",
            avatar: user?.avatar || portrait(120 + Math.floor(Math.random() * 500)),
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
      // Development helper to wipe all posts (clears persisted posts so new seed runs)
      resetAll() {
        set({ posts: [] });
      },
    }),
    {
      name: "travelogue-posts",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ posts: s.posts }),
    }
  )
);
