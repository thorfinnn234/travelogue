// app/(tabs)/feeds/index.jsx
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../../lib/supabase";
import { COLORS } from "../../../utils/theme";

// stores
import { useBookmarksStore } from "../../store/bookmarksStore";
import { usePostsStore } from "../../store/postsStore";

const { width } = Dimensions.get("window");
const IMAGE_HEIGHT = Math.round(width * 1.25);

/* ---------- helpers (real names, real photos, matched captions) ---------- */
const REAL_NAMES = [
  "Aisha Bello","Daniel Okeke","Sophia Martins","Kemi Adedeji","Liam Carter",
  "Olivia James","Noah Thompson","Amara Nwosu","Ethan Moore","Zara Ahmed",
  "Emeka Obi","Maya Patel","Jayden Brooks","Chioma Eze","Lucas Wright",
  "Ava Robinson","Muhammad Aliyu","Nora Williams","David Green","Adaora Ugwu",
  "Samuel Johnson","Isioma Okon","Henry Scott","Fatima Sanni","Damilola Adeyemi",
];

// curated high-quality travel images mapped by region / theme
// const TRAVEL_IMAGES = {
//   paris:     "https://unsplash.com/photos/colosseum-arena-photography-VFRTXGw1VjU",
//   tokyo:     "https://images.unsplash.com/photo-1549692520-acc6669e2f0c?q=80&w=1600&auto=format&fit=crop",
//   santorini: "https://images.unsplash.com/photo-1505739772971-8d3030a6e8c7?q=80&w=1600&auto=format&fit=crop",
//   bali:      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1600&auto=format&fit=crop",
//   lagos:     "https://images.unsplash.com/photo-1593879814899-cb8bbee0b4e0?q=80&w=1600&auto=format&fit=crop",
//   capetown:  "https://images.unsplash.com/photo-1600047509807-ba4f7fc7edaa?q=80&w=1600&auto=format&fit=crop",
//   newyork:   "https://images.unsplash.com/photo-1528892952291-009c663ce843?q=80&w=1600&auto=format&fit=crop",
//   marrakesh: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1600&auto=format&fit=crop",
//   iceland:   "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=1600&auto=format&fit=crop",
//   rome:      "https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1600&auto=format&fit=crop",
//   dubai:     "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=1600&auto=format&fit=crop",
//   sydney:    "https://images.unsplash.com/photo-1510749342490-cc296c6df763?q=80&w=1600&auto=format&fit=crop",
//   maldives:  "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?q=80&w=1600&auto=format&fit=crop",
//   alps:      "https://images.unsplash.com/photo-1500048993953-d23a436266cf?q=80&w=1600&auto=format&fit=crop",
//   nature:    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop",
// };


// export const placeToUnsplash = (place = "", seed = 1) => {
//   const key = (place || "").toLowerCase();

//   if (/paris|france|eiffel/.test(key)) return TRAVEL_IMAGES.paris;
//   if (/tokyo|japan/.test(key)) return TRAVEL_IMAGES.tokyo;
//   if (/santorini|greece/.test(key)) return TRAVEL_IMAGES.santorini;
//   if (/bali|indonesia/.test(key)) return TRAVEL_IMAGES.bali;
//   if (/maldives|male|atoll/.test(key)) return TRAVEL_IMAGES.maldives;
//   if (/lagos|nigeria/.test(key)) return TRAVEL_IMAGES.lagos;
//   if (/cape town|south africa/.test(key)) return TRAVEL_IMAGES.capetown;
//   if (/new york|nyc|usa/.test(key)) return TRAVEL_IMAGES.newyork;
//   if (/marrakesh|marrakech|morocco/.test(key)) return TRAVEL_IMAGES.marrakesh;
//   if (/iceland|reykjav/.test(key)) return TRAVEL_IMAGES.iceland;
//   if (/rome|italy/.test(key)) return TRAVEL_IMAGES.rome;
//   if (/dubai|uae|burj/.test(key)) return TRAVEL_IMAGES.dubai;
//   if (/sydney|australia/.test(key)) return TRAVEL_IMAGES.sydney;
//   if (/mountain|alps|peak/.test(key)) return TRAVEL_IMAGES.alps;
//   if (/nature|forest|park|trail|waterfall/.test(key)) return TRAVEL_IMAGES.nature;

//   const randomImages = Object.values(TRAVEL_IMAGES);
//   return randomImages[seed % randomImages.length];
// };


