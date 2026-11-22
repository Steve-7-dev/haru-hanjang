/**
 * Web-only CSS: Pretendard (Hangul-capable) for document + form controls.
 * Do NOT force font-family on all #root spans/divs — that overrides Ionicons
 * and other icon fonts used by @expo/vector-icons.
 */
export const PRETENDARD_WEB_CSS = `
@font-face {
  font-family: 'Pretendard';
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  src: url('/fonts/Pretendard-Regular.woff2') format('woff2');
}
@font-face {
  font-family: 'Pretendard';
  font-weight: 500;
  font-style: normal;
  font-display: swap;
  src: url('/fonts/Pretendard-Medium.woff2') format('woff2');
}
@font-face {
  font-family: 'Pretendard';
  font-weight: 600;
  font-style: normal;
  font-display: swap;
  src: url('/fonts/Pretendard-SemiBold.woff2') format('woff2');
}
@font-face {
  font-family: 'Pretendard';
  font-weight: 700;
  font-style: normal;
  font-display: swap;
  src: url('/fonts/Pretendard-Bold.woff2') format('woff2');
}

/* System / SF first; Pretendard self-hosted fallback (Hangul). Never force all spans (Ionicons). */
html, body, #root {
  font-family: -apple-system, 'SF Pro Text', system-ui, Pretendard, sans-serif;
}

#root input, #root textarea, #root button, #root select {
  font-family: -apple-system, 'SF Pro Text', system-ui, Pretendard, sans-serif !important;
}

#root input::placeholder,
#root textarea::placeholder,
#root input::-webkit-input-placeholder,
#root textarea::-webkit-input-placeholder {
  font-family: -apple-system, 'SF Pro Text', system-ui, Pretendard, sans-serif !important;
}

/* Keep vector-icon glyph fonts intact when present */
#root [class*="css-"][style*="ionicons"],
#root [style*="Ionicons"],
#root [style*="ionicons"] {
  font-family: ionicons, Ionicons !important;
}
`;
