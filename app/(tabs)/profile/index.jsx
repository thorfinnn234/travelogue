// app/(tabs)/account/index.jsx
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { supabase } from "../../../lib/supabase";
import { useBookmarksStore } from "../../store/bookmarksStore";
import { usePostsStore } from "../../store/postsStore";

const { width } = Dimensions.get("window");
const GAP = 10;
const COLS = 2;
const TILE = Math.floor((width - 16 * 2 - GAP) / COLS); // 16px horizontal padding
const AVATAR_BUCKET = "avatars"; // change if your bucket name differs

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

/* ---------------- small bits ---------------- */
function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statVal}>{String(value)}</Text>
      <Text style={styles.statLbl}>{label}</Text>
    </View>
  );
}

/* ---------------- main ---------------- */
export default function AccountScreen() {
  const router = useRouter();

  const [name, setName] = useState("Traveler");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // EDIT modal
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [saving, setSaving] = useState(false);

  // Settings tab + switches
  const [tab, setTab] = useState("Posts"); // Posts | Saved | Settings
  const [dark, setDark] = useState(false); // UI-only switch (leave real theming for later)

  // Stores
  const posts = usePostsStore((s) => s.posts);
  const isSaved = useBookmarksStore((s) => s.isSaved);
  const myPosts = useMemo(() => posts.filter((p) => p.local === true), [posts]);
  const savedPosts = useMemo(() => posts.filter((p) => isSaved(p.id)), [posts, isSaved]);
  const totalLikes = useMemo(
    () => myPosts.reduce((sum, p) => sum + (p.likes || 0), 0),
    [myPosts]
  );

  // Details modal
  const [selected, setSelected] = useState(null);

  // Logout
  const [loggingOut, setLoggingOut] = useState(false);

  // load user
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const em = data?.user?.email || "";
        const meta = data?.user?.user_metadata || {};
        setEmail(em);
        setName(meta.full_name || firstNameFromEmail(em));
        setAvatarUrl(
          meta.avatar_url || `https://i.pravatar.cc/150?u=${encodeURIComponent(em || "traveler")}`
        );
      } catch {}
    })();
  }, []);

  // grid
  const data = tab === "Posts" ? myPosts : savedPosts;
  const renderItem = ({ item }) => (
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
  );

  /* ---------------- actions ---------------- */
  const openEdit = useCallback(() => {
    setEditName(name || "");
    setEditAvatar(avatarUrl || "");
    setShowEdit(true);
  }, [name, avatarUrl]);

  const saveEdit = useCallback(async () => {
    try {
      const display = editName.trim();
      if (!display) return Alert.alert("Name required", "Please enter a display name.");
      setSaving(true);
      const updates = { data: { full_name: display, avatar_url: editAvatar.trim() || null } };
      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      setName(display);
      setAvatarUrl(editAvatar.trim() || avatarUrl);
      setShowEdit(false);
    } catch (e) {
      Alert.alert("Update failed", String(e?.message || e));
    } finally {
      setSaving(false);
    }
  }, [editName, editAvatar, avatarUrl]);

  const pickAvatar = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please allow photo library access to pick an avatar.");
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });
      if (res.canceled) return;
      const asset = res.assets?.[0];
      if (!asset?.uri) return;

      // Try uploading to Supabase Storage (recommended for persistence)
      try {
        const { data: userData } = await supabase.auth.getUser();
        const uid = userData?.user?.id;
        if (!uid) throw new Error("No user id");

        // fetch file → blob
        const fileResp = await fetch(asset.uri);
        const blob = await fileResp.blob();

        const ext = (asset.fileName?.split(".").pop() || "jpg").toLowerCase();
        const path = `${uid}/${Date.now()}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from(AVATAR_BUCKET)
          .upload(path, blob, { upsert: true, contentType: blob.type || "image/jpeg" });

        if (upErr) throw upErr;

        // get public URL
        const { data: pub } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
        const publicUrl = pub?.publicUrl;
        if (publicUrl) {
          setEditAvatar(publicUrl);
          // also reflect instantly in header preview if not editing
          setAvatarUrl(publicUrl);
          // persist to user metadata right away for convenience
          await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
          return;
        }
      } catch {
        // If storage is not configured, fall back to local URI (visible on this device)
        setEditAvatar(asset.uri);
        setAvatarUrl(asset.uri);
        Alert.alert(
          "Local avatar set",
          "Using a local image URI. To persist across devices/sessions, configure a Supabase Storage bucket named “avatars”."
        );
      }
    } catch (e) {
      Alert.alert("Image picker error", String(e?.message || e));
    }
  }, []);

  const onReset = useCallback(() => {
    try {
      if (usePostsStore.getState().resetAll) {
        usePostsStore.getState().resetAll();
        Alert.alert("Reset", "Demo posts cleared — app will reseed on reload.");
      } else {
        Alert.alert(
          "Reset unavailable",
          "Add a resetAll() method to postsStore if you want this dev tool."
        );
      }
    } catch (e) {
      Alert.alert("Error", String(e));
    }
  }, []);

  const onLogout = useCallback(() => {
    Alert.alert("Log out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          try {
            setLoggingOut(true);
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            router.replace("/auth/login");
          } catch (err) {
            Alert.alert("Logout failed", String(err?.message || err));
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  }, [router]);

  return (
    // remove white strip at top: translucent status bar + no hard bg behind it
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "transparent", // 👈 remove white
      }}
      edges={["left", "right", "bottom"]} // 👈 omit top to go under status bar
    >
      <StatusBar
        translucent
        backgroundColor="transparent" // 👈 transparent status bar
        barStyle="dark-content"       // or "light-content" if background is dark
      />

      {/* Header (no bg color, so status area is transparent) */}
      <View style={[styles.header, { backgroundColor: "transparent", paddingTop: 8 }]}>
        <View style={styles.avatarWrap}>
          <Image
            source={avatarUrl}
            key={avatarUrl}
            style={styles.avatar}
            contentFit="cover"
            cachePolicy="disk"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{s(name, "Traveler")}</Text>
          <Text style={styles.handle}>@{s(handleFromEmail(email), "traveler")}</Text>
        </View>

        {/* EDIT */}
        <Pressable onPress={openEdit} style={styles.headerBtn}>
          <Ionicons name="pencil" size={16} color="#111827" />
          <Text style={styles.headerBtnTxt}>Edit</Text>
        </Pressable>

        {/* RESET */}
        <Pressable onPress={onReset} style={[styles.headerBtn, { marginLeft: 8, backgroundColor: "#ffecec" }]}>
          <Ionicons name="refresh" size={16} color="#111827" />
          <Text style={styles.headerBtnTxt}>Reset</Text>
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
        {["Posts", "Saved", "Settings"].map((k) => {
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

      {/* Content / Settings */}
      {tab !== "Settings" ? (
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
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 10 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon" size={18} color="#111827" />
              <Text style={styles.settingLabel}>Dark mode</Text>
            </View>
            <Switch value={dark} onValueChange={setDark} />
          </View>

          <Text style={styles.sectionTitle}>Profile</Text>
          <Pressable onPress={openEdit} style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="person-circle-outline" size={18} color="#111827" />
              <Text style={styles.settingLabel}>Edit profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#111827" />
          </Pressable>
          <Pressable onPress={pickAvatar} style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="image-outline" size={18} color="#111827" />
              <Text style={styles.settingLabel}>Change avatar (gallery)</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#111827" />
          </Pressable>

          <Text style={styles.sectionTitle}>Maintenance</Text>
          <Pressable onPress={onReset} style={[styles.settingRow, { backgroundColor: "#fff7ed", borderColor: "#fed7aa" }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="refresh" size={18} color="#7c2d12" />
              <Text style={[styles.settingLabel, { color: "#7c2d12" }]}>Reset demo data</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#7c2d12" />
          </Pressable>

          <Text style={styles.sectionTitle}>Account</Text>
          <Pressable
            onPress={onLogout}
            style={[styles.settingRow, { backgroundColor: "#fff1f2", borderColor: "#fecdd3" }]}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="log-out-outline" size={18} color="#991b1b" />
              <Text style={[styles.settingLabel, { color: "#991b1b" }]}>{loggingOut ? "Logging out..." : "Log out"}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#991b1b" />
          </Pressable>
        </ScrollView>
      )}

      {/* Post modal */}
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

      {/* Edit modal */}
      <Modal visible={showEdit} animationType="slide" transparent onRequestClose={() => setShowEdit(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.editSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <Pressable onPress={() => setShowEdit(false)} style={styles.modalClose}>
                <Ionicons name="close" size={22} color="#111827" />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Display name</Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder="Your name"
              style={styles.input}
              autoCapitalize="words"
            />

            <Text style={[styles.inputLabel, { marginTop: 8 }]}>Avatar URL</Text>
            <TextInput
              value={editAvatar}
              onChangeText={setEditAvatar}
              placeholder="https://…  (or use Change avatar in Settings)"
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Pressable onPress={pickAvatar} style={[styles.saveBtn, { backgroundColor: "#0f172a" }]}>
              <Text style={styles.saveTxt}>Pick from gallery</Text>
            </Pressable>

            <Pressable onPress={saveEdit} disabled={saving} style={[styles.saveBtn, saving && { opacity: 0.6 }]}>
              <Text style={styles.saveTxt}>{saving ? "Saving…" : "Save changes"}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------------- styles ---------------- */
const R = 16;
const styles = StyleSheet.create({
  container: { flex: 1 },

  // header has no background to avoid a white strip under translucent StatusBar
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 6,
    gap: 12,
  },
  headerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
  },
  headerBtnTxt: { color: "#111827", fontWeight: "800" },

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

  // sheets / modals
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
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

  // edit profile
  editSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 14,
    paddingBottom: 20,
  },
  inputLabel: { fontWeight: "700", color: "#111827", marginBottom: 6 },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  saveBtn: {
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
    marginTop: 14,
  },
  saveTxt: { color: "#fff", fontWeight: "800" },

  // settings list
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6b7280",
    marginTop: 6,
    marginBottom: -2,
    paddingHorizontal: 2,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  settingLabel: { fontWeight: "700", color: "#111827" },
  
});
