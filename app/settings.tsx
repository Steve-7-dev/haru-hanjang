import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Colors, Spacing } from '@/constants/theme';
import { useHaruStore } from '@/lib/store';

export default function SettingsScreen() {
  const me = useHaruStore((s) => s.me());
  const updateProfile = useHaruStore((s) => s.updateProfile);
  const logout = useHaruStore((s) => s.logout);
  const resetDemo = useHaruStore((s) => s.resetDemo);

  const [displayName, setDisplayName] = useState(me?.displayName ?? '');
  const [username, setUsername] = useState(me?.username ?? '');
  const [bio, setBio] = useState(me?.bio ?? '');
  const [isPrivate, setIsPrivate] = useState(me?.isPrivate ?? false);
  const [avatarUri, setAvatarUri] = useState(me?.avatarUri ?? null);

  if (!me) return null;

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const onSave = () => {
    const res = updateProfile({
      displayName,
      username,
      bio,
      isPrivate,
      avatarUri,
    });
    if (!res.ok) Alert.alert('저장 실패', res.error);
    else {
      Alert.alert('저장됨', '프로필이 업데이트됐어요.');
      router.back();
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Pressable style={styles.avatarWrap} onPress={pickAvatar}>
        <Avatar uri={avatarUri} name={displayName || username} size={96} />
        <Text style={styles.changePhoto}>프로필 사진 바꾸기</Text>
      </Pressable>

      <Label>이름</Label>
      <TextInput style={styles.input} value={displayName} onChangeText={setDisplayName} />
      <Label>사용자 이름</Label>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <Label>소개</Label>
      <TextInput
        style={[styles.input, styles.bio]}
        value={bio}
        onChangeText={setBio}
        multiline
      />

      <View style={styles.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.switchTitle}>비공개 계정</Text>
          <Text style={styles.switchSub}>팔로워만 사진을 볼 수 있어요.</Text>
        </View>
        <Switch
          value={isPrivate}
          onValueChange={setIsPrivate}
          trackColor={{ true: Colors.primary }}
        />
      </View>

      <Pressable style={styles.primary} onPress={onSave}>
        <Text style={styles.primaryText}>저장</Text>
      </Pressable>

      <Pressable
        style={styles.danger}
        onPress={() => {
          logout();
          router.replace('/(auth)/login');
        }}
      >
        <Text style={styles.dangerText}>로그아웃</Text>
      </Pressable>

      <Pressable
        style={styles.ghost}
        onPress={() => {
          Alert.alert('데모 초기화', '시드 데이터로 되돌릴까요?', [
            { text: '취소', style: 'cancel' },
            {
              text: '초기화',
              style: 'destructive',
              onPress: () => {
                resetDemo();
                router.replace('/(auth)/login');
              },
            },
          ]);
        }}
      >
        <Text style={styles.ghostText}>데모 데이터 초기화</Text>
      </Pressable>
    </ScrollView>
  );
}

function Label({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 48 },
  avatarWrap: { alignItems: 'center', marginBottom: Spacing.lg },
  changePhoto: { marginTop: Spacing.sm, color: Colors.primary, fontWeight: '600' },
  label: { color: Colors.textSecondary, fontSize: 12, marginBottom: 4, marginTop: Spacing.md },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    color: Colors.text,
  },
  bio: { minHeight: 80, textAlignVertical: 'top' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  switchTitle: { fontWeight: '600', color: Colors.text },
  switchSub: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  primary: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: { color: Colors.textInverse, fontWeight: '700' },
  danger: { marginTop: Spacing.lg, alignItems: 'center', padding: 12 },
  dangerText: { color: Colors.danger, fontWeight: '600' },
  ghost: { alignItems: 'center', padding: 8 },
  ghostText: { color: Colors.textSecondary, fontSize: 13 },
});
