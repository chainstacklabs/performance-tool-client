'use client';

import React, { createContext, useState } from 'react';

export const Context = createContext();

const Provider = ({ children }) => {
  const [config, setConfig] = useState({
    endpoints: [
      'https://ethereum-holesky.core.chainstack.com/e4aeac86d26b2ee19f6a03aa3acb0d41',
    ],
    methods: {
      eth_getBlockByNumber: true,
      eth_call: true,
      debug: true,
    },
  });

  return (
    <Context.Provider value={[config, setConfig]}>{children}</Context.Provider>
  );
};

export default Provider;
