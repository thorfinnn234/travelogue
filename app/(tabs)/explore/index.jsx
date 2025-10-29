// app/(tabs)/explore/index.jsx
import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  Pressable,
  Dimensions,
  Modal,
  SafeAreaView,
  Linking,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useWishlistStore } from "../../store/wishlistStore"; // make sure this exists (see wishlistStore.js)
import { COLORS } from "../../../utils/theme";

const { width } = Dimensions.get("window");
const CARD_W = width - 32;
const CARD_H = Math.round(CARD_W * 0.62); // cinematic 16:10-ish

// Real Unsplash photos (no API key needed - static links)
const PLACES = [
  {
    id: "1",
    name: "Bali Island",
    country: "Indonesia",
    tagline: "Beaches, temples & rice terraces.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1400&auto=format&fit=crop",
    desc:
      "Bali, the Island of the Gods, blends spiritual culture with natural beauty. Explore Ubud’s rice terraces, sunrise hikes at Mount Batur, and coastline temples like Tanah Lot.",
  },
  {
    id: "2",
    name: "Santorini",
    country: "Greece",
    tagline: "White houses & blue domes at sunset.",
    image: "https://images.unsplash.com/photo-1505739772971-8d3030a6e8c7?q=80&w=1400&auto=format&fit=crop",
    desc:
      "Santorini’s caldera views and iconic Cycladic architecture make it a dream destination. Enjoy volcanic beaches, cliffside cafés, and sunsets from Oia.",
  },
  {
    id: "3",
    name: "Tokyo",
    country: "Japan",
    tagline: "Neon nights & timeless temples.",
    image: "https://images.unsplash.com/photo-1549692520-acc6669e2f0c?q=80&w=1400&auto=format&fit=crop",
    desc:
      "From Shibuya Crossing to serene Meiji Shrine, Tokyo pairs ultramodern energy with deep tradition. Savor sushi, anime culture, and tech-forward neighborhoods.",
  },
  {
    id: "4",
    name: "Paris",
    country: "France",
    tagline: "Art, fashion & cafés by the Seine.",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1400&auto=format&fit=crop",
    desc:
      "Paris is the city of light and love. Climb the Eiffel Tower, stroll Montmartre, visit the Louvre, and linger at terrace cafés with a fresh croissant.",
  },
  {
    id: "5",
    name: "Marrakesh",
    country: "Morocco",
    tagline: "Souks, spices & riad courtyards.",
    image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1400&auto=format&fit=crop",
    desc:
      "Lose yourself in the medina’s maze, shop vibrant souks, relax in riads, and explore nearby Atlas Mountains or desert camp experiences.",
  },
  {
    id: "6",
    name: "Reykjavík",
    country: "Iceland",
    tagline: "Geothermal spas & northern lights.",
    image: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=1400&auto=format&fit=crop",
    desc:
      "Base yourself in Reykjavík for the Blue Lagoon, Golden Circle waterfalls, black-sand beaches, and a chance to see the aurora on clear winter nights.",
  },
  {
    id: "7",
    name: "Dubai",
    country: "UAE",
    tagline: "Luxury, skyscrapers & desert adventures.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1400&auto=format&fit=crop",
    desc: "Dubai dazzles with its futuristic skyline, vast deserts, luxury malls, and world-class dining — a city that blends modern ambition with Arabian charm.",
  },
  {
    id: "8",
    name: "Cape Town",
    country: "South Africa",
    tagline: "Mountains, beaches & wine country.",
    image: "https://images.unsplash.com/photo-1600047509807-ba4f7fc7edaa?q=80&w=1400&auto=format&fit=crop",
    desc: "Cape Town sits between ocean and mountain, offering hikes up Table Mountain, penguins at Boulders Beach, and vineyards in nearby Stellenbosch.",
  },
  {
    id: "9",
    name: "Kyoto",
    country: "Japan",
    tagline: "Temples, gardens & geisha culture.",
    image: "https://images.unsplash.com/photo-1508253759832-af2e0b47d5d0?q=80&w=1400&auto=format&fit=crop",
    desc: "Kyoto preserves Japan’s traditional heart — explore golden temples, tranquil gardens, teahouses, and historic streets lined with wooden machiya.",
  },
  {
    id: "10",
    name: "New York City",
    country: "USA",
    tagline: "Skyscrapers, art & endless energy.",
    image: "https://images.unsplash.com/photo-1528892952291-009c663ce843?q=80&w=1400&auto=format&fit=crop",
    desc: "NYC is a melting pot of culture and creativity. From Times Square to Central Park, Broadway to Brooklyn — the city never sleeps or disappoints.",
  },
  {
    id: "11",
    name: "Sydney",
    country: "Australia",
    tagline: "Opera House, beaches & coastal vibes.",
    image: "https://images.unsplash.com/photo-1510749342490-cc296c6df763?q=80&w=1400&auto=format&fit=crop",
    desc: "Sydney shines with its iconic harbor, surf-ready beaches, and lively cafés. Take a ferry to Manly, climb the Harbour Bridge, or visit Bondi’s coastal walk.",
  },
  {
    id: "12",
    name: "Venice",
    country: "Italy",
    tagline: "Canals, gondolas & Renaissance charm.",
    image: "https://images.unsplash.com/photo-1508264165352-258859e62245?q=80&w=1400&auto=format&fit=crop",
    desc: "Venice is pure magic — sail through canals, admire Gothic palaces, and lose yourself in narrow alleyways where history whispers at every turn.",
  },
];


const openInMaps = (place) => {
  const q = encodeURIComponent(`${place.name}, ${place.country}`);
  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
};

