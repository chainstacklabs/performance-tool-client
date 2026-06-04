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

export default function ProtocolChips({ chains, active, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {chains.map(chain => {
        const isActive = chain.promName === active;
        const logo = LOGO_MAP[chain.promName];
        return (
          <button
            key={chain.promName}
            onClick={() => onChange(chain.promName)}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          8,
              background:   isActive ? '#1A2A3A' : 'transparent',
              border:       `1px solid ${isActive ? '#2E4A6A' : '#2E3338'}`,
              borderRadius: 8,
              padding:      '6px 12px 6px 8px',
              cursor:       'pointer',
              transition:   'all 0.12s',
            }}
          >
            {logo && (
              <div style={{ width: 20, height: 20, position: 'relative', flexShrink: 0 }}>
                <Image
                  src={`/logos/${logo}.svg`}
                  alt={chain.name}
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            )}
            <span
              style={{
                fontSize:   13,
                fontWeight: isActive ? 500 : 400,
                color:      isActive ? '#F6F9FD' : '#8D95A5',
                whiteSpace: 'nowrap',
              }}
            >
              {chain.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
