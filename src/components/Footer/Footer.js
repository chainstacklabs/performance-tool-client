import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="mt-40 mb-10 text-center text-gray-500">
      <a
        href="https://chainstack.com/"
        target="_blank"
        className="text-blue-600"
      >
        Chainstack
      </a>{' '}
      – Fast and Reliable Blockchain Infrastructure Provider © {currentYear}
    </footer>
  );
};

export default Footer;
