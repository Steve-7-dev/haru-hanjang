import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useHaruStore } from '@/lib/store';
import { usePushNotifications } from '@/lib/usePushNotifications';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hydrated = useHaruStore((s) => s.hydrated);
  const setHydrated = useHaruStore((s) => s.setHydrated);
  const currentUserId = useHaruStore((s) => s.currentUserId);
  const segments = useSegments();
  const router = useRouter();

  usePushNotifications();

  useEffect(() => {
    // persist may already be hydrated synchronously on web
    const unsub = useHaruStore.persist.onFinishHydration(() => setHydrated(true));
    if (useHaruStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, [setHydrated]);

  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync();
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const inAuth = segments[0] === '(auth)';
    if (!currentUserId && !inAuth) {
      router.replace('/(auth)/login');
    } else if (currentUserId && inAuth) {
      router.replace('/(tabs)');
    }
  }, [hydrated, currentUserId, segments, router]);

  if (!hydrated) {
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
