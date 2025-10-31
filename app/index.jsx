import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

const K_ONBOARDED = 'app:onboarded';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // First clear the flag to test new user flow
        await AsyncStorage.removeItem(K_ONBOARDED);
        console.debug('[DEBUG] Cleared onboarding flag');

        // Check if the clear worked
        const check = await AsyncStorage.getItem(K_ONBOARDED);
        console.debug('[DEBUG] Flag after clear:', check);

        // Normal flow continues
        const seen = await AsyncStorage.getItem(K_ONBOARDED);
        console.debug('[DEBUG] Is user onboarded?', !!seen);

        if (!mounted) return;
        if (seen) {
          console.debug('[DEBUG] User has seen onboarding, going to feeds');
          router.replace('/feeds');
        } else {
          console.debug('[DEBUG] New user, showing onboarding');
          router.replace('/onboarding');
        }
      } catch (e) {
        console.error('[DEBUG] AsyncStorage error:', e);
        // fallback: go to onboarding
        if (mounted) {
          console.debug('[DEBUG] Error occurred, defaulting to onboarding');
          router.replace('/onboarding');
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  return null;
}
