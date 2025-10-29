// app/store/wishlistStore.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: {},
      toggle(placeId) {
        const cur = { ...get().items };
        if (cur[placeId]) delete cur[placeId];
        else cur[placeId] = true;
        set({ items: cur });
      },
      isSaved(placeId) {
        return !!get().items[placeId];
      },
    }),
    {
      name: "wishlist:v1",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
