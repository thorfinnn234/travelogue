// app/(tabs)/explore/index.jsx
import React, { useMemo, useState, useCallback, useEffect } from "react";
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
  TextInput,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useWishlistStore } from "../../store/wishlistStore";
import { COLORS } from "../../../utils/theme";

const { width } = Dimensions.get("window");
const CARD_W = width - 32;
const CARD_H = Math.round(CARD_W * 0.62); // cinematic 16:10-ish

/* ----------------- Data: curated images per place ----------------- */
const PLACES = [
  {
    id: "1",
    name: "Bali Island",
    country: "Indonesia",
    tagline: "Beaches, temples & rice terraces.",
    images: [
      "https://i.pinimg.com/1200x/e0/31/a9/e031a96ec6e6ab68a940e24c14ca96e3.jpg",
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1600&auto=format&fit=crop",
      "https://i.pinimg.com/736x/2d/5d/87/2d5d874f28d231ac1c7529a7fad97599.jpg",
      "https://i.pinimg.com/736x/13/cb/44/13cb44a7a228384d4b7c4c670245d01e.jpg",
    ],
    desc:
      "Bali, the Island of the Gods, blends spiritual culture with natural beauty. Explore Ubud’s rice terraces, sunrise hikes at Mount Batur, and coastline temples like Tanah Lot.",
  },
  {
    id: "2",
    name: "Santorini",
    country: "Greece",
    tagline: "White houses & blue domes at sunset.",
    images: [
      "https://i.pinimg.com/736x/6f/40/68/6f4068366ceaf6ea808ef4cc13603d3b.jpg",
      "https://images.unsplash.com/photo-1493558103817-58b2924bce98?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1600&auto=format&fit=crop",
      "https://i.pinimg.com/736x/ad/37/5c/ad375c1c2c7032711f705e788d8c7419.jpg",
    ],
    desc:
      "Santorini’s caldera views and iconic Cycladic architecture make it a dream destination. Enjoy volcanic beaches, cliffside cafés, and sunsets from Oia.",
  },
  {
    id: "3",
    name: "Tokyo",
    country: "Japan",
    tagline: "Neon nights & timeless temples.",
    images: [
      "https://i.pinimg.com/1200x/dc/12/01/dc12011c464a71a27804617a107135e0.jpg",
      "https://i.pinimg.com/736x/2c/3e/be/2c3ebeac800913fe274f63848266d4f0.jpg",
      "https://i.pinimg.com/1200x/12/84/a1/1284a1e0ca5ee708c0eef4662323589b.jpg",
    ],
    desc:
      "From Shibuya Crossing to serene Meiji Shrine, Tokyo pairs ultramodern energy with deep tradition. Savor sushi, anime culture, and tech-forward neighborhoods.",
  },
  {
    id: "4",
    name: "Paris",
    country: "France",
    tagline: "Art, fashion & cafés by the Seine.",
    images: [
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1600&auto=format&fit=crop",
      "https://i.pinimg.com/736x/31/ae/8c/31ae8c97d5d987dd2d5c017dd14c5d78.jpg",
      "https://i.pinimg.com/736x/2b/91/2f/2b912fa2df7fe8b3d225c9ad2c046c2b.jpg",
    ],
    desc:
      "Paris is the city of light and love. Climb the Eiffel Tower, stroll Montmartre, visit the Louvre, and linger at terrace cafés with a fresh croissant.",
  },
  {
    id: "5",
    name: "Marrakesh",
    country: "Morocco",
    tagline: "Souks, spices & riad courtyards.",
    images: [
      "https://i.pinimg.com/736x/d9/da/a5/d9daa57fc3a2e01b69d20cad8d2c2d2e.jpg",
      "https://i.pinimg.com/736x/b9/64/4b/b9644bce4fa70add871e30b8c1c54eed.jpg",
      "https://i.pinimg.com/736x/a1/15/fe/a115fe2b8a3f53bca3c247fdde0adc20.jpg",
    ],
    desc:
      "Lose yourself in the medina’s maze, shop vibrant souks, relax in riads, and explore nearby Atlas Mountains or desert camp experiences.",
  },
  {
    id: "6",
    name: "Reykjavík",
    country: "Iceland",
    tagline: "Geothermal spas & northern lights.",
    images: [
      "https://i.pinimg.com/736x/45/cc/2b/45cc2b663169fe84f4de338092ab652a.jpg",
      "https://i.pinimg.com/736x/23/3f/b8/233fb8c296119602412b9887e178b8c6.jpg",
      "https://i.pinimg.com/736x/df/58/ba/df58ba0d5a5e613aed7235792538f1da.jpg",
    ],
    desc:
      "Base yourself in Reykjavík for the Blue Lagoon, Golden Circle waterfalls, black-sand beaches, and a chance to see the aurora on clear winter nights.",
  },
  {
    id: "7",
    name: "Dubai",
    country: "UAE",
    tagline: "Luxury, skyscrapers & desert adventures.",
    images: [
      "https://i.pinimg.com/736x/64/0e/c3/640ec39a093f78068ce041dd95b03a16.jpg",
      "https://i.pinimg.com/1200x/25/00/42/250042041042813a26015733b2ea9d8f.jpg",
      "https://i.pinimg.com/736x/a7/e7/8a/a7e78a9fbbe6bf53a13193598281ae84.jpg",
    ],
    desc:
      "Dubai dazzles with its futuristic skyline, vast deserts, luxury malls, and world-class dining — a city that blends modern ambition with Arabian charm.",
  },
  {
    id: "8",
    name: "Cape Town",
    country: "South Africa",
    tagline: "Mountains, beaches & wine country.",
    images: [
      "https://i.pinimg.com/1200x/59/e3/60/59e360019c892e4a2d0155c8a267bf3e.jpg",
      "https://i.pinimg.com/736x/e5/05/59/e50559ba353d07ead7b34f61cd996d98.jpg",
      "https://i.pinimg.com/736x/33/19/1b/33191b8c80518286df9f11a95c7d9db3.jpg",
    ],
    desc:
      "Cape Town sits between ocean and mountain, offering hikes up Table Mountain, penguins at Boulders Beach, and vineyards in nearby Stellenbosch.",
  },
  {
    id: "9",
    name: "Kyoto",
    country: "Japan",
    tagline: "Temples, gardens & geisha culture.",
    images: [
      "https://i.pinimg.com/736x/d0/1a/7e/d01a7e75abaf650945e1742a7f746ea8.jpg",
      "https://i.pinimg.com/736x/9c/31/b5/9c31b55f29b43a49f52d5a71e277c92b.jpg",
      "https://i.pinimg.com/736x/1b/e9/3a/1be93ae66f13edeb84c10e365b3bdf00.jpg",
    ],
    desc:
      "Kyoto preserves Japan’s traditional heart — explore golden temples, tranquil gardens, teahouses, and historic streets lined with wooden machiya.",
  },
  {
    id: "10",
    name: "New York City",
    country: "USA",
    tagline: "Skyscrapers, art & endless energy.",
    images: [
      "https://i.pinimg.com/736x/d9/53/25/d953251d49c5421abdda176adb71ade5.jpg",
      "https://i.pinimg.com/1200x/03/4b/e7/034be73967674cda693a01fba373ff33.jpg",
      "https://i.pinimg.com/736x/15/6b/43/156b43c814e4bf8363f1f6ae6c92a5fa.jpg",
    ],
    desc:
      "NYC is a melting pot of culture and creativity. From Times Square to Central Park, Broadway to Brooklyn — the city never sleeps or disappoints.",
  },
  {
    id: "11",
    name: "Sydney",
    country: "Australia",
    tagline: "Opera House, beaches & coastal vibes.",
    images: [
      "https://i.pinimg.com/736x/4f/8c/ff/4f8cff64b3dd818a55df87bc2008e560.jpg",
      "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=1600&auto=format&fit=crop",
      "https://i.pinimg.com/736x/8a/d7/e0/8ad7e095b31ea5125ac73c3de2836cad.jpg",
    ],
    desc:
      "Sydney shines with its iconic harbor, surf-ready beaches, and lively cafés. Take a ferry to Manly, climb the Harbour Bridge, or visit Bondi’s coastal walk.",
  },
  {
    id: "12",
    name: "Venice",
    country: "Italy",
    tagline: "Canals, gondolas & Renaissance charm.",
    images: [
      "https://i.pinimg.com/1200x/fb/cb/bd/fbcbbdb5d0eae50b3eb307e9a033e8b2.jpg",
      "https://i.pinimg.com/736x/67/25/5a/67255a66363a11b5100a3fea58981708.jpg",
      "https://i.pinimg.com/736x/30/34/5f/30345fc981fc96e5ec8086acd2eb38e6.jpg",
    ],
    desc:
      "Venice is pure magic — sail through canals, admire Gothic palaces, and lose yourself in narrow alleyways where history whispers at every turn.",
  },
];

