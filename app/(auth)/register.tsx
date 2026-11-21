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

export default function RegisterScreen() {
  const registerEmail = useHaruStore((s) => s.registerEmail);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');

  const onRegister = () => {
    const res = registerEmail({ email, password, username, displayName });
    if (!res.ok) Alert.alert('가입 실패', res.error);
    else router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Logo size="lg" />
        <Text style={styles.tagline}>친구들과, 하루 한 장만.</Text>

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
          placeholder="성명"
          placeholderTextColor={Colors.textSecondary}
          value={displayName}
          onChangeText={setDisplayName}
        />
        <TextInput
          style={styles.input}
          placeholder="사용자 이름"
          placeholderTextColor={Colors.textSecondary}
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          placeholderTextColor={Colors.textSecondary}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Pressable style={styles.primaryBtn} onPress={onRegister}>
          <Text style={styles.primaryText}>가입</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>계정이 있으신가요? </Text>
        <Link href="/(auth)/login" asChild>
          <Pressable>
            <Text style={styles.link}>로그인</Text>
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
    textAlign: 'center',
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
  primaryText: { color: Colors.textInverse, fontWeight: '700', fontSize: 14 },
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
