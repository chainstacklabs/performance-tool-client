'use client';

import Image from 'next/image';

const LOGO_MAP = {
  Ethereum:    'ethereum',
  Arbitrum:    'arbitrum',
  Base:        'base',
  BNB:         'bnb',
  Hyperliquid: 'hyperliquid',
  Monad:       'monad',
  Solana:      'solana',
  TON:         'ton',
};

import { BRAND, brandRgba } from './brandColors';

const rgba = (c, a) => `rgba(${c.r},${c.g},${c.b},${a})`;

export default function ProtocolChips({ chains, active, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {chains.map(chain => {
        const isActive = chain.promName === active;
        const logo = LOGO_MAP[chain.promName];
        const brand = BRAND[chain.promName];
        return (
          <button
            key={chain.promName}
            onClick={() => onChange(chain.promName)}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          8,
              background:   brand && isActive ? rgba(brand, 0.15) : 'transparent',
              border:       `1.5px solid ${isActive ? (brand ? rgba(brand, 0.65) : '#4DAFFF') : '#2E3338'}`,
              borderRadius: 10,
              padding:      '9px 18px 9px 12px',
              cursor:       'pointer',
              transition:   'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => {
              if (!isActive) e.currentTarget.style.borderColor = '#4A5260';
            }}
            onMouseLeave={e => {
              if (!isActive) e.currentTarget.style.borderColor = '#2E3338';
            }}
          >
            {logo && (
              <div style={{ width: 30, height: 30, position: 'relative', flexShrink: 0, borderRadius: 9999, overflow: 'hidden' }}>
                <Image
                  src={`/logos/${logo}.svg`}
                  alt={chain.name}
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            )}
            <span style={{ position: 'relative', whiteSpace: 'nowrap' }}>
              {/* reserves width at max weight */}
              <span style={{
                fontSize: 15, lineHeight: '20px', fontWeight: 450,
                letterSpacing: '-0.14px', visibility: 'hidden', userSelect: 'none',
              }}>
                {chain.name}
              </span>
              {/* visible text */}
              <span style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center',
                fontSize: 15, lineHeight: '20px',
                fontWeight:    isActive ? 500 : 400,
                letterSpacing: '-0.14px',
                color:         isActive ? '#FFFFFF' : '#8D95A5',
              }}>
                {chain.name}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
