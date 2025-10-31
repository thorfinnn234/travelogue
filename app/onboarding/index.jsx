import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD = 120;
const R = 20;
const K_ONBOARDED = "app:onboarded";

// ✅ FIXED: define img() properly (using Picsum)
const img = (seed) => `https://picsum.photos/seed/travel-${seed}/600/600`;

const Slides = [
  {
    key: "s1",
    title: "Explore New Places",
    body: "Find real spots travelers love — beaches, cities, and hidden gems.",
    photos: [
      img(1),
      img(2),
      img(3),
      img(4),
      img(5),
    ],
    cta: "Next",
  },
  {
    key: "s2",
    title: "Capture Every Moment",
    body: "Save your best shots and build your travel story one post at a time.",
    photos: [
      img(6),
      img(7),
      img(8),
      img(9),
      img(10),
    ],
    cta: "Next",
  },
  {
    key: "s3",
    title: "Share & Inspire",
    body: "Post tips, routes, and photos so others can travel smarter.",
    photos: [
      img(11),
      img(12),
      img(13),
      img(14),
      img(15),
    ],
    cta: "Start using Travelogue",
    final: true,
  },
];

export default function Onboarding() {
  const router = useRouter();
  const ref = useRef(null);
  const [index, setIndex] = useState(0);

  const onViewable = useMemo(
    () => ({ viewAreaCoveragePercentThreshold: 60 }),
    []
  );

  const viewCb = useRef(({ viewableItems }) => {
    if (viewableItems?.length) setIndex(viewableItems[0].index || 0);
  });

  const next = async () => {
    if (index < Slides.length - 1) {
      ref.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      try {
        await AsyncStorage.setItem(K_ONBOARDED, "1");
        console.debug('[DEBUG] Onboarding complete, flag set');
        const check = await AsyncStorage.getItem(K_ONBOARDED);
        console.debug('[DEBUG] Verified flag is set:', check);
        router.replace("/auth/login");
      } catch (e) {
        console.error('[DEBUG] Failed to save onboarding state:', e);
      }
    }
  };

  const skip = async () => {
    try {
      await AsyncStorage.setItem(K_ONBOARDED, "1");
      console.debug('[DEBUG] Onboarding skipped, flag set');
      const check = await AsyncStorage.getItem(K_ONBOARDED);
      console.debug('[DEBUG] Verified flag is set:', check);
      router.replace("/auth/login");
    } catch (e) {
      console.error('[DEBUG] Failed to save onboarding state:', e);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Skip */}
      <Pressable onPress={skip} style={styles.skip}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      {/* Slides */}
      <FlatList
        ref={ref}
        data={Slides}
        keyExtractor={(it) => it.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={viewCb.current}
        viewabilityConfig={onViewable}
        renderItem={({ item }) => <SlideCard item={item} />}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {Slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { opacity: index === i ? 1 : 0.35, width: index === i ? 22 : 8 },
            ]}
          />
        ))}
      </View>

      {/* Button */}
      <Pressable onPress={next} style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.9 : 1 }]}>
        <Text style={styles.ctaText}>{Slides[index]?.cta || "Next"}</Text>
      </Pressable>
    </View>
  );
}

function SlideCard({ item }) {
  return (
    <View style={{ width, paddingHorizontal: 20, paddingTop: 80, paddingBottom: 24 }}>
      <View style={styles.stackArea}>
        {/* postcard layout */}
        {item.photos.map((uri, i) => (
          <Polaroid
            key={i}
            uri={uri}
            style={{
              top: i * 40,
              left: i % 2 === 0 ? 20 : undefined,
              right: i % 2 !== 0 ? 20 : undefined,
              transform: [{ rotate: `${i % 2 === 0 ? "-" : ""}${6 + i * 2}deg` }],
            }}
          />
        ))}
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.body}>{item.body}</Text>
    </View>
  );
}

function Polaroid({ uri, style }) {
  return (
    <View style={[styles.cardWrap, style]}>
      <View style={styles.card}>
        <Image source={{ uri }} style={styles.photo} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },

  skip: { position: "absolute", top: 18, right: 18, zIndex: 10, padding: 6 },
  skipText: { color: "#6b7280", fontWeight: "600" },

  stackArea: { height: 320, justifyContent: "center" },

  cardWrap: {
    position: "absolute",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  card: {
    width: CARD,
    height: CARD,
    borderRadius: R,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  photo: { width: "100%", height: "100%" },

  title: {
    marginTop: 28,
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },
  body: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#6b7280",
    textAlign: "center",
    paddingHorizontal: 12,
  },

  dotsRow: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 10 },
  dot: { height: 8, borderRadius: 8, backgroundColor: "#111827" },

  cta: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#22a06b",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#22a06b",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  ctaText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
