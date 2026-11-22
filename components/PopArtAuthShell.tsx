import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { PopArtBackdrop } from '@/components/PopArtBackdrop';
import { FontFamily } from '@/constants/fonts';
import { PopArt } from '@/constants/popArt';
import { Spacing } from '@/constants/theme';

type Props = {
  children: ReactNode;
  footer?: ReactNode;
};

/** iPhone-width auth chrome: color grid + white readable panel. */
export function PopArtAuthShell({ children, footer }: Props) {
  return (
    <View style={styles.root}>
      <PopArtBackdrop />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.panel}>{children}</View>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PopArt.ink,
  },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    maxWidth: 430,
    width: '100%',
    alignSelf: 'center',
  },
  panel: {
    backgroundColor: PopArt.panel,
    borderWidth: PopArt.borderWidth,
    borderColor: PopArt.ink,
    borderRadius: 0,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  footer: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PopArt.panel,
    borderWidth: PopArt.borderWidth,
    borderColor: PopArt.ink,
    borderRadius: 0,
    padding: Spacing.lg,
  },
});

export const popArtAuthStyles = StyleSheet.create({
  tagline: {
    fontFamily: FontFamily.sans,
    color: PopArt.ink,
    marginBottom: Spacing.md,
    marginTop: 2,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  input: {
    fontFamily: FontFamily.sans,
    width: '100%',
    backgroundColor: PopArt.panel,
    borderWidth: PopArt.borderWidth,
    borderColor: PopArt.ink,
    borderRadius: 0,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '400',
    color: PopArt.ink,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: PopArt.ctaFill,
    borderWidth: PopArt.borderWidth,
    borderColor: PopArt.ink,
    borderRadius: 0,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  disabled: {
    backgroundColor: PopArt.ctaDisabled,
  },
  primaryText: {
    fontFamily: FontFamily.sans,
    color: PopArt.ctaText,
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  oauthNotice: {
    width: '100%',
    marginTop: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: PopArt.panelMuted,
    borderWidth: PopArt.borderWidth,
    borderColor: PopArt.ink,
    borderRadius: 0,
  },
  oauthNoticeText: {
    fontFamily: FontFamily.sans,
    color: PopArt.ink,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    textAlign: 'center',
  },
  hint: {
    fontFamily: FontFamily.sans,
    marginTop: Spacing.sm,
    color: PopArt.ink,
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
  },
  error: {
    fontFamily: FontFamily.sans,
    color: '#B00020',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
    width: '100%',
  },
  footerText: {
    fontFamily: FontFamily.sans,
    color: PopArt.ink,
    fontSize: 14,
    fontWeight: '400',
  },
  link: {
    fontFamily: FontFamily.sans,
    color: PopArt.ink,
    fontWeight: '700',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
