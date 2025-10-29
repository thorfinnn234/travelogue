// app/(tabs)/account/index.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  Pressable,
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../../lib/supabase";
import { usePostsStore } from "../../store/postsStore";
import { useBookmarksStore } from "../../store/bookmarksStore";

const { width } = Dimensions.get("window");
const GAP = 10;
const COLS = 2;
const TILE = Math.floor((width - 16 * 2 - GAP) / COLS); // 16px horizontal padding

/* ---------------- helpers ---------------- */
function firstNameFromEmail(email) {
  if (!email) return "Traveler";
  const raw = (email.split("@")[0] || "").trim();
  const first = raw.split(/[._-]/)[0] || raw;
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : "Traveler";
}
function handleFromEmail(email) {
  if (!email) return "traveler";
  return (email.split("@")[0] || "traveler").toLowerCase();
}
const s = (v, fb = "") => (v == null ? fb : String(v));
const toImageSource = (src) => {
  if (!src) return undefined;
  if (typeof src === "string") {
    if (src.startsWith("file:") || src.startsWith("content:")) return { uri: src };
    return src;
  }
  return src;
};
const formatTimeAgo = (iso) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
};

/* ---------------- screen ---------------- */
export default function AccountScreen() {
  const [name, setName] = useState("Traveler");
  const [email, setEmail] = useState("");

  // stores
  const posts = usePostsStore((s) => s.posts);
  const isSaved = useBookmarksStore((s) => s.isSaved);

  // compute user content
  const userHandle = useMemo(() => handleFromEmail(email), [email]);

  // Our create screen set local posts with { local: true, user: { name: "You", ... } }.
  // To keep it simple, show "your posts" as those with local === true.
  const myPosts = useMemo(() => posts.filter((p) => p.local === true), [posts]);
  const savedPosts = useMemo(() => posts.filter((p) => isSaved(p.id)), [posts, isSaved]);

  const totalLikes = useMemo(
    () => myPosts.reduce((sum, p) => sum + (p.likes || 0), 0),
    [myPosts]
  );

  // tab segment
  const [tab, setTab] = useState("Posts"); // "Posts" | "Saved"

  // modal
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const em = data?.user?.email || "";
        setEmail(em);
        setName(firstNameFromEmail(em));
      } catch {
        // ignore
      }
    })();
  }, []);

  const data = tab === "Posts" ? myPosts : savedPosts;

  const renderItem = useCallback(
    ({ item }) => (
      <Pressable style={styles.tile} onPress={() => setSelected(item)}>
        <Image
          source={toImageSource(item.image)}
          style={styles.tileImg}
          contentFit="cover"
          cachePolicy={
            item.image?.startsWith?.("file:") || item.image?.startsWith?.("content:")
              ? "none"
              : "disk"
          }
        />
        <View style={styles.tileBadgeRow}>
          <View style={styles.badge}>
            <Ionicons name="heart" size={12} color="#ef4444" />
            <Text style={styles.badgeTxt}>{(item.likes || 0).toLocaleString()}</Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name="chatbubble" size={12} color="#111827" />
            <Text style={styles.badgeTxt}>{item.comments || 0}</Text>
          </View>
        </View>
      </Pressable>
    ),
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          <Image
            source={`https://i.pravatar.cc/150?u=${encodeURIComponent(email || name)}`}
            style={styles.avatar}
            contentFit="cover"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{s(name, "Traveler")}</Text>
          <Text style={styles.handle}>@{s(userHandle, "traveler")}</Text>
        </View>
        <Pressable
          onPress={() => Alert.alert("Coming soon", "Profile editing will be added later.")}
          style={styles.editBtn}
        >
          <Ionicons name="pencil" size={16} color="#111827" />
          <Text style={styles.editTxt}>Edit</Text>
        </Pressable>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Stat label="Posts" value={myPosts.length} />
        <Stat label="Saved" value={savedPosts.length} />
        <Stat label="Likes" value={totalLikes} />
      </View>

      {/* Segmented control */}
      <View style={styles.segment}>
        {["Posts", "Saved"].map((k) => {
          const active = tab === k;
          return (
            <Pressable
              key={k}
              onPress={() => setTab(k)}
              style={[styles.segmentBtn, active && styles.segmentActive]}
            >
              <Text style={[styles.segmentTxt, active && styles.segmentTxtActive]}>{k}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Grid */}
      <FlatList
        data={data}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        numColumns={COLS}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: GAP }}
        columnWrapperStyle={{ gap: GAP }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {tab === "Posts" ? "You haven’t posted yet." : "No saved posts yet."}
          </Text>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Details modal */}
      <Modal visible={!!selected} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            {selected && (
              <>
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalTitle}>{s(selected.location, "Somewhere")}</Text>
                    <Text style={styles.modalSub}>{formatTimeAgo(selected.createdAt)}</Text>
                  </View>
                  <Pressable onPress={() => setSelected(null)} style={styles.modalClose}>
                    <Ionicons name="close" size={22} color="#111827" />
                  </Pressable>
                </View>

                <Image source={toImageSource(selected.image)} style={styles.modalImg} contentFit="cover" />
                <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
                  {!!selected.caption && <Text style={styles.modalDesc}>{s(selected.caption)}</Text>}
                </ScrollView>

                <View style={styles.modalCounts}>
                  <View style={styles.badgeLg}>
                    <Ionicons name="heart" size={16} color="#ef4444" />
                    <Text style={styles.badgeLgTxt}>{(selected.likes || 0).toLocaleString()} likes</Text>
                  </View>
                  <View style={styles.badgeLg}>
                    <Ionicons name="chatbubble" size={16} color="#111827" />
                    <Text style={styles.badgeLgTxt}>{selected.comments || 0} comments</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------------- small component ---------------- */
function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statVal}>{String(value)}</Text>
      <Text style={styles.statLbl}>{label}</Text>
    </View>
  );
}

