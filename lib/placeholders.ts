/** Local SVG data-URI placeholders — no third-party image hosts. */

function svgDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function avatarSvg(label: string, bg: string): string {
  return svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="${bg}"/>
      <text x="100" y="112" text-anchor="middle" font-family="system-ui,sans-serif" font-size="64" fill="#ffffff">${label}</text>
    </svg>`,
  );
}

function postSvg(title: string, bg: string, accent: string): string {
  return svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${bg}"/>
          <stop offset="100%" stop-color="${accent}"/>
        </linearGradient>
      </defs>
      <rect width="1080" height="1080" fill="url(#g)"/>
      <text x="540" y="540" text-anchor="middle" font-family="system-ui,sans-serif" font-size="56" fill="#ffffff" opacity="0.9">${title}</text>
    </svg>`,
  );
}

export const PLACEHOLDER = {
  avatarMina: avatarSvg('미', '#4A5568'),
  avatarJun: avatarSvg('준', '#2B6CB0'),
  avatarSoo: avatarSvg('수', '#805AD5'),
  postCoffee: postSvg('하루 한 장', '#1A202C', '#744210'),
  postSunset: postSvg('노을', '#9B2C2C', '#DD6B20'),
  postDinner: postSvg('저녁', '#276749', '#2C7A7B'),
} as const;
