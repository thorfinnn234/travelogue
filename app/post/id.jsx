import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Dimensions, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { COLORS } from "../../utils/theme";
import { useCommentsStore } from "../store/commentsStore";
import { usePostsStore } from "../store/postsStore";

const H = 56;

export default function PostDetail() {
  const { id } = useLocalSearchParams(); // post id from route
  const router = useRouter();
  const post = usePostsStore((s) => s.posts.find((p) => p.id === id));
  const comments = useCommentsStore((s) => s.getFor(String(id)));
  const addComment = useCommentsStoremmentsStore((s) => s.add);

  const [text, setText] = useState("");

  const onSend = () => {
    if (!text.trim()) return;
    addComment(String(id), { body: text });
    setText("");
  };

  if (!post) {
    return (
      <View style={styles.center}>
        <Text>Post not found</Text>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {/* Header */}
      <View style={styles.topbar}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </Pressable>
        <Text style={styles.title}>Post</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Post content */}
      <FlatList
        data={comments}
        keyExtractor={(it) => it.id}
        ListHeaderComponent={
          <View>
            {/* Author row */}
            <View style={styles.authorRow}>
              <Image source={post.user.avatar} style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{post.user.name}</Text>
                <Text style={styles.meta}>{post.location}</Text>
              </View>
            </View>

            {/* Photo */}
            <Image source={post.image} style={styles.photo} contentFit="cover" cachePolicy="disk" />

            {/* Caption */}
            <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 }}>
              <Text style={{ color: COLORS.black }}>
                <Text style={[styles.name]}>{post.user.name} </Text>
                {post.caption}
              </Text>
            </View>

            {/* Divider + header */}
            <View style={{ height: 1, backgroundColor: "#e5e7eb", marginVertical: 6 }} />
            <Text style={{ paddingHorizontal: 16, paddingBottom: 8, color: "#6b7280", fontWeight: "700" }}>
              Comments ({comments.length})
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.commentRow}>
            <Image source={item.authorAvatar} style={styles.cAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cName}>{item.authorName}</Text>
              <Text style={styles.cBody}>{item.body}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: H + 24 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Composer */}
      <View style={styles.composer}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Add a comment…"
          placeholderTextColor="#9ca3af"
          style={styles.input}
        />
        <Pressable onPress={onSend} hitSlop={8} style={styles.sendBtn}>
          <Ionicons name="send" size={18} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  back: { paddingHorizontal: 16, height: 44, borderRadius: 12, backgroundColor: "#111827", alignItems:"center", justifyContent:"center" },

  topbar: { height: 52, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#e5e7eb" },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "800", color: "#111827" },

  authorRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#e5e7eb" },
  name: { fontWeight: "700", color: "#111827" },
  meta: { color: "#6b7280", fontSize: 12 },

  photo: { width: "100%", height: Math.round((Dimensions?.get("window")?.width || 360) * 1.25), backgroundColor: "#f3f4f6" },

  commentRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 10 },
  cAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#e5e7eb" },
  cName: { fontWeight: "700", color: "#111827" },
  cBody: { color: "#111827" },

  composer: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 10, paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  input: { flex: 1, height: 40, borderRadius: 10, borderWidth: 1, borderColor: "#e5e7eb", paddingHorizontal: 12, color: "#111827" },
  sendBtn: { width: 44, height: 40, borderRadius: 10, backgroundColor: "#111827", alignItems: "center", justifyContent: "center" },
});
