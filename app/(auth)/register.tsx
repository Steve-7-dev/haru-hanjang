import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable } from 'react-native';

import { AppText } from '@/components/AppText';
import { AppTextInput } from '@/components/AppTextInput';
import { PopArtAuthShell, popArtAuthStyles as styles } from '@/components/PopArtAuthShell';
import { PopArtLogo } from '@/components/PopArtLogo';
import { useHaruStore } from '@/lib/store';
import {
  MAX_DISPLAY_NAME_LEN,
  MAX_PASSWORD_LEN,
  MAX_USERNAME_LEN,
} from '@/lib/validation';

export default function RegisterScreen() {
  const registerEmail = useHaruStore((s) => s.registerEmail);
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

  return (
    <PopArtAuthShell
      footer={
        <>
          <AppText style={styles.footerText}>계정이 있으신가요? </AppText>
          <Link href="/(auth)/login" asChild>
            <Pressable accessibilityRole="link">
              <AppText style={styles.link}>로그인</AppText>
            </Pressable>
          </Link>
        </>
      }
    >
      <PopArtLogo size="lg" />
      <AppText style={styles.tagline}>One photo a day.</AppText>

      <AppTextInput
        style={styles.input}
        placeholder="이메일"
        placeholderTextColor="#5C5C5C"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        maxLength={254}
        accessibilityLabel="이메일"
      />
      <AppTextInput
        style={styles.input}
        placeholder="성명"
        placeholderTextColor="#5C5C5C"
        value={displayName}
        onChangeText={setDisplayName}
        maxLength={MAX_DISPLAY_NAME_LEN}
        accessibilityLabel="성명"
      />
      <AppTextInput
        style={styles.input}
        placeholder="사용자 이름"
        placeholderTextColor="#5C5C5C"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
        maxLength={MAX_USERNAME_LEN}
        accessibilityLabel="사용자 이름"
      />
      <AppTextInput
        style={styles.input}
        placeholder="비밀번호"
        placeholderTextColor="#5C5C5C"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        maxLength={MAX_PASSWORD_LEN}
        accessibilityLabel="비밀번호"
      />

      {error ? <AppText style={styles.error}>{error}</AppText> : null}

      <Pressable
        style={[styles.primaryBtn, busy && styles.disabled]}
        onPress={onRegister}
        disabled={busy}
        accessibilityRole="button"
        accessibilityState={{ disabled: busy }}
      >
        <AppText style={styles.primaryText}>가입</AppText>
      </Pressable>
    </PopArtAuthShell>
  );
}
