// app/create.jsx
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { COLORS } from "../../utils/theme";
import { usePostsStore } from "../store/postsStore";

const MAX_CAPTION = 2200;

export default function CreateScreen() {
  const router = useRouter();
  const addPost = usePostsStore((s) => s.addPost);

  const [image, setImage] = useState(null); // { uri, width, height }
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(
    () => !!image && caption.trim().length > 0 && !loading,
    [image, caption, loading]
  );

  const askMediaPerms = async () => {
    const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!lib.granted) {
      Alert.alert("Permission needed", "Please allow photo library access.");
      return false;
    }
    return true;
  };

  const askCameraPerms = async () => {
    const cam = await ImagePicker.requestCameraPermissionsAsync();
    if (!cam.granted) {
      Alert.alert("Permission needed", "Please allow camera access.");
      return false;
    }
    return true;
  };

  const pickFromGallery = async () => {
    const ok = await askMediaPerms();
    if (!ok) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.9,
    });
    if (!res.canceled) {
      const a = res.assets[0];
      setImage({ uri: a.uri, width: a.width, height: a.height });
    }
  };

  const takePhoto = async () => {
    const ok = await askCameraPerms();
    if (!ok) return;
    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.9,
    });
    if (!res.canceled) {
      const a = res.assets[0];
      setImage({ uri: a.uri, width: a.width, height: a.height });
    }
  };

  const onSubmit = async () => {
    try {
      setLoading(true);

      try {
        console.debug("create:onSubmit -> image.uri", image?.uri);
      } catch {}

      addPost({
        imageUri: image?.uri || "https://i.pravatar.cc/150?u=you",
        caption: caption.trim(),
        location: location.trim(),
        userName: "You",
        userAvatar: "https://i.pravatar.cc/150?u=you",
      });

      Alert.alert("Posted 🎉", "Your travel post has been created.");
      if (router.canGoBack()) router.back();
      else router.replace("/feeds");
    } catch (e) {
      Alert.alert("Error", e.message || "Could not create post.");
    } finally {
      setLoading(false);
    }
  };

  const bg = (COLORS && COLORS.white) || "#ffffff";
  const fg = (COLORS && COLORS.black) || "#111827";
  const subtle = "#6b7280";
  const border = "#e5e7eb";

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={{ flex: 1, backgroundColor: bg }}
    >
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* 🔙 Top navbar with Back */}
        <View style={styles.navbar}>
          <Pressable
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace("/feeds");
            }}
            hitSlop={10}
            style={({ pressed }) => [
              styles.backBtn,
              { backgroundColor: pressed ? "#f3f4f6" : "transparent" },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go back to feed"
          >
            <Ionicons name="arrow-back" size={22} color={fg} />
          </Pressable>
          <Text style={[styles.navTitle, { color: fg }]}>Create Post</Text>
          <View style={{ width: 40 }} />
        </View>

        {image ? (
          <View style={styles.previewWrap}>
            {/* pass the whole image object to expo-image */}
            <Image source={image} style={styles.preview} contentFit="cover" transition={200} />
            <View style={styles.previewActions}>
              <Pressable style={[styles.btn, styles.btnGhost]} onPress={pickFromGallery}>
                <Ionicons name="images-outline" size={18} color={fg} />
                <Text style={[styles.btnGhostText, { color: fg }]}>Change</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnGhost]} onPress={() => setImage(null)}>
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
                <Text style={[styles.btnGhostText, { color: "#ef4444" }]}>Remove</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={[styles.drop, { borderColor: border, backgroundColor: "#fafafa" }]}>
            <Ionicons name="image-outline" size={32} color={subtle} />
            <Text style={[styles.dropText, { color: subtle }]}>Add a travel photo</Text>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <Pressable style={[styles.btn, styles.btnDark]} onPress={pickFromGallery}>
                <Ionicons name="images-outline" size={18} color="#fff" />
                <Text style={styles.btnDarkText}>Gallery</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnLight]} onPress={takePhoto}>
                <Ionicons name="camera-outline" size={18} color={fg} />
                <Text style={[styles.btnLightText, { color: fg }]}>Camera</Text>
              </Pressable>
            </View>
          </View>
        )}

        <Text style={[styles.label, { color: fg }]}>Caption</Text>
        <TextInput
          placeholder="Tell your travel story…"
          placeholderTextColor={subtle}
          value={caption}
          onChangeText={(t) => setCaption(t.length <= MAX_CAPTION ? t : t.slice(0, MAX_CAPTION))}
          multiline
          style={[styles.inputArea, { color: fg, borderColor: border, backgroundColor: "#fff" }]}
          textAlignVertical="top"
          maxLength={MAX_CAPTION}
        />
        <Text style={[styles.helper, { color: subtle }]}>
          {caption.length}/{MAX_CAPTION}
        </Text>

        <Text style={[styles.label, { color: fg }]}>Location</Text>
        <TextInput
          placeholder="e.g. Santorini, Greece"
          placeholderTextColor={subtle}
          value={location}
          onChangeText={setLocation}
          style={[styles.input, { color: fg, borderColor: border, backgroundColor: "#fff" }]}
        />

        <Pressable
          disabled={!canSubmit}
          onPress={onSubmit}
          style={({ pressed }) => [
            styles.submit,
            { backgroundColor: canSubmit ? "#111827" : "#9ca3af", opacity: pressed ? 0.9 : 1 },
          ]}
        >
          {loading ? (
            <ActivityIndicator />
          ) : (
            <>
              <Ionicons name="paper-plane-outline" size={18} color="#fff" />
              <Text style={styles.submitText}>Post</Text>
            </>
          )}
        </Pressable>

        <Text style={[styles.tip, { color: subtle }]}>
          For real uploads, send a FormData POST to your backend, then prepend the API’s returned post.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Navbar
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: { fontSize: 20, fontWeight: "800" },

  // Rest
  h1: { fontSize: 26, fontWeight: "800", marginBottom: 16 },
  drop: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  dropText: { marginTop: 8, fontSize: 13 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  btnDark: { backgroundColor: "#111827" },
  btnDarkText: { color: "#fff", fontWeight: "700" },
  btnLight: { backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e5e7eb" },
  btnLightText: { fontWeight: "700" },
  btnGhost: { backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e5e7eb" },
  btnGhostText: { fontWeight: "700" },

  previewWrap: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  preview: { width: "100%", aspectRatio: 4 / 5, backgroundColor: "#f3f4f6" },
  previewActions: { flexDirection: "row", gap: 10, padding: 10, justifyContent: "flex-end" },

  label: { fontWeight: "700", marginTop: 16, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16 },
  inputArea: { minHeight: 120, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingTop: 12, fontSize: 16 },
  helper: { alignSelf: "flex-end", marginTop: 6, fontSize: 12 },
  submit: {
    marginTop: 20,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  submitText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  tip: { fontSize: 12, marginTop: 10, textAlign: "center" },
});
