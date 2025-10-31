import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase, testConnection } from "../../lib/supabase";
import { useTheme } from "../../utils/theme";

/* ----------------------------- Toast (dropdown) ----------------------------- */
function useToast() {
  const y = useRef(new Animated.Value(-80)).current;
  const [toast, setToast] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info",
  });
  const timers = useRef({ hide: null });

  const COLORS = {
    success: "#16a34a",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#2563eb",
  };
  const ICONS = {
    success: "checkmark-circle-outline",
    error: "close-circle-outline",
    warning: "alert-circle-outline",
    info: "information-circle-outline",
  };

  const show = (type, title, message = "") => {
    setToast({ visible: true, title, message, type });
    Animated.timing(y, {
      toValue: 0,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    if (timers.current.hide) clearTimeout(timers.current.hide);
    timers.current.hide = setTimeout(hide, 3000);
  };

  const hide = () => {
    Animated.timing(y, {
      toValue: -80,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => setToast((t) => ({ ...t, visible: false })));
  };

  const ToastView = ({ topInset = 0 }) => {
    if (!toast.visible) return null;
    const color = COLORS[toast.type] || COLORS.info;
    const icon = ICONS[toast.type] || ICONS.info;
    return (
      <Animated.View
        style={[
          styles.toastWrap,
          { transform: [{ translateY: y }], paddingTop: topInset + 8 },
        ]}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={hide}
          style={({ pressed }) => [
            styles.toast,
            { borderColor: color, backgroundColor: "#fff", opacity: pressed ? 0.95 : 1 },
          ]}
        >
          <Ionicons name={icon} size={20} color={color} style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.toastTitle, { color }]} numberOfLines={1}>
              {toast.title}
            </Text>
            {!!toast.message && (
              <Text style={styles.toastMsg} numberOfLines={2}>
                {toast.message}
              </Text>
            )}
          </View>
          <Ionicons name="chevron-up" size={16} color={"#6b7280"} />
        </Pressable>
      </Animated.View>
    );
  };

  return { show, hide, ToastView };
}
/* --------------------------------------------------------------------------- */

