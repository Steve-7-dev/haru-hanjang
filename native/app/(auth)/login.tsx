import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable } from 'react-native';

import { AppText } from '@/components/AppText';
import { AppTextInput } from '@/components/AppTextInput';
import { IgAuthShell, igAuthStyles as styles } from '@/components/IgAuthShell';
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
    <IgAuthShell
      secondary={
        <>
          <AppText style={styles.secondaryText}>계정이 없으신가요? </AppText>
          <Link href="/(auth)/register" asChild>
            <Pressable accessibilityRole="link">
              <AppText style={styles.secondaryLink}>새 계정 만들기</AppText>
            </Pressable>
          </Link>
        </>
      }
    >
      <AppText style={styles.tagline}>One photo a day.</AppText>

      <AppTextInput
        style={styles.input}
        placeholder="이메일"
        placeholderTextColor="#8E8E8E"
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
        placeholderTextColor="#8E8E8E"
        secureTextEntry
        autoComplete="password"
        value={password}
        onChangeText={setPassword}
        maxLength={MAX_PASSWORD_LEN}
        accessibilityLabel="비밀번호"
      />
      {error ? <AppText style={styles.error}>{error}</AppText> : null}

      <Pressable
        style={[styles.primaryBtn, busy && styles.primaryDisabled]}
        onPress={onLogin}
        disabled={busy}
        accessibilityRole="button"
      >
        <AppText style={styles.primaryText}>로그인</AppText>
      </Pressable>

      <Pressable
        style={[styles.primaryBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#DBDBDB' }]}
        onPress={() => {
          setEmail('');
          setPassword('');
          setError(null);
        }}
        accessibilityRole="button"
        accessibilityLabel="다른 프로필 사용"
      >
        <AppText style={[styles.primaryText, { color: '#262626' }]}>다른 프로필 사용</AppText>
      </Pressable>

      <AppText style={styles.oauthNoticeText}>
        Google / 카카오 / Apple 로그인은 아직 연결되지 않았어요. 이메일로만 가입·로그인할 수 있습니다.
      </AppText>
    </IgAuthShell>
  );
}
