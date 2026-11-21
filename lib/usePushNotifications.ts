import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { useHaruStore } from './store';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotifications() {
  const currentUserId = useHaruStore((s) => s.currentUserId);
  const registerPushToken = useHaruStore((s) => s.registerPushToken);

  useEffect(() => {
    if (!currentUserId) return;
    let cancelled = false;

    (async () => {
      try {
        if (!Device.isDevice && Platform.OS !== 'web') {
          // Simulator: still request so permission UX is exercised
        }
        const { status: existing } = await Notifications.getPermissionsAsync();
        let finalStatus = existing;
        if (existing !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted' || cancelled) return;

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.DEFAULT,
          });
        }

        const token = (await Notifications.getExpoPushTokenAsync()).data;
        if (!cancelled) registerPushToken(token);
      } catch {
        // Push keys / projectId may be missing in Expo Go — ignore for MVP.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentUserId, registerPushToken]);
}
