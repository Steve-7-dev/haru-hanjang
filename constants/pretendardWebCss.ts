/**
 * Web-only CSS: force Pretendard (Hangul-capable) on RN Web system stacks,
 * native inputs, and placeholders. Font files are self-hosted — no CDN.
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

html, body, #root {
  font-family: 'Pretendard', system-ui, -apple-system, sans-serif !important;
}

/* RN Web Text / TextInput often ship a system font stack via className */
#root div, #root span, #root p, #root a, #root li, #root label,
#root input, #root textarea, #root button, #root select {
  font-family: 'Pretendard', system-ui, -apple-system, sans-serif !important;
}

#root input::placeholder,
#root textarea::placeholder,
#root input::-webkit-input-placeholder,
#root textarea::-webkit-input-placeholder {
  font-family: 'Pretendard', system-ui, -apple-system, sans-serif !important;
}
`;