const openInMaps = (place) => {
  const q = encodeURIComponent(`${place.name}, ${place.country}`);
  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
};

export default function ExploreScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState(null);
  const [heroImage, setHeroImage] = useState(null);

  // wishlist store
  const toggleWish = useWishlistStore((s) => s.toggle);
  const isSaved = useWishlistStore((s) => s.isSaved);

  // search state (debounced)
  const [query, setQuery] = useState("");
  const [qDebounced, setQDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(query.trim().toLowerCase()), 200);
    return () => clearTimeout(t);
  }, [query]);

  const data = useMemo(() => PLACES, []);

  const filtered = useMemo(() => {
    if (!qDebounced) return data;
    return data.filter((p) => {
      const hay =
        `${p.name} ${p.country} ${p.tagline}`.toLowerCase();
      return hay.includes(qDebounced);
    });
  }, [data, qDebounced]);

  // keep modal hero image in sync with selected place
  useEffect(() => {
    if (!selected) return;
    setHeroImage(selected.images?.[0] ?? null);
  }, [selected]);

  const renderItem = useCallback(
    ({ item }) => {
      const cover = item.images?.[0];
      return (
        <Pressable
          style={[styles.card, { backgroundColor: "#fff", borderColor: "#e5e7eb" }]}
          onPress={() => setSelected(item)}
        >
          {/* Image */}
          <Image
            source={cover}
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
      );
    },
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

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color="#6b7280" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search city, country, or vibe…"
          placeholderTextColor="#9ca3af"
          style={styles.searchInput}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery("")} hitSlop={8} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color="#9ca3af" />
          </Pressable>
        )}
      </View>

      {/* List */}
      {filtered.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>
            No places match “{query}”. Try another search.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}

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

                {/* Hero image */}
                <Image
                  source={heroImage ?? selected.images?.[0]}
                  style={styles.modalImage}
                  contentFit="cover"
                  cachePolicy="disk"
                />

                {/* Thumbnails */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8, paddingVertical: 10 }}
                >
                  {(selected.images ?? []).map((u, idx) => (
                    <Pressable
                      key={`${selected.id}-thumb-${idx}`}
                      onPress={() => setHeroImage(u)}
                      style={[
                        styles.thumbWrap,
                        heroImage === u && { borderColor: "#111827" },
                      ]}
                    >
                      <Image
                        source={u}
                        style={styles.thumb}
                        contentFit="cover"
                        cachePolicy="disk"
                      />
                    </Pressable>
                  ))}
                </ScrollView>

                <ScrollView
                  style={{ maxHeight: 220 }}
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

  /* Search */
  searchWrap: {
    marginHorizontal: 16,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    paddingVertical: 8,
  },
  clearBtn: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
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
    minHeight: 460,
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
  thumbWrap: {
    width: 76,
    height: 54,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    marginLeft: 4,
  },
  thumb: { width: "100%", height: "100%" },
  modalDesc: { color: "#111827", marginTop: 6, lineHeight: 20 },

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

  emptyWrap: {
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 14,
  },
});
