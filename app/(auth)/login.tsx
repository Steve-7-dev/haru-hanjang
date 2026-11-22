import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { AppTextInput } from '@/components/AppTextInput';
import { PopArtAuthShell, popArtAuthStyles as styles } from '@/components/PopArtAuthShell';
import { PopArtLogo } from '@/components/PopArtLogo';
import { useHaruStore } from '@/lib/store';
import { MAX_PASSWORD_LEN } from '@/lib/validation';

export default function LoginScreen() {
  const loginEmail = useHaruStore((s) => s.loginEmail);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onLogin = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await loginEmail(email, password);
      if (!res.ok) {
        setError(res.error);
        if (Platform.OS !== 'web') Alert.alert('로그인 실패', res.error);
      } else router.replace('/(tabs)');
    } finally {
      setBusy(false);
    }
  };

  return (
    <PopArtAuthShell
      footer={
        <>
          <AppText style={styles.footerText}>계정이 없으신가요? </AppText>
          <Link href="/(auth)/register" asChild>
            <Pressable accessibilityRole="link">
              <AppText style={styles.link}>가입하기</AppText>
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
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
        maxLength={254}
        accessibilityLabel="이메일"
      />
      <AppTextInput
        style={styles.input}
        placeholder="비밀번호"
        placeholderTextColor="#5C5C5C"
        secureTextEntry
        autoComplete="password"
        value={password}
        onChangeText={setPassword}
        maxLength={MAX_PASSWORD_LEN}
        accessibilityLabel="비밀번호"
      />
      {error ? <AppText style={styles.error}>{error}</AppText> : null}

      <Pressable
        style={[styles.primaryBtn, busy && styles.disabled]}
        onPress={onLogin}
        disabled={busy}
        accessibilityRole="button"
        accessibilityState={{ disabled: busy }}
      >
        <AppText style={styles.primaryText}>로그인</AppText>
      </Pressable>

      <View style={styles.oauthNotice}>
        <AppText style={styles.oauthNoticeText}>
          Google / 카카오 / Apple 로그인은 아직 연결되지 않았어요. 이메일로만 가입·로그인할 수
          있습니다.
        </AppText>
      </View>

      <AppText style={styles.hint}>계정이 없으면 아래에서 가입해 주세요.</AppText>
    </PopArtAuthShell>
  );
}
