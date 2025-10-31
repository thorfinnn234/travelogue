import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const DialogCtx = createContext(null);

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState(null); 
  // dialog = { type: 'alert'|'confirm', title, message, icon, okText, cancelText, onOk, onCancel }

  // small fade/scale animation per open
  const [visible, setVisible] = useState(false);
  const scale = new Animated.Value(0.95);
  const fade = new Animated.Value(0);

  const open = useCallback((payload) => {
    setDialog(payload);
    setVisible(true);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 7 }),
    ]).start();
  }, []);

  const close = useCallback(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 0, duration: 140, useNativeDriver: true, easing: Easing.in(Easing.quad) }),
      Animated.timing(scale, { toValue: 0.95, duration: 140, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) {
        setVisible(false);
        setDialog(null);
      }
    });
  }, []);

  const alert = useCallback(
    ({ title, message, icon = "information-circle", okText = "OK", onOk } = {}) =>
      open({ type: "alert", title, message, icon, okText, onOk }),
    [open]
  );

  const confirm = useCallback(
    ({
      title,
      message,
      icon = "help-circle-outline",
      okText = "Yes",
      cancelText = "Cancel",
      destructive = false,
      onOk,
      onCancel,
    } = {}) =>
      open({ type: "confirm", title, message, icon, okText, cancelText, destructive, onOk, onCancel }),
    [open]
  );

  const value = useMemo(() => ({ alert, confirm, close }), [alert, confirm, close]);

  return (
    <DialogCtx.Provider value={value}>
      {children}

      <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
        <Animated.View style={[styles.backdrop, { opacity: fade }]}>
          <Pressable style={{ flex: 1 }} onPress={close} />
        </Animated.View>

        <Animated.View style={[styles.centerWrap, { transform: [{ scale }], opacity: fade }]}>
          {!!dialog && <Card dialog={dialog} close={close} />}
        </Animated.View>
      </Modal>
    </DialogCtx.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogCtx);
  if (!ctx) throw new Error("useDialog must be used within <DialogProvider>");
  return ctx;
}

/* ------------ presentational card ------------ */
function Card({ dialog, close }) {
  const {
    type,
    title = "Are you sure?",
    message = "",
    icon = "help-circle-outline",
    okText = type === "alert" ? "OK" : "Yes",
    cancelText = "Cancel",
    destructive = false,
    onOk,
    onCancel,
  } = dialog || {};

  const ok = () => {
    try { onOk?.(); } finally { close(); }
  };
  const cancel = () => {
    try { onCancel?.(); } finally { close(); }
  };

  const color = destructive ? "#b91c1c" : "#0f172a"; // red-700 vs slate-900

  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: destructive ? "#fee2e2" : "#eef2ff", borderColor: destructive ? "#fecaca" : "#c7d2fe" }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {!!message && <Text style={styles.msg}>{message}</Text>}

      <View style={styles.row}>
        {type === "confirm" && (
          <Pressable style={[styles.btn, styles.ghost]} onPress={cancel}>
            <Text style={[styles.btnText, { color: "#111827" }]}>{cancelText}</Text>
          </Pressable>
        )}
        <Pressable
          style={[
            styles.btn,
            destructive ? styles.danger : styles.primary,
          ]}
          onPress={ok}
        >
          <Text style={[styles.btnText, { color: "#fff" }]}>{okText}</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ------------ styles ------------ */
const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  centerWrap: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 18,
    backgroundColor: "#fff",
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  iconWrap: {
    alignSelf: "flex-start",
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
    marginBottom: 10,
  },
  title: { fontSize: 18, fontWeight: "800", color: "#111827" },
  msg: { color: "#374151", marginTop: 6, lineHeight: 20 },
  row: { flexDirection: "row", gap: 10, marginTop: 14, justifyContent: "flex-end" },
  btn: {
    height: 44, borderRadius: 12, paddingHorizontal: 14,
    alignItems: "center", justifyContent: "center", minWidth: 110,
    borderWidth: 1,
  },
  ghost: { backgroundColor: "#fff", borderColor: "#e5e7eb" },
  primary: { backgroundColor: "#111827", borderColor: "#111827" },
  danger: { backgroundColor: "#dc2626", borderColor: "#dc2626" },
  btnText: { fontWeight: "800" },
});
