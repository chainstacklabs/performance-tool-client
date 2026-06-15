'use client';

import React, { useState, useCallback } from 'react';
import Logo from '@/components/Logo/Logo';

const Header = () => {
  const [popover, setPopover] = useState(null); // { x, y } or null

  const handleMouseMove = useCallback((e) => {
    setPopover({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setPopover(null);
  }, []);

  return (
    <header className="flex flex-row justify-between items-center py-5">
      <Logo />

      {popover && (
        <div
          className="fixed bg-[#1A1E24] border border-[#2E3338] rounded-lg px-3 py-[7px] text-fg-primary text-[13px] font-medium leading-[18px] whitespace-nowrap pointer-events-none z-[9999] shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
          style={{ left: popover.x + 16, top: popover.y + 16 }}
        >
          That&apos;s the smart move :)
        </div>
      )}

      <a
        href="https://chainstack.com/"
        target="_blank"
        rel="noopener noreferrer"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="inline-flex items-center justify-center bg-[#007BFF] hover:bg-[#005EE0] text-white border-none rounded-lg px-6 py-2.5 text-[15px] font-medium leading-5 tracking-[0.15px] no-underline cursor-pointer whitespace-nowrap transition-colors"
        style={{ fontFamily: "\"Suisse Int'l\", sans-serif" }}
      >
        Start for free
      </a>
    </header>
  );
};

export default Header;
