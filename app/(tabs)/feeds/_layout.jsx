// import React from 'react';
// import { Stack, Link } from 'expo-router';
// import Ionicons from '@expo/vector-icons/Ionicons';
// import { Pressable } from 'react-native';
// import { useTheme } from '../../../utils/theme';

// export default function FeedStack() {
//   const t = useTheme();

//   return (
//     <Stack
//       screenOptions={{
//         headerTitle: false,
//         headerStyle: { backgroundColor: t.bg },        // white in light, black in dark
//         headerTitleStyle: { color: t.text, fontWeight: '700' }, // navy/white
//         headerRight: () => (
//           <Link href="/notifications" asChild>
//             <Pressable style={{ paddingHorizontal: 12 }}>
//               <Ionicons name="notifications-outline" size={22} color={t.primary} /> {/* sky blue */}
//             </Pressable>
//           </Link>
//         ),
//       }}
//     />
//   );
// }