export default function ExploreScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState(null);

  const toggleWish = useWishlistStore((s) => s.toggle);
  const isSaved = useWishlistStore((s) => s.isSaved);

  const data = useMemo(() => PLACES, []);

  const renderItem = useCallback(
    ({ item }) => (
      <Pressable style={[styles.card, { backgroundColor: "#fff", borderColor: "#e5e7eb" }]} onPress={() => setSelected(item)}>
        {/* Image */}
        <Image
          source={item.image}
          style={styles.image}
          contentFit="cover"
          cachePolicy="disk"
          transition={200}
        />

        {/* Save button */}
        <Pressable
          onPress={() => toggleWish(item.id)}
          hitSlop={10}
          style={({ pressed }) => [
            styles.saveBtn,
            { opacity: pressed ? 0.85 : 1, backgroundColor: "rgba(17,24,39,0.75)" },
          ]}
        >
          <Ionicons
            name={isSaved(item.id) ? "bookmark" : "bookmark-outline"}
            size={18}
            color="#fff"
          />
        </Pressable>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.country} numberOfLines={1}>
            {item.country}
          </Text>
          <Text style={styles.tagline} numberOfLines={2}>
            {item.tagline}
          </Text>

          <View style={styles.actionsRow}>
            <Pressable
              onPress={() => setSelected(item)}
              style={({ pressed }) => [styles.primaryBtn, { opacity: pressed ? 0.9 : 1 }]}
            >
              <Text style={styles.primaryText}>View more</Text>
            </Pressable>
            <Pressable
              onPress={() => openInMaps(item)}
              style={({ pressed }) => [styles.ghostBtn, { opacity: pressed ? 0.9 : 1 }]}
            >
              <Ionicons name="location-outline" size={16} color="#111827" />
              <Text style={styles.ghostText}>Open in Maps</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    ),
    [toggleWish, isSaved]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS?.white || "#fff" }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Top bar */}
      <View style={styles.topbar}>
        <Text style={styles.h1}>Explore</Text>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.topIcon}>
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </Pressable>
      </View>

      <FlatList
        data={data}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
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
                    <Text style={styles.modalTitle}>{selected.name}</Text>
                    <Text style={styles.modalCountry}>{selected.country}</Text>
                  </View>
                  <Pressable
                    onPress={() => toggleWish(selected.id)}
                    hitSlop={10}
                    style={styles.wishIcon}
                  >
                    <Ionicons
                      name={isSaved(selected.id) ? "bookmark" : "bookmark-outline"}
                      size={20}
                      color="#111827"
                    />
                  </Pressable>
                  <Pressable onPress={() => setSelected(null)} hitSlop={10} style={styles.closeIcon}>
                    <Ionicons name="close" size={22} color="#111827" />
                  </Pressable>
                </View>

                <Image
                  source={selected.image}
                  style={styles.modalImage}
                  contentFit="cover"
                  cachePolicy="disk"
                />

                <ScrollView
                  style={{ maxHeight: 260 }}
                  contentContainerStyle={{ paddingBottom: 16 }}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.modalDesc}>{selected.desc}</Text>
                </ScrollView>

                <View style={styles.modalActions}>
                  <Pressable
                    onPress={() => openInMaps(selected)}
                    style={({ pressed }) => [styles.mapBtn, { opacity: pressed ? 0.9 : 1 }]}
                  >
                    <Ionicons name="navigate-outline" size={18} color="#fff" />
                    <Text style={styles.mapText}>Open in Maps</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      toggleWish(selected.id);
                    }}
                    style={({ pressed }) => [styles.saveBigBtn, { opacity: pressed ? 0.9 : 1 }]}
                  >
                    <Ionicons
                      name={isSaved(selected.id) ? "bookmark" : "bookmark-outline"}
                      size={18}
                      color="#111827"
                    />
                    <Text style={styles.saveBigText}>
                      {isSaved(selected.id) ? "Saved" : "Add to wishlist"}
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ----------------- Styles ----------------- */
const R = 16;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  topbar: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  h1: { fontSize: 24, fontWeight: "800", color: "#111827" },
  topIcon: {
    position: "absolute",
    left: 16,
    top: 6,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },

  card: {
    width: "100%",
    borderRadius: R,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  image: { width: "100%", height: CARD_H, backgroundColor: "#e5e7eb" },
  saveBtn: {
    position: "absolute",
    right: 12,
    top: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { padding: 12 },
  title: { fontSize: 18, fontWeight: "800", color: "#111827" },
  country: { color: "#6b7280", marginTop: 2, fontWeight: "600" },
  tagline: { color: "#111827", marginTop: 6 },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  primaryBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: "#fff", fontWeight: "800" },

  ghostBtn: {
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  ghostText: { color: "#111827", fontWeight: "700" },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 14,
    paddingBottom: 20,
    minHeight: 420,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 6,
  },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#111827" },
  modalCountry: { color: "#6b7280", fontWeight: "600" },
  wishIcon: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  closeIcon: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    marginLeft: 6,
    backgroundColor: "#f3f4f6",
  },
  modalImage: {
    width: "100%",
    height: Math.round(CARD_W * 0.6),
    borderRadius: 14,
    backgroundColor: "#e5e7eb",
  },
  modalDesc: { color: "#111827", marginTop: 12, lineHeight: 20 },

  modalActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  mapBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  mapText: { color: "#fff", fontWeight: "800" },
  saveBigBtn: {
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  saveBigText: { color: "#111827", fontWeight: "800" },
});