export default function Signup() {
  const t = useTheme();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [busy, setBusy] = useState(false);

  const { show, ToastView } = useToast();
  const topInset = Platform.select({ android: StatusBar.currentHeight || 0, ios: 0, default: 0 });

  // Offset to keep content above keyboard (accounts for status bar + navbar height)
  const keyboardOffset = (topInset || 0) + 56;

  const submit = async () => {
    const emailNorm = String(email).trim().toLowerCase();
    const uname = String(username).trim();

    if (!uname || !email || !pwd || !confirmPwd)
      return show("warning", "Missing fields", "Enter username, email, password, and confirm password.");
    if (uname.length < 3)
      return show("warning", "Short username", "Username must be at least 3 characters.");
    if (pwd.length < 6)
      return show("warning", "Weak password", "Use at least 6 characters.");
    if (pwd !== confirmPwd)
      return show("warning", "Passwords do not match", "Make sure both passwords are the same.");

    try {
      setBusy(true);

      // quick network check
      try {
        await testConnection();
      } catch (netErr) {
        return show("error", "Network error", netErr?.message || "Cannot reach Supabase host");
      }

      const { data, error } = await supabase.auth.signUp({
        email: emailNorm,
        password: pwd,
        options: { data: { username: uname } },
      });
      if (error) return show("error", "Sign up failed", error.message || String(error));

      if (data && !data.session) {
        show("info", "Check your email", "Account created — please confirm your email.");
        try {
          const { error: otpError } = await supabase.auth.signInWithOtp({ email: emailNorm });
          if (otpError) show("error", "Magic link failed", otpError.message || String(otpError));
          else show("success", "Magic link sent", "Check your inbox to finish signing in.");
        } catch (e) {
          show("error", "Magic link failed", String(e));
        }
        setTimeout(() => router.replace("/auth/login"), 350);
        return;
      }

      show("success", "Account created", `Welcome, ${uname}!`);
      router.replace("/feeds");
    } catch (err) {
      show("error", "Sign up failed", String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={keyboardOffset}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          contentContainerStyle={{ padding: 18, flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        >
          <View style={[styles.screen, { backgroundColor: t.bg }]}>
            <StatusBar barStyle={t.text === "#FFFFFF" ? "light-content" : "dark-content"} />

            {/* Dropdown toast */}
            <ToastView topInset={topInset} />

            {/* 🔙 Top navigation bar */}
            <View className="navbar" style={styles.navbar}>
              <Pressable
                onPress={() => {
                  if (router.canGoBack()) router.back();
                  else router.replace("/onboarding");
                }}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.backBtn,
                  { backgroundColor: pressed ? t.subtle : "transparent" },
                ]}
              >
                <Ionicons name="arrow-back" size={22} color={t.text} />
              </Pressable>
              <Text style={[styles.navTitle, { color: t.text }]}>Sign Up</Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Title */}
            <View style={styles.headerWrap}>
              <View style={[styles.logo, { backgroundColor: t.subtle, borderColor: t.border }]}>
                <Ionicons name="sparkles-outline" size={22} color={t.primary} />
              </View>
              <Text style={[styles.title, { color: t.text }]}>Create your account</Text>
              <Text style={[styles.subtitle, { color: t.text + "99" }]}>
                Join Travelogue and share your journeys
              </Text>
            </View>

            {/* Card */}
            <View style={[styles.card, { backgroundColor: "#fff", borderColor: t.border }]}>
              {/* Username */}
              <View style={styles.field}>
                <Text style={[styles.label, { color: t.text }]}>Username</Text>
                <View style={[styles.inputWrap, { borderColor: t.border, backgroundColor: "#fff" }]}>
                  <Ionicons name="person-outline" size={18} color={t.text + "99"} style={styles.leftIcon} />
                  <TextInput
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    placeholder="yourusername"
                    placeholderTextColor={t.text + "66"}
                    style={[styles.input, { color: t.text }]}
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef?.current?.focus?.()}
                    blurOnSubmit={false}
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.field}>
                <Text style={[styles.label, { color: t.text }]}>Email</Text>
                <View style={[styles.inputWrap, { borderColor: t.border, backgroundColor: "#fff" }]}>
                  <Ionicons name="mail-outline" size={18} color={t.text + "99"} style={styles.leftIcon} />
                  <TextInput
                    ref={emailRef}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="you@mail.com"
                    placeholderTextColor={t.text + "66"}
                    style={[styles.input, { color: t.text }]}
                    returnKeyType="next"
                    onSubmitEditing={() => pwdRef?.current?.focus?.()}
                    blurOnSubmit={false}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.field}>
                <Text style={[styles.label, { color: t.text }]}>Password</Text>
                <View style={[styles.inputWrap, { borderColor: t.border, backgroundColor: "#fff" }]}>
                  <Ionicons name="lock-closed-outline" size={18} color={t.text + "99"} style={styles.leftIcon} />
                  <TextInput
                    ref={pwdRef}
                    value={pwd}
                    onChangeText={setPwd}
                    secureTextEntry
                    placeholder="••••••••"
                    placeholderTextColor={t.text + "66"}
                    style={[styles.input, { color: t.text }]}
                    returnKeyType="next"
                    onSubmitEditing={() => confirmRef?.current?.focus?.()}
                    blurOnSubmit={false}
                  />
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.field}>
                <Text style={[styles.label, { color: t.text }]}>Confirm Password</Text>
                <View style={[styles.inputWrap, { borderColor: t.border, backgroundColor: "#fff" }]}>
                  <Ionicons name="checkmark-done-outline" size={18} color={t.text + "99"} style={styles.leftIcon} />
                  <TextInput
                    ref={confirmRef}
                    value={confirmPwd}
                    onChangeText={setConfirmPwd}
                    secureTextEntry
                    placeholder="Repeat password"
                    placeholderTextColor={t.text + "66"}
                    style={[styles.input, { color: t.text }]}
                    returnKeyType="go"
                    onSubmitEditing={submit}
                  />
                </View>
              </View>

              {/* Submit */}
              <Pressable
                onPress={submit}
                disabled={busy}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { backgroundColor: t.primary, borderColor: t.primary, opacity: pressed || busy ? 0.9 : 1 },
                ]}
              >
                {busy ? (
                  <ActivityIndicator color={t.onPrimary} />
                ) : (
                  <>
                    <Ionicons name="person-add-outline" size={18} color={t.onPrimary} />
                    <Text style={[styles.primaryText, { color: t.onPrimary }]}>Create and continue</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

/* Refs for chaining focus (declare after the component for clarity) */
const emailRef = React.createRef();
const pwdRef = React.createRef();
const confirmRef = React.createRef();

/* ------------------------------ Styles ------------------------------ */
const R = 16;
const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: "center" }, // padding now handled by ScrollView

  // Toast
  toastWrap: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    alignItems: "center",
    zIndex: 20,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 12,
    width: "94%",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  toastTitle: { fontWeight: "800", fontSize: 14 },
  toastMsg: { fontSize: 12, color: "#374151" },

  // Top bar
  navbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  navTitle: { fontSize: 20, fontWeight: "700" },

  headerWrap: { alignItems: "center", marginBottom: 18 },
  logo: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, marginBottom: 10,
  },
  title: { fontSize: 26, fontWeight: "800" },
  subtitle: { fontSize: 14, marginTop: 4 },

  card: {
    borderWidth: 1, borderRadius: 20, padding: 16,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 }, elevation: 3,
  },

  field: { marginBottom: 12 },
  label: { fontWeight: "700", marginBottom: 8 },

  inputWrap: {
    height: 52, borderWidth: 1, borderRadius: R,
    paddingLeft: 42, paddingRight: 14,
    alignItems: "center", flexDirection: "row",
  },
  input: { flex: 1, fontSize: 16 },
  leftIcon: { marginLeft: 12, marginRight: 8 },

  primaryBtn: {
    height: 52, borderRadius: R, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
    flexDirection: "row", gap: 8, marginTop: 10,
    shadowColor: "#22a06b", shadowOpacity: 0.2, shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 }, elevation: 4,
  },
  primaryText: { fontWeight: "800", fontSize: 16 },
});
