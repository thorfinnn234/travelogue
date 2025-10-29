import React from "react";
import { Modal, View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function CustomAlert({ visible, title, message, onClose, icon, color }) {
  if (!visible) return null;

  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={[styles.box, { borderColor: color || "#22a06b" }]}>
          {icon && (
            <View style={[styles.iconWrap, { backgroundColor: (color || "#22a06b") + "20" }]}>
              <Ionicons name={icon} size={28} color={color || "#22a06b"} />
            </View>
          )}
          <Text style={[styles.title, { color: color || "#22a06b" }]}>{title}</Text>
          <Text style={styles.msg}>{message}</Text>

          <Pressable onPress={onClose} style={({ pressed }) => [styles.btn, { opacity: pressed ? 0.8 : 1, backgroundColor: color || "#22a06b" }]}>
            <Text style={styles.btnText}>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const R = 18;
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    width: width * 0.82,
    backgroundColor: "#fff",
    borderRadius: R,
    borderWidth: 2,
    padding: 22,
    alignItems: "center",
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 6 },
  msg: { fontSize: 15, color: "#374151", textAlign: "center", marginBottom: 18 },
  btn: {
    width: "60%",
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
