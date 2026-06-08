'use client';

import React from 'react';
import Logo from '@/components/Logo/Logo';

const Header = () => {
  return (
    <header style={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 0',
    }}>
      <Logo />
      <a
        href="https://chainstack.com/"
        target="_blank"
        rel="noopener noreferrer"
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
        onMouseLeave={e => e.currentTarget.style.background = '#007BFF'}
      >
        Start for free
      </a>
    </header>
  );
};

export default Header;
