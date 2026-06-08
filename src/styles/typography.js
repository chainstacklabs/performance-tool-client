// Figma Design System 2.0 — text styles (node 5812:2933)
// letterSpacing is % of font-size converted to px

export const TYPE = {
  heroHeading: { fontSize: 56, lineHeight: 68, fontWeight: 500, letterSpacing: '-1.12px' },
  heading1:    { fontSize: 40, lineHeight: 48, fontWeight: 500, letterSpacing: '-0.8px'  },
  heading2:    { fontSize: 32, lineHeight: 38, fontWeight: 500, letterSpacing: '-0.64px' },
  heading3:    { fontSize: 28, lineHeight: 34, fontWeight: 500, letterSpacing: '-0.56px' },
  heading4:    { fontSize: 24, lineHeight: 28, fontWeight: 500, letterSpacing: '-0.48px' },

  subtitleL:   { fontSize: 18, lineHeight: 24, fontWeight: 500, letterSpacing: '-0.18px' },
  subtitleM:   { fontSize: 16, lineHeight: 20, fontWeight: 500, letterSpacing: '-0.16px' },
  subtitleS:   { fontSize: 14, lineHeight: 18, fontWeight: 500, letterSpacing: '-0.14px' },

  bodyL:       { fontSize: 18, lineHeight: 24, fontWeight: 400, letterSpacing: '0'       },
  bodyM:       { fontSize: 16, lineHeight: 20, fontWeight: 400, letterSpacing: '0'       },
  bodyS:       { fontSize: 14, lineHeight: 18, fontWeight: 400, letterSpacing: '0'       },
  bodyXS:      { fontSize: 12, lineHeight: 16, fontWeight: 400, letterSpacing: '-0.12px' },

  captionM:    { fontSize: 16, lineHeight: 20, fontWeight: 450, letterSpacing: '-0.16px' },
  captionS:    { fontSize: 14, lineHeight: 18, fontWeight: 450, letterSpacing: '-0.14px' },
  captionXS:   { fontSize: 12, lineHeight: 16, fontWeight: 450, letterSpacing: '-0.12px' },

  buttonL:     { fontSize: 15, lineHeight: 20, fontWeight: 500, letterSpacing: '0.15px'  },
  buttonM:     { fontSize: 13, lineHeight: 18, fontWeight: 500, letterSpacing: '0.13px'  },
};

// Helper — returns inline style object
export const typeStyle = key => {
  const t = TYPE[key];
  if (!t) return {};
  return {
    fontSize:      t.fontSize,
    lineHeight:    `${t.lineHeight}px`,
    fontWeight:    t.fontWeight,
    letterSpacing: t.letterSpacing,
  };
};
