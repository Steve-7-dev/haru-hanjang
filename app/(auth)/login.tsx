import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { AppText } from '@/components/AppText';
import { AppTextInput } from '@/components/AppTextInput';
import { Logo } from '@/components/Logo';
import { FontFamily } from '@/constants/fonts';
import { Colors, Spacing } from '@/constants/theme';
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
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Logo size="lg" />
        <AppText style={styles.tagline}>One photo a day.</AppText>

        <AppTextInput
          style={styles.input}
          placeholder="이메일"
          placeholderTextColor={Colors.textSecondary}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
          maxLength={254}
        />
        <AppTextInput
          style={styles.input}
          placeholder="비밀번호"
          placeholderTextColor={Colors.textSecondary}
          secureTextEntry
          autoComplete="password"
          value={password}
          onChangeText={setPassword}
          maxLength={MAX_PASSWORD_LEN}
        />
        {error ? <AppText style={styles.error}>{error}</AppText> : null}

        <Pressable
          style={[styles.primaryBtn, busy && styles.disabled]}
          onPress={onLogin}
          disabled={busy}
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
      </View>

      <View style={styles.footer}>
        <AppText style={styles.footerText}>계정이 없으신가요? </AppText>
        <Link href="/(auth)/register" asChild>
          <Pressable>
            <AppText style={styles.link}>가입하기</AppText>
          </Pressable>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.backgroundMuted,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.background,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    borderRadius: 4,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  tagline: {
    fontFamily: FontFamily.sans,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    fontSize: 15,
    fontWeight: '400',
  },
  input: {
    fontFamily: FontFamily.sans,
    width: '100%',
    backgroundColor: Colors.inputBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '400',
    color: Colors.text,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  disabled: { backgroundColor: Colors.primaryDisabled },
  primaryText: {
    fontFamily: FontFamily.sans,
    color: Colors.textInverse,
    fontWeight: '700',
    fontSize: 14,
  },
  oauthNotice: {
    width: '100%',
    marginTop: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.backgroundMuted,
    borderRadius: 8,
  },
  oauthNoticeText: {
    fontFamily: FontFamily.sans,
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    textAlign: 'center',
  },
  hint: {
    fontFamily: FontFamily.sans,
    marginTop: Spacing.sm,
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
  },
  error: {
    fontFamily: FontFamily.sans,
    color: Colors.heart,
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 4,
    width: '100%',
  },
  footer: {
    marginTop: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    borderRadius: 4,
    padding: Spacing.lg,
  },
  footerText: {
    fontFamily: FontFamily.sans,
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '400',
  },
  link: {
    fontFamily: FontFamily.sans,
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});
