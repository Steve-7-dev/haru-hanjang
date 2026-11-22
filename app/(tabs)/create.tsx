import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { AppTextInput } from '@/components/AppTextInput';
import { FontFamily } from '@/constants/fonts';
import { PopArt } from '@/constants/popArt';
import { Spacing } from '@/constants/theme';
import { formatKstDayLabel, kstDayKey } from '@/lib/kst';
import { useHaruStore } from '@/lib/store';
import { MAX_CAPTION_LEN } from '@/lib/validation';

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
      if (Platform.OS !== 'web') {
        Alert.alert(
          todayPost ? '수정됐어요' : '공유됐어요',
          `${formatKstDayLabel(kstDayKey())}의 하루 한 장`,
        );
      }
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
      <AppText style={styles.title}>{todayPost ? '오늘 사진 수정' : '새 게시물'}</AppText>
      <AppText style={styles.rule}>
        한국시간 기준 · 하루 한 장 · {formatKstDayLabel(kstDayKey())}
      </AppText>

      <Pressable style={styles.preview} onPress={pick} accessibilityLabel="사진 미리보기">
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
        ) : (
          <AppText style={styles.placeholder}>사진을 선택하세요</AppText>
        )}
      </Pressable>

      <View style={styles.row}>
        <Pressable style={styles.secondary} onPress={pick} accessibilityRole="button">
          <AppText style={styles.secondaryText}>라이브러리</AppText>
        </Pressable>
        <Pressable style={styles.secondary} onPress={shoot} accessibilityRole="button">
          <AppText style={styles.secondaryText}>카메라</AppText>
        </Pressable>
      </View>

      <AppTextInput
        style={styles.caption}
        placeholder="문구 입력..."
        placeholderTextColor="#5C5C5C"
        multiline
        value={caption}
        onChangeText={setCaption}
        maxLength={MAX_CAPTION_LEN}
        accessibilityLabel="캡션"
      />

      <Pressable
        style={styles.primary}
        onPress={onShare}
        accessibilityRole="button"
        accessibilityLabel={todayPost ? '수정 공유' : '공유'}
      >
        <AppText style={styles.primaryText}>{todayPost ? '수정 공유' : '공유'}</AppText>
      </Pressable>

      {todayPost ? (
        <Pressable style={styles.delete} onPress={onDelete} accessibilityRole="button">
          <AppText style={styles.deleteText}>오늘 사진 삭제</AppText>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PopArt.panel },
  content: { padding: Spacing.lg, paddingBottom: 48 },
  title: {
    fontFamily: FontFamily.sans,
    fontSize: 22,
    fontWeight: '700',
    color: PopArt.ink,
  },
  rule: {
    fontFamily: FontFamily.sans,
    color: PopArt.ink,
    marginTop: 4,
    marginBottom: Spacing.lg,
    fontWeight: '500',
  },
  preview: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: PopArt.panelMuted,
    borderWidth: PopArt.borderWidth,
    borderColor: PopArt.ink,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  placeholder: { fontFamily: FontFamily.sans, color: '#5C5C5C' },
  row: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  secondary: {
    flex: 1,
    borderWidth: PopArt.borderWidth,
    borderColor: PopArt.ink,
    borderRadius: 0,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: PopArt.yellow,
  },
  secondaryText: { fontFamily: FontFamily.sans, fontWeight: '700', color: PopArt.ink },
  caption: {
    fontFamily: FontFamily.sans,
    marginTop: Spacing.lg,
    minHeight: 80,
    borderWidth: PopArt.borderWidth,
    borderColor: PopArt.ink,
    borderRadius: 0,
    padding: Spacing.md,
    textAlignVertical: 'top',
    color: PopArt.ink,
    fontSize: 15,
    backgroundColor: PopArt.panel,
  },
  primary: {
    marginTop: Spacing.lg,
    backgroundColor: PopArt.ctaFill,
    borderWidth: PopArt.borderWidth,
    borderColor: PopArt.ink,
    borderRadius: 0,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: {
    fontFamily: FontFamily.sans,
    color: PopArt.ctaText,
    fontWeight: '700',
    fontSize: 15,
  },
  delete: { marginTop: Spacing.md, alignItems: 'center', padding: 12 },
  deleteText: { fontFamily: FontFamily.sans, color: '#B00020', fontWeight: '700' },
});