// const captionFor = (place = "") => {
//   const p = (place || "").toLowerCase();
//   if (/maldives|atoll/.test(p)) return "Overwater villas, clear lagoons—Maldives magic.";
//   if (/paris/.test(p)) return "Golden hour by the Eiffel—Paris never disappoints.";
//   if (/tokyo/.test(p)) return "Neon nights and ramen stops—Tokyo energy!";
//   if (/santorini/.test(p)) return "White walls, blue domes, and salty air.";
//   if (/bali|beach|island/.test(p)) return "Palm breeze + turquoise water = perfect day.";
//   if (/lagos/.test(p)) return "Sunset drives on the Eko Atlantic coastline.";
//   if (/cape town/.test(p)) return "Hiked Table Mountain—worth every step.";
//   if (/new york|nyc/.test(p)) return "Skyline views and subway stories.";
//   if (/marrakesh/.test(p)) return "Markets, mint tea, and magical alleys.";
//   if (/reykjav|iceland/.test(p)) return "Chasing waterfalls and northern lights.";
//   if (/sydney/.test(p)) return "Opera House mornings, harbour nights.";
//   if (/rome/.test(p)) return "History on every corner—ciao, pasta!";
//   if (/dubai/.test(p)) return "Desert sands and skyscraper dreams.";
//   if (/mountain|alps|peak/.test(p)) return "Thin air and big views—peak bliss.";
//   if (/nature|forest|park|reef/.test(p)) return "Green trails and quiet rivers.";
//   return "New city, fresh stories, and friendly faces.";
// };


const formatTimeAgo = (iso) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
};

const avatar = (seed) => `https://i.pravatar.cc/150?img=${(seed % 70) + 1}`;

const detectCategory = (post) => {
  const t = `${post.location || ""} ${post.caption || ""}`.toLowerCase();
  if (/(beach|island|bali|santorini)/.test(t)) return "Beaches";
  if (/(mountain|peak|alps|hike|hiking)/.test(t)) return "Mountains";
  if (/(park|nature|forest|reef|iceland|cape town)/.test(t)) return "Nature";
  if (/(city|paris|tokyo|new york|dubai|rome|marrakesh|sydney|lagos)/.test(t)) return "City";
  if (/(food|street food|coffee|restaurant)/.test(t)) return "Food";
  return "All";
};

function firstNameFromEmail(email) {
  if (!email) return "Traveler";
  const raw = (email.split("@")[0] || "").trim();
  const first = raw.split(/[._-]/)[0] || raw;
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : "Traveler";
}

