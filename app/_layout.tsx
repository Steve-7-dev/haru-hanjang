import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { pretendardFontFaces } from '@/constants/fonts';
import { Colors } from '@/constants/theme';
import { applyDefaultFont } from '@/lib/applyDefaultFont';
import { useHaruStore } from '@/lib/store';
import { usePushNotifications } from '@/lib/usePushNotifications';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();
applyDefaultFont();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts([...pretendardFontFaces]);
  const hydrated = useHaruStore((s) => s.hydrated);
  const setHydrated = useHaruStore((s) => s.setHydrated);
  const currentUserId = useHaruStore((s) => s.currentUserId);
  const segments = useSegments();
  const router = useRouter();

  usePushNotifications();

  useEffect(() => {
    const unsub = useHaruStore.persist.onFinishHydration(() => setHydrated(true));
    if (useHaruStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, [setHydrated]);

  useEffect(() => {
    if (hydrated && (fontsLoaded || fontError)) {
      SplashScreen.hideAsync();
    }
  }, [hydrated, fontsLoaded, fontError]);

  useEffect(() => {
    if (!hydrated || (!fontsLoaded && !fontError)) return;
    const inAuth = segments[0] === '(auth)';
    if (!currentUserId && !inAuth) {
      router.replace('/(auth)/login');
    } else if (currentUserId && inAuth) {
      router.replace('/(tabs)');
    }
  }, [hydrated, fontsLoaded, fontError, currentUserId, segments, router]);

  if (!hydrated || (!fontsLoaded && !fontError)) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator color={Colors.text} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerTintColor: Colors.text, contentStyle: { backgroundColor: Colors.background } }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="comments/[id]"
          options={{ title: '댓글', presentation: 'card' }}
        />
        <Stack.Screen
          name="user/[id]"
          options={{ title: '프로필' }}
        />
        <Stack.Screen
          name="messages/[id]"
          options={{ title: '메시지' }}
        />
        <Stack.Screen
          name="messages/new-group"
          options={{ title: '새 그룹', presentation: 'modal' }}
        />
        <Stack.Screen
          name="settings"
          options={{ title: '설정' }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            title: '알림',
            headerRight: () => (
              <Ionicons name="heart-outline" size={22} color={Colors.text} />
            ),
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
