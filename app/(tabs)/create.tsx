import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';
import { formatKstDayLabel, kstDayKey } from '@/lib/kst';
import { useHaruStore } from '@/lib/store';

export default function CreateScreen() {
  const insets = useSafeAreaInsets();
  const me = useHaruStore((s) => s.me());
  const todayPost = useHaruStore((s) => (me ? s.todayPostFor(me.id) : undefined));
  const createOrUpdateTodayPost = useHaruStore((s) => s.createOrUpdateTodayPost);
  const deleteTodayPost = useHaruStore((s) => s.deleteTodayPost);

  const [imageUri, setImageUri] = useState<string | null>(todayPost?.imageUri ?? null);
  const [caption, setCaption] = useState(todayPost?.caption ?? '');

  useEffect(() => {
    setImageUri(todayPost?.imageUri ?? null);
    setCaption(todayPost?.caption ?? '');
  }, [todayPost?.id, todayPost?.imageUri, todayPost?.caption]);

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('권한 필요', '사진 라이브러리 접근을 허용해 주세요.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const shoot = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('권한 필요', '카메라 접근을 허용해 주세요.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const onShare = () => {
    if (!imageUri) {
      Alert.alert('사진 필요', '오늘의 한 장을 골라 주세요.');
      return;
    }
    const res = createOrUpdateTodayPost(imageUri, caption);
    if (!res.ok) Alert.alert('실패', res.error);
    else {
      Alert.alert(
        todayPost ? '수정됐어요' : '공유됐어요',
        `${formatKstDayLabel(kstDayKey())}의 하루 한 장`,
      );
      router.push('/(tabs)');
    }
  };

  const onDelete = () => {
    Alert.alert('오늘 사진 삭제', '오늘의 한 장을 지울까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          const res = deleteTodayPost();
          if (!res.ok) Alert.alert('실패', res.error);
          else {
            setImageUri(null);
            setCaption('');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.root, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>{todayPost ? '오늘 사진 수정' : '새 게시물'}</Text>
      <Text style={styles.rule}>
        한국시간 기준 · 하루 한 장 · {formatKstDayLabel(kstDayKey())}
      </Text>

      <Pressable style={styles.preview} onPress={pick}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
        ) : (
          <Text style={styles.placeholder}>사진을 선택하세요</Text>
        )}
      </Pressable>

      <View style={styles.row}>
        <Pressable style={styles.secondary} onPress={pick}>
          <Text style={styles.secondaryText}>라이브러리</Text>
        </Pressable>
        <Pressable style={styles.secondary} onPress={shoot}>
          <Text style={styles.secondaryText}>카메라</Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.caption}
        placeholder="문구 입력..."
        placeholderTextColor={Colors.textSecondary}
        multiline
        value={caption}
        onChangeText={setCaption}
      />

      <Pressable style={styles.primary} onPress={onShare}>
        <Text style={styles.primaryText}>{todayPost ? '수정 공유' : '공유'}</Text>
      </Pressable>

      {todayPost ? (
        <Pressable style={styles.delete} onPress={onDelete}>
          <Text style={styles.deleteText}>오늘 사진 삭제</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.text },
  rule: { color: Colors.textSecondary, marginTop: 4, marginBottom: Spacing.lg },
  preview: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: Colors.backgroundMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  placeholder: { color: Colors.textSecondary },
  row: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  secondary: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryText: { fontWeight: '600', color: Colors.text },
  caption: {
    marginTop: Spacing.lg,
    minHeight: 80,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    textAlignVertical: 'top',
    color: Colors.text,
    fontSize: 15,
  },
  primary: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: { color: Colors.textInverse, fontWeight: '700', fontSize: 15 },
  delete: { marginTop: Spacing.md, alignItems: 'center', padding: 12 },
  deleteText: { color: Colors.danger, fontWeight: '600' },
});