/* ---------- screen ---------- */
export default function FeedScreen() {
  const router = useRouter();

  // Greeting from Supabase email
  const [greetingName, setGreetingName] = useState("Traveler");
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const email = data?.user?.email || "";
        if (mounted) setGreetingName(firstNameFromEmail(email));
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Posts store
  const posts = usePostsStore((s) => s.posts);
  const seedIfEmpty = usePostsStore((s) => s.seedIfEmpty);
  const toggleLikeStore = usePostsStore((s) => s.toggleLike);
  const setPhotoFallback = usePostsStore((s) => s.setPhotoFallback);
  const addComment = usePostsStore((s) => s.addComment);
  const removePost = usePostsStore((s) => s.removePost);

  useEffect(() => {
    seedIfEmpty();
  }, [seedIfEmpty]);

  // Bookmarks store
  const toggleSave = useBookmarksStore((s) => s.toggle);
  const isSaved = useBookmarksStore((s) => s.isSaved);

  // Theme
  const bg = (COLORS && COLORS.white) || "#ffffff";
  const fg = (COLORS && COLORS.black) || "#111827";
  const border = "#e5e7eb";
  const subtle = "#6b7280";

  // UI state
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState("All");
  const [popularOnly, setPopularOnly] = useState(false);

  const onToggleLike = useCallback((id) => toggleLikeStore(id), [toggleLikeStore]);
  const handlePhotoError = useCallback((id) => setPhotoFallback(id), [setPhotoFallback]);
    // Map simple place keywords to representative Unsplash images. Kept small and defensive
    // so the feed can always show a fallback if a post lacks an image.
    const placeToUnsplash = (place = "", seed = 1) => {
      const key = (place || "").toLowerCase();
      if (/paris|france|eiffel/.test(key)) return "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1400&auto=format&fit=crop";
      if (/tokyo|japan/.test(key)) return "https://images.unsplash.com/photo-1549692520-acc6669e2f0c?q=80&w=1400&auto=format&fit=crop";
      if (/santorini|greece/.test(key)) return "https://images.unsplash.com/photo-1505739772971-8d3030a6e8c7?q=80&w=1400&auto=format&fit=crop";
      if (/bali|indonesia/.test(key)) return "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1400&auto=format&fit=crop";
      if (/maldives|atoll/.test(key)) return "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?q=80&w=1400&auto=format&fit=crop";
      if (/lagos|nigeria/.test(key)) return "https://images.unsplash.com/photo-1593879814899-cb8bbee0b4e0?q=80&w=1400&auto=format&fit=crop";
      if (/cape town|south africa/.test(key)) return "https://images.unsplash.com/photo-1600047509807-ba4f7fc7edaa?q=80&w=1400&auto=format&fit=crop";
      if (/new york|nyc|usa/.test(key)) return "https://images.unsplash.com/photo-1528892952291-009c663ce843?q=80&w=1400&auto=format&fit=crop";
      if (/marrakesh|marrakech|morocco/.test(key)) return "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1400&auto=format&fit=crop";
      if (/iceland|reykjav/.test(key)) return "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=1400&auto=format&fit=crop";
      if (/rome|italy/.test(key)) return "https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1400&auto=format&fit=crop";
      if (/dubai|uae|burj/.test(key)) return "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=1400&auto=format&fit=crop";
      if (/sydney|australia/.test(key)) return "https://images.unsplash.com/photo-1510749342490-cc296c6df763?q=80&w=1400&auto=format&fit=crop";
      if (/mountain|alps|peak/.test(key)) return "https://images.unsplash.com/photo-1500048993953-d23a436266cf?q=80&w=1400&auto=format&fit=crop";
      if (/nature|forest|park|trail|waterfall/.test(key)) return "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1400&auto=format&fit=crop";

      // default fallback (rotate by seed)
      const fallback = [
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1500048993953-d23a436266cf?q=80&w=1400&auto=format&fit=crop",
      ];
      return fallback[Math.abs(seed) % fallback.length];
    };


    // Small caption helper used by the feed when a post caption is missing or too short.
    const captionFor = (place = "") => {
      const p = (place || "").toLowerCase();
      if (/maldives|atoll/.test(p)) return "Overwater villas, clear lagoons—Maldives magic.";
      if (/paris/.test(p)) return "Golden hour by the Seine. Paris just hits different.";
      if (/tokyo/.test(p)) return "Neon nights and ramen stops—Tokyo energy!";
      if (/santorini/.test(p)) return "White walls, blue domes, and salty air.";
      if (/bali|beach|island/.test(p)) return "Palm breeze + turquoise water = perfect day.";
      if (/lagos/.test(p)) return "Sunset drives on the Eko Atlantic coastline.";
      if (/cape town/.test(p)) return "Hiked Table Mountain—worth every step.";
      if (/new york|nyc/.test(p)) return "Skyline views and subway stories.";
      if (/marrakesh/.test(p)) return "Markets, mint tea, and magical alleys.";
      if (/reykjav|iceland/.test(p)) return "Chasing waterfalls and northern lights.";
      if (/sydney/.test(p)) return "Opera House mornings, harbour nights.";
      if (/rome/.test(p)) return "History on every corner—ciao, pasta!";
      if (/dubai/.test(p)) return "Desert sands and skyscraper dreams.";
      if (/mountain|alps|peak/.test(p)) return "Thin air and big views—peak bliss.";
      if (/nature|forest|park|reef/.test(p)) return "Green trails and quiet rivers.";
      return "New city, fresh stories, and friendly faces.";
    };
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  // COMMENTS
  const [commentsPostId, setCommentsPostId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [me, setMe] = useState({ name: "You", avatar: avatar(200) });
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const email = data?.user?.email || "";
        const first = firstNameFromEmail(email);
        setMe({ name: first || "You", avatar: avatar(200) });
      } catch {}
    })();
  }, []);
  const openComments = useCallback((post) => {
    setCommentsPostId(post?.id || null);
    setCommentText("");
  }, []);
  const livePostForComments = useMemo(
    () => (commentsPostId ? posts.find((p) => p.id === commentsPostId) : null),
    [commentsPostId, posts]
  );
  const submitComment = useCallback(() => {
    if (!commentsPostId) return;
    const text = commentText.trim();
    if (!text) return;
    addComment(commentsPostId, text, me);
    setCommentText("");
  }, [commentsPostId, commentText, addComment, me]);

  // ACTIONS (3-dot)
  const [actionPostId, setActionPostId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const openActions = useCallback((post) => setActionPostId(post?.id || null), []);
  const closeActions = useCallback(() => setActionPostId(null), []);
  const doDelete = useCallback(
    (id) => {
      if (removePost) removePost(id);
      else usePostsStore.setState((s) => ({ posts: s.posts.filter((p) => p.id !== id) }));
      setConfirmDeleteId(null);
      setActionPostId(null);
    },
    [removePost]
  );

  // NOTIFICATIONS
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState(() => {
    const now = Date.now();
    const iso = (msAgo) => new Date(now - msAgo).toISOString();
    return [
      { id: "n1", title: "New follower", body: "Ayo started following you.", createdAt: iso(10 * 60 * 1000), read: false },
      { id: "n2", title: "Comment", body: "Mina: “This view is insane!”", createdAt: iso(60 * 60 * 1000), read: false },
      { id: "n3", title: "Post saved", body: "Your Bali trip was bookmarked 3×", createdAt: iso(20 * 60 * 60 * 1000), read: true },
    ];
  });
  const unread = notifs.filter((n) => !n.read).length;
  const markRead = useCallback((id) => setNotifs((arr) => arr.map((n) => (n.id === id ? { ...n, read: true } : n))), []);
  const markAllRead = useCallback(() => setNotifs((arr) => arr.map((n) => ({ ...n, read: true }))), []);
  const clearOne = useCallback((id) => setNotifs((arr) => arr.filter((n) => n.id !== id)), []);
  const clearAll = useCallback(() => setNotifs([]), []);

  // PRESENTATION MAPPER: make each post look real without mutating store
  const presentPost = (p, index) => {
    // real name
    let name = p?.user?.name;
    if (typeof name !== "string" || /^traveler/i.test(name)) {
      name = REAL_NAMES[index % REAL_NAMES.length];
    }
    // stable location fallback
    const location =
      p.location ||
      [
        "Paris, France","Tokyo, Japan","Santorini, Greece","Lagos, Nigeria",
        "Cape Town, South Africa","New York, USA","Marrakesh, Morocco","Bali, Indonesia",
        "Reykjavík, Iceland","Sydney, Australia","Rome, Italy","Dubai, UAE",
      ][index % 12];

    // image: prefer existing; else Unsplash featured by place
    let img = p.image;
    if (!img || typeof img !== "string") {
      img = placeToUnsplash(location, Number(p.id) || index + 1);
    }

    // caption that fits the place if missing/short
    let cap = p.caption;
    if (typeof cap !== "string" || cap.trim().length < 8) {
      cap = captionFor(location);
    }

    return { ...p, user: { ...(p.user || {}), name }, location, image: img, caption: cap };
  };

  // FILTERED LIST
  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts
      .map(presentPost)
      .filter((p) => {
        const cat = detectCategory(p);
        if (chip !== "All" && cat !== chip) return false;
        if (popularOnly && (p.likes || 0) < 500) return false;
        if (!q) return true;
        const hay = `${p.user?.name || ""} ${p.caption || ""} ${p.location || ""}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [posts, chip, popularOnly, query]);

  // HEADER
  const Header = (
    <View>
      {/* Top bar — removed "Welcome back" */}
      <View style={styles.topbar}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { color: fg }]}>Hi, {greetingName} 👋</Text>
        </View>

        {/* Bell with unread badge */}
        <Pressable hitSlop={10} style={styles.bellWrap} onPress={() => setShowNotifs(true)}>
          <Ionicons name="notifications-outline" size={20} color={fg} />
          {unread > 0 && (
            <View style={styles.badgeDot}>
              <Text style={styles.badgeText}>{unread > 9 ? "9+" : unread}</Text>
            </View>
          )}
        </Pressable>

        {/* Tap avatar → profile */}
        <Pressable onPress={() => router.push("/profile")} hitSlop={8}>
          <Image source={avatar(4)} style={styles.topAvatar} contentFit="cover" />
        </Pressable>
      </View>

      {/* Search + options */}
      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { borderColor: border }]}>
          <Ionicons name="search-outline" size={18} color={subtle} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search places, people…"
            placeholderTextColor="#9ca3af"
            style={[styles.searchInput, { color: fg }]}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8} style={styles.xBtn}>
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </Pressable>
          )}
          <Pressable
            onPress={() => setPopularOnly((v) => !v)}
            hitSlop={8}
            style={[styles.filterBtn, popularOnly && { backgroundColor: "#111827" }]}
          >
            <Ionicons name="options-outline" size={18} color={popularOnly ? "#fff" : fg} />
          </Pressable>
        </View>
        {popularOnly && (
          <Text style={{ color: subtle, fontSize: 12, marginTop: 6 }}>
            Showing popular posts (500+ likes)
          </Text>
        )}
      </View>

      {/* Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 8 }}
      >
        {["All", "City", "Nature", "Beaches", "Mountains", "Food"].map((c) => {
          const active = chip === c;
          return (
            <Pressable
              key={c}
              onPress={() => setChip(c)}
              style={[
                styles.chip,
                { borderColor: active ? "#111827" : border, backgroundColor: active ? "#111827" : "#fff" },
              ]}
            >
              <Text style={{ color: active ? "#fff" : fg, fontWeight: "700" }}>{c}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={[styles.h1, { color: fg, marginTop: 6, marginHorizontal: 16 }]}>Explore Travels</Text>
    </View>
  );

  // image src helper
  const toImageSource = (src) => {
    if (!src) return undefined;
    if (typeof src === "string") {
      if (src.startsWith("file:") || src.startsWith("content:")) return { uri: src };
      return src;
    }
    return src;
  };

  const renderItem = ({ item, index }) => {
      (() => {
        try { console.debug('feed:renderItem', { id: item.id, image: item.image, local: item.local }); } catch (e) {}
      })();
    const p = presentPost(item, index);

    return (
      <View style={[styles.card, { backgroundColor: "#fff", borderColor: border }]}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Image source={p.user?.avatar || avatar(index + 10)} style={styles.avatar} contentFit="cover" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: fg }]} numberOfLines={1}>
              {p.user?.name || "Traveler"}
            </Text>
            <Text style={[styles.meta, { color: subtle }]} numberOfLines={1}>
              {p.location || "Somewhere"} • {formatTimeAgo(p.createdAt)}
            </Text>
          </View>
          <Pressable hitSlop={10} style={styles.iconBtn} onPress={() => openActions(p)}>
            <Ionicons name="ellipsis-horizontal" size={20} color={subtle} />
          </Pressable>
        </View>

        {/* Photo */}
        <Pressable onPress={() => { /* router.push(`/post/${p.id}`) */ }}>
          <Image
            source={toImageSource(p.image) || { uri: placeToUnsplash(p.location, Number(p.id) || index + 1) }}
            style={styles.photo}
            contentFit="cover"
            cachePolicy={p.image?.startsWith?.("file:") || p.image?.startsWith?.("content:") ? "none" : "disk"}
            transition={200}
            onError={() => handlePhotoError(p.id)}
          />
        </Pressable>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <Pressable onPress={() => onToggleLike(p.id)} hitSlop={10} style={styles.iconBtn}>
            <Ionicons name={p.liked ? "heart" : "heart-outline"} size={24} color={p.liked ? "#ef4444" : fg} />
          </Pressable>
          <Pressable onPress={() => openComments(p)} hitSlop={10} style={styles.iconBtn}>
            <Ionicons name="chatbubble-outline" size={24} color={fg} />
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable onPress={() => toggleSave(p.id)} hitSlop={10} style={styles.iconBtn}>
            <Ionicons name={isSaved(p.id) ? "bookmark" : "bookmark-outline"} size={24} color={isSaved(p.id) ? "#111827" : fg} />
          </Pressable>
        </View>

        {/* Counts */}
        <Text style={[styles.counts, { color: fg }]}>
          {(p.likes || 0).toLocaleString()} likes • {p.comments || 0} comments
        </Text>

        {/* Caption */}
        {!!p.caption && (
          <Text style={[styles.caption, { color: fg }]} numberOfLines={2}>
            <Text style={[styles.name, { color: fg }]}>{p.user?.name || "Traveler"} </Text>
            {p.caption}
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={["left", "right", "bottom"]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={Header}
        contentContainerStyle={{ paddingBottom: 96 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={fg} titleColor={fg} />}
        ListEmptyComponent={
          <Text style={[styles.meta, { color: subtle, textAlign: "center", paddingVertical: 32 }]}>
            No posts matched your filters.
          </Text>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Create button */}
      <Pressable
        style={({ pressed }) => [styles.fab, { backgroundColor: "#111827", opacity: pressed ? 0.85 : 1 }]}
        onPress={() => {
          try {
            router.push("/create");
          } catch {}
        }}
        hitSlop={10}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      {/* Comments sheet */}
      {commentsPostId && (
        <View style={styles.modalWrap} pointerEvents="box-none">
          <Pressable style={styles.backdrop} onPress={() => setCommentsPostId(null)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Comments</Text>
              <Pressable onPress={() => setCommentsPostId(null)} style={styles.sheetClose}>
                <Ionicons name="close" size={22} color="#111827" />
              </Pressable>
            </View>

            <FlatList
              data={[...(livePostForComments?.commentsList || [])]}
              keyExtractor={(c) => c.id}
              contentContainerStyle={{ paddingBottom: 8 }}
              ListEmptyComponent={<Text style={styles.emptyComments}>Be the first to comment.</Text>}
              renderItem={({ item: c }) => (
                <View style={styles.commentRow}>
                  <Image source={c.user?.avatar} style={styles.cAvatar} contentFit="cover" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cName}>{c.user?.name || "User"}</Text>
                    <Text style={styles.cText}>{c.text}</Text>
                    <Text style={styles.cMeta}>{formatTimeAgo(c.createdAt)}</Text>
                  </View>
                </View>
              )}
            />

            <View style={styles.inputRow}>
              <Image source={me.avatar} style={styles.cAvatar} contentFit="cover" />
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Add a comment…"
                placeholderTextColor="#9ca3af"
                style={styles.input}
                returnKeyType="send"
                onSubmitEditing={submitComment}
              />
              <Pressable
                onPress={submitComment}
                style={[styles.sendBtn, { opacity: commentText.trim() ? 1 : 0.4 }]}
                disabled={!commentText.trim()}
              >
                <Ionicons name="send" size={18} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Actions sheet (3-dot) */}
      {actionPostId && (
        <View style={styles.modalWrap} pointerEvents="box-none">
          <Pressable style={styles.backdrop} onPress={closeActions} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Post actions</Text>
              <Pressable onPress={closeActions} style={styles.sheetClose}>
                <Ionicons name="close" size={22} color="#111827" />
              </Pressable>
            </View>

            <View style={{ paddingVertical: 4 }}>
              <Pressable style={styles.actionRow} onPress={closeActions}>
                <Ionicons name="eye-outline" size={18} color="#111827" />
                <Text style={styles.actionText}>View post</Text>
              </Pressable>

              <Pressable
                style={[styles.actionRow, { backgroundColor: "#fee2e2" }]}
                onPress={() => setConfirmDeleteId(actionPostId)}
              >
                <Ionicons name="trash-outline" size={18} color="#991b1b" />
                <Text style={[styles.actionText, { color: "#991b1b" }]}>Delete post</Text>
              </Pressable>
            </View>

            {confirmDeleteId && (
              <View style={styles.confirmBox}>
                <Text style={styles.confirmTitle}>Delete this post?</Text>
                <Text style={styles.confirmSub}>This action cannot be undone.</Text>
                <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                  <Pressable onPress={() => setConfirmDeleteId(null)} style={[styles.btn, styles.btnGhost]}>
                    <Text style={[styles.btnText, { color: "#111827" }]}>Cancel</Text>
                  </Pressable>
                  <Pressable onPress={() => doDelete(confirmDeleteId)} style={[styles.btn, styles.btnDanger]}>
                    <Text style={[styles.btnText, { color: "#fff" }]}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Notifications sheet */}
      {showNotifs && (
        <View style={styles.modalWrap} pointerEvents="box-none">
          <Pressable style={styles.backdrop} onPress={() => setShowNotifs(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Notifications</Text>
              {notifs.length > 0 && (
                <Pressable onPress={markAllRead} style={styles.smallPill}>
                  <Text style={styles.smallPillText}>Mark all read</Text>
                </Pressable>
              )}
              <Pressable onPress={() => setShowNotifs(false)} style={styles.sheetClose}>
                <Ionicons name="close" size={22} color="#111827" />
              </Pressable>
            </View>

            <FlatList
              data={[...notifs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))}
              keyExtractor={(n) => n.id}
              contentContainerStyle={{ paddingBottom: 8 }}
              ListEmptyComponent={<Text style={styles.emptyComments}>You’re all caught up 🎉</Text>}
              renderItem={({ item: n }) => (
                <View style={[styles.notifRow, !n.read && styles.notifUnread]}>
                  <View style={styles.notifIconWrap}>
                    <Ionicons
                      name={
                        /follow|follower/i.test(n.title)
                          ? "person-add-outline"
                          : /comment/i.test(n.title)
                          ? "chatbubble-ellipses-outline"
                          : "notifications-outline"
                      }
                      size={18}
                      color="#111827"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.notifTitle}>{n.title}</Text>
                    <Text style={styles.notifBody}>{n.body}</Text>
                    <Text style={styles.cMeta}>{formatTimeAgo(n.createdAt)}</Text>
                  </View>
                  <View style={{ gap: 6, alignItems: "flex-end" }}>
                    {!n.read && (
                      <Pressable onPress={() => markRead(n.id)} style={styles.smallPill}>
                        <Text style={styles.smallPillText}>Read</Text>
                      </Pressable>
                    )}
                    <Pressable onPress={() => clearOne(n.id)} style={[styles.smallPill, { backgroundColor: "#fee2e2" }]}>
                      <Text style={[styles.smallPillText, { color: "#991b1b" }]}>Clear</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            />

            {notifs.length > 0 && (
              <Pressable onPress={clearAll} style={[styles.btn, styles.btnGhost, { marginTop: 6 }]}>
                <Text style={[styles.btnText, { color: "#111827" }]}>Clear all</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },

  // Top bar (no "Welcome back")
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 6 : 14,
    paddingBottom: 6,
    gap: 10,
    backgroundColor: "#ffffff",
  },
  greeting: { fontSize: 22, fontWeight: "800" },

  bellWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    position: "relative",
    marginRight: 8,
  },
  badgeDot: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },

  topAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#e5e7eb" },

  // Search
  searchRow: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6 },
  searchBox: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  xBtn: { padding: 4 },
  filterBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    marginLeft: 4,
  },

  // Chips
  chip: {
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Section title
  h1: { fontSize: 22, fontWeight: "800" },

  // Card
  card: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  headerRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingTop: 12, gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#e5e7eb" },
  name: { fontWeight: "700" },
  meta: { fontSize: 12, color: "#6b7280" },
  photo: { width: "100%", height: IMAGE_HEIGHT, backgroundColor: "#f3f4f6" },

  actionsRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingTop: 10, gap: 8 },
  counts: { paddingHorizontal: 12, paddingTop: 6, fontWeight: "600" },
  caption: { paddingHorizontal: 12, paddingVertical: 10 },
  iconBtn: { padding: 6, borderRadius: 999 },

  // FAB
  fab: {
    position: "absolute",
    right: 18,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  // Modal / sheet base
  modalWrap: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.25)" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 14,
    paddingBottom: 10,
    maxHeight: Math.round(width * 1.2),
  },
  sheetHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6, gap: 8 },
  sheetTitle: { flex: 1, fontSize: 18, fontWeight: "800", color: "#111827" },
  sheetClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },

  // Comments
  emptyComments: { textAlign: "center", color: "#6b7280", paddingVertical: 16 },
  commentRow: { flexDirection: "row", gap: 10, paddingVertical: 8 },
  cAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#e5e7eb" },
  cName: { fontWeight: "800", color: "#111827" },
  cText: { color: "#111827", marginTop: 2 },
  cMeta: { color: "#6b7280", fontSize: 12, marginTop: 2 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e7eb",
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  sendBtn: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
  },

  // Actions (3-dot)
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    marginBottom: 8,
  },
  actionText: { fontWeight: "700", color: "#111827" },
  confirmBox: {
    marginTop: 4,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
  },
  confirmTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
  confirmSub: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  btn: { flex: 1, height: 42, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  btnGhost: { backgroundColor: "#f3f4f6" },
  btnDanger: { backgroundColor: "#dc2626" },
  btnText: { fontWeight: "800" },

  // Notifications
  smallPill: {
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  smallPillText: { fontSize: 12, fontWeight: "800", color: "#111827" },
  notifRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    marginBottom: 8,
  },
  notifUnread: { backgroundColor: "#eef2ff" },
  notifIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e5e7eb",
  },
  notifTitle: { fontWeight: "800", color: "#111827" },
  notifBody: { color: "#111827", marginTop: 2 },
});
