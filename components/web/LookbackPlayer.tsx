'use client';

import { useEffect, useMemo, useState } from 'react';

import { formatLookbackSubtitle } from '@/lib/client/time';

export type LookbackSlide = {
  id: string;
  dayKey: string;
  imageUri: string;
  caption: string;
  subtitle?: string;
};

const SLIDE_MS = 5500;

type Props = {
  slides: LookbackSlide[];
};

export function LookbackPlayer({ slides }: Props) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [fadeKey, setFadeKey] = useState(0);

  const safeSlides = slides.length > 0 ? slides : [];
  const current = safeSlides[index] ?? null;
  const outgoing =
    safeSlides.length > 1 ? safeSlides[(index - 1 + safeSlides.length) % safeSlides.length] : null;

  const subtitle = useMemo(() => {
    if (!current) return '';
    return current.subtitle || formatLookbackSubtitle(current.dayKey, current.caption);
  }, [current]);

  useEffect(() => {
    if (!playing || safeSlides.length <= 1) return;
    const t = window.setTimeout(() => {
      setIndex((i) => (i + 1) % safeSlides.length);
      setFadeKey((k) => k + 1);
    }, SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [playing, index, safeSlides.length]);

  if (!current) {
    return (
      <div className="lookback-empty">
        <p className="tagline">이 기간에 올린 사진이 없어요.</p>
      </div>
    );
  }

  const panClass = index % 2 === 0 ? 'lookback-ken-a' : 'lookback-ken-b';

  function go(delta: number) {
    if (safeSlides.length === 0) return;
    setIndex((i) => (i + delta + safeSlides.length) % safeSlides.length);
    setFadeKey((k) => k + 1);
  }

  return (
    <div className="lookback-stage" data-testid="lookback-stage">
      <div className="lookback-frame">
        {outgoing && fadeKey > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`out-${fadeKey}`}
            className="lookback-layer lookback-fade-out"
            src={outgoing.imageUri}
            alt=""
          />
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={`cur-${current.id}-${fadeKey}`}
          className={`lookback-layer lookback-fade-in ${panClass}`}
          src={current.imageUri}
          alt=""
        />
        <div className="lookback-vignette" />
        <div className="lookback-caption" data-testid="lookback-caption">
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="lookback-controls">
        <button type="button" className="lookback-ctl" onClick={() => go(-1)} aria-label="이전">
          이전
        </button>
        <button
          type="button"
          className="lookback-ctl primary"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? '일시정지' : '재생'}
          data-testid="lookback-play-toggle"
        >
          {playing ? '일시정지' : '재생'}
        </button>
        <button type="button" className="lookback-ctl" onClick={() => go(1)} aria-label="다음">
          다음
        </button>
      </div>

      <p className="tagline lookback-progress">
        {index + 1} / {safeSlides.length}
      </p>
    </div>
  );
}