/* ---------------- styles ---------------- */
const R = 16;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    gap: 12,
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f3f4f6",
  },
  avatar: { width: "100%", height: "100%" },
  name: { fontSize: 20, fontWeight: "800", color: "#111827" },
  handle: { color: "#6b7280", fontWeight: "600" },

  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
  },
  editTxt: { color: "#111827", fontWeight: "800" },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  stat: { alignItems: "center", flex: 1 },
  statVal: { fontSize: 18, fontWeight: "800", color: "#111827" },
  statLbl: { color: "#6b7280", marginTop: 2 },

  segment: {
    marginTop: 6,
    marginBottom: 10,
    padding: 4,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    marginHorizontal: 16,
    flexDirection: "row",
    gap: 6,
  },
  segmentBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentActive: { backgroundColor: "#fff" },
  segmentTxt: { color: "#6b7280", fontWeight: "700" },
  segmentTxtActive: { color: "#111827" },

  tile: {
    width: TILE,
    height: TILE,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#e5e7eb",
  },
  tileImg: { width: "100%", height: "100%" },
  tileBadgeRow: {
    position: "absolute",
    left: 6,
    bottom: 6,
    flexDirection: "row",
    gap: 6,
  },
  badge: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 999,
    paddingHorizontal: 8,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  badgeTxt: { color: "#111827", fontWeight: "700", fontSize: 12 },

  empty: { textAlign: "center", color: "#6b7280", marginTop: 24 },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "flex-end" },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 14,
    paddingBottom: 20,
    minHeight: 420,
  },
  modalHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 6 },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#111827" },
  modalSub: { color: "#6b7280", fontWeight: "600" },
  modalClose: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center", backgroundColor: "#f3f4f6",
  },
  modalImg: {
    width: "100%",
    height: Math.round(width * 0.6),
    borderRadius: 14,
    backgroundColor: "#e5e7eb",
  },
  modalDesc: { color: "#111827", marginTop: 12, lineHeight: 20 },
  modalCounts: { flexDirection: "row", gap: 10, marginTop: 12 },
  badgeLg: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  badgeLgTxt: { color: "#111827", fontWeight: "800" },
});
