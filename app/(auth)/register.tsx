import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { AppTextInput } from '@/components/AppTextInput';
import { IgAuthShell, igAuthStyles as styles } from '@/components/IgAuthShell';
import { useHaruStore } from '@/lib/store';
import {
  MAX_DISPLAY_NAME_LEN,
  MAX_PASSWORD_LEN,
  MAX_USERNAME_LEN,
} from '@/lib/validation';

type Step = 1 | 2 | 3;

export default function RegisterScreen() {
  const registerEmail = useHaruStore((s) => s.registerEmail);
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onRegister = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await registerEmail({ email, password, username, displayName });
      if (!res.ok) {
        setError(res.error);
        if (Platform.OS !== 'web') Alert.alert('가입 실패', res.error);
      } else router.replace('/(tabs)');
    } finally {
      setBusy(false);
    }
  };

  const nextFromEmail = () => {
    setError(null);
    if (!email.trim() || !email.includes('@')) {
      setError('이메일을 확인해 주세요.');
      return;
    }
    setStep(2);
  };

  const nextFromPassword = () => {
    setError(null);
    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 해요.');
      return;
    }
    setStep(3);
  };

  return (
    <IgAuthShell
      secondary={
        <>
          <AppText style={styles.secondaryText}>계정이 있으신가요? </AppText>
          <Link href="/(auth)/login" asChild>
            <Pressable accessibilityRole="link">
              <AppText style={styles.secondaryLink}>로그인</AppText>
            </Pressable>
          </Link>
        </>
      }
    >
      <AppText style={styles.tagline}>One photo a day.</AppText>

      {step === 1 ? (
        <View style={{ width: '100%' }}>
          <AppText style={styles.stepLabel}>1 / 3 · 이메일</AppText>
          <AppTextInput
            style={styles.input}
            placeholder="이메일"
            placeholderTextColor="#8E8E8E"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            maxLength={254}
            accessibilityLabel="이메일"
          />
          {error ? <AppText style={styles.error}>{error}</AppText> : null}
          <Pressable style={styles.primaryBtn} onPress={nextFromEmail} accessibilityRole="button">
            <AppText style={styles.primaryText}>다음</AppText>
          </Pressable>
        </View>
      ) : null}

      {step === 2 ? (
        <View style={{ width: '100%' }}>
          <AppText style={styles.stepLabel}>2 / 3 · 비밀번호</AppText>
          <AppTextInput
            style={styles.input}
            placeholder="비밀번호"
            placeholderTextColor="#8E8E8E"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            maxLength={MAX_PASSWORD_LEN}
            accessibilityLabel="비밀번호"
          />
          {error ? <AppText style={styles.error}>{error}</AppText> : null}
          <Pressable style={styles.primaryBtn} onPress={nextFromPassword} accessibilityRole="button">
            <AppText style={styles.primaryText}>다음</AppText>
          </Pressable>
          <Pressable onPress={() => setStep(1)} style={{ marginTop: 12 }} accessibilityRole="button">
            <AppText style={[styles.secondaryLink, { textAlign: 'center' }]}>뒤로</AppText>
          </Pressable>
        </View>
      ) : null}

      {step === 3 ? (
        <View style={{ width: '100%' }}>
          <AppText style={styles.stepLabel}>3 / 3 · 프로필</AppText>
          <AppTextInput
            style={styles.input}
            placeholder="성명"
            placeholderTextColor="#8E8E8E"
            value={displayName}
            onChangeText={setDisplayName}
            maxLength={MAX_DISPLAY_NAME_LEN}
            accessibilityLabel="성명"
          />
          <AppTextInput
            style={styles.input}
            placeholder="사용자 이름"
            placeholderTextColor="#8E8E8E"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
            maxLength={MAX_USERNAME_LEN}
            accessibilityLabel="사용자 이름"
          />
          {error ? <AppText style={styles.error}>{error}</AppText> : null}
          <Pressable
            style={[styles.primaryBtn, busy && styles.primaryDisabled]}
            onPress={onRegister}
            disabled={busy}
            accessibilityRole="button"
          >
            <AppText style={styles.primaryText}>가입하기</AppText>
          </Pressable>
          <Pressable onPress={() => setStep(2)} style={{ marginTop: 12 }} accessibilityRole="button">
            <AppText style={[styles.secondaryLink, { textAlign: 'center' }]}>뒤로</AppText>
          </Pressable>
        </View>
      ) : null}

      <AppText style={styles.hint}>친구들과 하루 한 장만 나눠 보세요.</AppText>
    </IgAuthShell>
  );
}
