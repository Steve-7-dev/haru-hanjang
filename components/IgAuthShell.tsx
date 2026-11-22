import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { AppText } from '@/components/AppText';
import { BrandMark } from '@/components/BrandMark';
import { AuthUi, authFontFamily, authTextBase } from '@/constants/authUi';
import { Spacing } from '@/constants/theme';

type Props = {
  children: ReactNode;
  /** Secondary outlined action under the form (e.g. create account) */
  secondary?: ReactNode;
  showWordmark?: boolean;
};

/** Clean Instagram-mobile-homage auth layout. */
export function IgAuthShell({ children, secondary, showWordmark = true }: Props) {
  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.card}>
            <BrandMark size={64} />
            {showWordmark ? (
              <AppText style={styles.wordmark} accessibilityRole="header">
                One Day One Shot
              </AppText>
            ) : null}
            {children}
          </View>

          {secondary ? <View style={styles.secondaryBox}>{secondary}</View> : null}

          <AppText style={styles.footerBrand}>One Day One Shot</AppText>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

export const igAuthStyles = StyleSheet.create({
  tagline: {
    ...authTextBase,
    color: AuthUi.muted,
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: Spacing.lg,
    marginTop: 4,
  },
  stepLabel: {
    ...authTextBase,
    color: AuthUi.muted,
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  input: {
    fontFamily: authFontFamily,
    width: '100%',
    backgroundColor: AuthUi.inputBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: AuthUi.border,
    borderRadius: AuthUi.radius,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '400',
    color: AuthUi.ink,
    marginBottom: 8,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: AuthUi.primary,
    borderRadius: AuthUi.radius,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryDisabled: {
    backgroundColor: AuthUi.primaryDisabled,
  },
  primaryText: {
    fontFamily: authFontFamily,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  error: {
    fontFamily: authFontFamily,
    color: AuthUi.danger,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    width: '100%',
  },
  hint: {
    fontFamily: authFontFamily,
    color: AuthUi.muted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },
  secondaryText: {
    fontFamily: authFontFamily,
    color: AuthUi.ink,
    fontSize: 14,
  },
  secondaryLink: {
    fontFamily: authFontFamily,
    color: AuthUi.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  oauthNotice: {
    width: '100%',
    marginTop: 12,
    padding: 12,
    backgroundColor: AuthUi.inputBg,
    borderRadius: AuthUi.radius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: AuthUi.border,
  },
  oauthNoticeText: {
    fontFamily: authFontFamily,
    color: AuthUi.muted,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AuthUi.bg,
  },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  card: {
    backgroundColor: AuthUi.panel,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: AuthUi.border,
    borderRadius: 1,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 28,
    alignItems: 'center',
  },
  wordmark: {
    fontFamily: authFontFamily,
    fontSize: 28,
    fontWeight: '700',
    color: AuthUi.ink,
    letterSpacing: -0.6,
    marginTop: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  secondaryBox: {
    marginTop: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: AuthUi.border,
    borderRadius: 1,
    backgroundColor: AuthUi.panel,
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  footerBrand: {
    fontFamily: authFontFamily,
    marginTop: 28,
    textAlign: 'center',
    color: AuthUi.muted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
