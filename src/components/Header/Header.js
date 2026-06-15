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
    <header style={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 0',
    }}>
      <Logo />

      {popover && (
        <div
          style={{
            position: 'fixed',
            left: popover.x + 16,
            top: popover.y + 16,
            background: '#1A1E24',
            border: '1px solid #2E3338',
            borderRadius: 8,
            padding: '7px 12px',
            color: '#F6F9FD',
            fontSize: 13,
            fontWeight: 500,
            lineHeight: '18px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 9999,
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          }}
        >
          That&apos;s the smart move :)
        </div>
      )}

      <a
        href="https://chainstack.com/"
        target="_blank"
        rel="noopener noreferrer"
        onMouseMove={handleMouseMove}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#007BFF',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 24px',
          fontSize: '15px',
          fontWeight: 500,
          fontFamily: "\"Suisse Int'l\", sans-serif",
          lineHeight: '20px',
          letterSpacing: '0.15px',
          textDecoration: 'none',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#005EE0'}
        onMouseLeave={e => { e.currentTarget.style.background = '#007BFF'; handleMouseLeave(); }}
      >
        Start for free
      </a>
    </header>
  );
};

export default Header;
