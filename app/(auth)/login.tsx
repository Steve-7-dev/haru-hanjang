import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Logo } from '@/components/Logo';
import { Colors, Spacing } from '@/constants/theme';
import { useHaruStore } from '@/lib/store';

export default function LoginScreen() {
  const loginEmail = useHaruStore((s) => s.loginEmail);
  const loginOAuthStub = useHaruStore((s) => s.loginOAuthStub);
  const [email, setEmail] = useState('mina@haru.app');
  const [password, setPassword] = useState('haru1234');
  const [busy, setBusy] = useState(false);

  const onLogin = () => {
    setBusy(true);
    const res = loginEmail(email, password);
    setBusy(false);
    if (!res.ok) Alert.alert('로그인 실패', res.error);
    else router.replace('/(tabs)');
  };

  const onOAuth = (provider: 'google' | 'kakao' | 'apple') => {
    const res = loginOAuthStub(provider);
    if (!res.ok) Alert.alert('오류', res.error);
    else {
      Alert.alert(
        '스텁 로그인',
        `${provider} 키를 연결하기 전 임시 계정으로 들어갑니다. 실제 OAuth는 app.json / 콘솔 설정 후 활성화하세요.`,
      );
      router.replace('/(tabs)');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Logo size="lg" />
        <Text style={styles.tagline}>하루, 한 장.</Text>

        <TextInput
          style={styles.input}
          placeholder="이메일"
          placeholderTextColor={Colors.textSecondary}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          placeholderTextColor={Colors.textSecondary}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Pressable
          style={[styles.primaryBtn, busy && styles.disabled]}
          onPress={onLogin}
          disabled={busy}
        >
          <Text style={styles.primaryText}>로그인</Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.or}>또는</Text>
          <View style={styles.line} />
        </View>

        <Pressable style={styles.oauthBtn} onPress={() => onOAuth('google')}>
          <Text style={styles.oauthText}>Google로 계속</Text>
        </Pressable>
        <Pressable style={[styles.oauthBtn, styles.kakao]} onPress={() => onOAuth('kakao')}>
          <Text style={[styles.oauthText, { color: Colors.kakaoText }]}>카카오로 계속</Text>
        </Pressable>
        <Pressable style={[styles.oauthBtn, styles.apple]} onPress={() => onOAuth('apple')}>
          <Text style={[styles.oauthText, { color: Colors.textInverse }]}>Apple로 계속</Text>
        </Pressable>

        <Text style={styles.hint}>데모: mina@haru.app / haru1234</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>계정이 없으신가요? </Text>
        <Link href="/(auth)/register" asChild>
          <Pressable>
            <Text style={styles.link}>가입하기</Text>
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
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    fontSize: 15,
  },
  input: {
    width: '100%',
    backgroundColor: Colors.inputBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 14,
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
  primaryText: { color: Colors.textInverse, fontWeight: '700', fontSize: 14 },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: Colors.border },
  or: { color: Colors.textSecondary, fontWeight: '600', fontSize: 12 },
  oauthBtn: {
    width: '100%',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.googleBorder,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  kakao: { backgroundColor: Colors.kakao, borderColor: Colors.kakao },
  apple: { backgroundColor: Colors.apple, borderColor: Colors.apple },
  oauthText: { fontWeight: '600', fontSize: 14, color: Colors.text },
  hint: { marginTop: Spacing.sm, color: Colors.textSecondary, fontSize: 12 },
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
  footerText: { color: Colors.textSecondary, fontSize: 14 },
  link: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
});
