'use client';

import Image from 'next/image';
import { BRAND } from './brandColors';

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

const rgba = (c, a) => `rgba(${c.r},${c.g},${c.b},${a})`;

export default function ProtocolChips({ chains, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {chains.map((chain) => {
        const isActive = chain.promName === active;
        const logo = LOGO_MAP[chain.promName];
        const brand = BRAND[chain.promName];

        // Brand colors are per-protocol → passed as CSS variables
        const style = isActive
          ? {
              '--chip-bd': brand ? rgba(brand, 0.65) : '#4DAFFF',
              ...(brand ? { '--chip-bg': rgba(brand, 0.15) } : {}),
            }
          : undefined;

        return (
          <button
            key={chain.promName}
            onClick={() => onChange?.(chain.promName)}
            style={style}
            className={`flex items-center gap-2 h-12 rounded-[10px] pl-3 pr-[18px] cursor-pointer border-[1.5px] transition-[background-color,border-color] duration-150 ${
              isActive
                ? `border-[color:var(--chip-bd)] ${brand ? 'bg-[var(--chip-bg)]' : 'bg-transparent'}`
                : 'bg-transparent border-[#2E3338] hover:border-fg-ghost'
            }`}
          >
            {logo && (
              <div className="w-[30px] h-[30px] relative shrink-0 rounded-full overflow-hidden">
                <Image src={`/logos/${logo}.svg`} alt={chain.name} fill className="object-contain" />
              </div>
            )}
            <span className="relative whitespace-nowrap">
              <span className="text-[15px] leading-5 font-[450] tracking-[-0.14px] invisible select-none">
                {chain.name}
              </span>
              <span className={`absolute inset-0 flex items-center text-[15px] leading-5 tracking-[-0.14px] ${
                isActive ? 'font-medium text-white' : 'font-normal text-fg-muted'
              }`}>
                {chain.name}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
