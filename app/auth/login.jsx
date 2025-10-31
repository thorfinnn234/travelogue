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
import { Link, useRouter } from "expo-router";
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
    type: "info", // "success" | "error" | "warning" | "info"
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
    // animate in
    Animated.timing(y, {
      toValue: 0,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // auto hide after 3s
    if (timers.current.hide) clearTimeout(timers.current.hide);
    timers.current.hide = setTimeout(() => hide(), 3000);
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
            {
              borderColor: color,
              backgroundColor: "#fff",
              opacity: pressed ? 0.95 : 1,
            },
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

export default function Login() {
  const t = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  // input refs for focus chaining
  const emailRef = useRef(null);
  const pwdRef = useRef(null);

  // dropdown toast
  const { show, ToastView } = useToast();

  const submit = async () => {
    if (!email || !pwd) {
      return show("warning", "Missing fields", "Enter email and password");
    }
    try {
      setBusy(true);

      try {
        await testConnection();
      } catch (netErr) {
        return show("error", "Network error", netErr?.message || "Cannot reach Supabase host");
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: String(email).trim().toLowerCase(),
        password: pwd,
      });

      if (error) {
        const msg = error.message || String(error);

        if (/confirm|not confirmed|not_confirmed|User.*confirm/i.test(msg)) {
          // offer magic link
          show("info", "Email not confirmed", "Sending magic link...");
          try {
            const { error: otpErr } = await supabase.auth.signInWithOtp({
              email: String(email).trim().toLowerCase(),
            });
            if (otpErr) {
              show("error", "Send failed", otpErr.message || String(otpErr));
            } else {
              show("success", "Sent ✅", "Magic link sent — check your email.");
            }
          } catch (e) {
            show("error", "Send failed", String(e));
          }
          return; // don't proceed to router
        }

        return show("error", "Sign in failed", msg);
      }

      show("success", "Welcome back!", "Signing you in…");
      router.replace("/feeds");
    } catch (err) {
      show("error", "Sign in failed", String(err));
    } finally {
      setBusy(false);
    }
  };

  // top inset + keyboard offset (same pattern as Signup)
  const topInset = Platform.select({ android: StatusBar.currentHeight || 0, ios: 0, default: 0 });
  const keyboardOffset = (topInset || 0) + 56; // ~navbar height

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

            {/* Toast dropdown lives at the very top */}
            <ToastView topInset={topInset} />

            {/* Back nav */}
            <View style={styles.navbar}>
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
              <Text style={[styles.navTitle, { color: t.text }]}>Login</Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Header */}
            <View style={styles.headerWrap}>
              <View style={[styles.logo, { backgroundColor: t.subtle, borderColor: t.border }]}>
                <Ionicons name="airplane-outline" size={24} color={t.primary} />
              </View>
              <Text style={[styles.title, { color: t.text }]}>Welcome back</Text>
              <Text style={[styles.subtitle, { color: t.text + "99" }]}>
                Sign in to continue your travel stories
              </Text>
            </View>

            {/* Card */}
            <View style={[styles.card, { backgroundColor: "#fff", borderColor: t.border }]}>
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
                    onSubmitEditing={() => pwdRef.current?.focus?.()}
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
                    secureTextEntry={!showPwd}
                    placeholder="••••••••"
                    placeholderTextColor={t.text + "66"}
                    style={[styles.input, { color: t.text }]}
                    returnKeyType="go"
                    onSubmitEditing={submit}
                  />
                  <Pressable onPress={() => setShowPwd((s) => !s)} hitSlop={10} style={styles.rightIconBtn}>
                    <Ionicons name={showPwd ? "eye-off-outline" : "eye-outline"} size={18} color={t.text + "99"} />
                  </Pressable>
                </View>
              </View>

              {/* Forgot */}
              <View style={styles.rowBetween}>
                <View />
                <Link href="/auth/forgot" asChild>
                  <Text style={[styles.forgot, { color: t.primary }]}>Forgot password?</Text>
                </Link>
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
                    <Ionicons name="log-in-outline" size={18} color={t.onPrimary} />
                    <Text style={[styles.primaryText, { color: t.onPrimary }]}>Continue</Text>
                  </>
                )}
              </Pressable>

              {/* Footer */}
              <Text style={[styles.footer, { color: t.text + "99" }]}>
                New here?{" "}
                <Link href="/auth/signup" asChild>
                  <Text style={{ color: t.primary, fontWeight: "700" }}>Create account</Text>
                </Link>
              </Text>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

/* ------------------------------ Styles ------------------------------ */
const R = 16;
const styles = StyleSheet.create({
  // padding now comes from ScrollView to play nice with keyboard
  screen: { flex: 1, justifyContent: "center" },

  // Toast
  toastWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
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
  logo: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", borderWidth: 1, marginBottom: 10 },
  title: { fontSize: 26, fontWeight: "800" },
  subtitle: { fontSize: 14, marginTop: 4 },

  card: { borderWidth: 1, borderRadius: 20, padding: 16, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3 },

  field: { marginBottom: 12 },
  label: { fontWeight: "700", marginBottom: 8 },
  inputWrap: { height: 52, borderWidth: 1, borderRadius: R, paddingLeft: 42, paddingRight: 42, alignItems: "center", flexDirection: "row" },
  input: { flex: 1, fontSize: 16 },
  leftIcon: { marginLeft: 12, marginRight: 8 },
  rightIconBtn: { paddingHorizontal: 12, height: "100%", justifyContent: "center" },

  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  forgot: { fontWeight: "700" },
  primaryBtn: { height: 52, borderRadius: R, borderWidth: 1, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, marginTop: 10, shadowColor: "#22a06b", shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  primaryText: { fontWeight: "800", fontSize: 16 },
  footer: { textAlign: "center", marginTop: 18 },
});
