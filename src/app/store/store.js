'use client';
// state management https://simpler-state.js.org/quick-start.html
import { entity } from 'simpler-state';
import { produce } from 'immer';

export const NODE_ENDPOINT = entity(
  ''
  // 'https://nd-777-597-727.p2pify.com/1022f90128a148f6be9bfeef17f6cb9c'
);

export const SET_NODE_ENDPOINT = (value) => {
  NODE_ENDPOINT.set(value);
};

export const NODE_ENDPOINT_2 = entity(
  ''
  // 'https://special-rough-morning.quiknode.pro/c3789ddd23dc7e5c32759180aa6dc51bbd9a8fce/'
  // 'https://site1.moralis-nodes.com/eth/f5bd44ea719a4d8091b40271b2c8e6a5'
  // 'https://go.getblock.io/fc9aa8dbda6a4980addabe23ecd5dc67'
);

export const SET_NODE_ENDPOINT_2 = (value) => {
  NODE_ENDPOINT_2.set(value);
};

// single or double
export const COMPARE_MODE = entity('single');

export const SET_COMPARE_MODE = (value) => {
  COMPARE_MODE.set(value);
};

export const METHODS = entity([
  {
    id: 0,
    order: 1,
    method_used: 'eth_getBlockByNumber',
    method_url: process.env.NEXT_PUBLIC_BACKEND_APP_URL + 'test-get-block',
    perform: true,
    isLoading: true,
    data: {},
  },
  {
    id: 1,
    order: 1,
    method_used: 'eth_call',
    method_url: process.env.NEXT_PUBLIC_BACKEND_APP_URL + 'test-eth-call',
    perform: true,
    isLoading: true,
    data: {},
  },
]);

export const METHODS_2 = entity([
  {
    id: 0,
    order: 2,
    method_used: 'eth_getBlockByNumber',
    method_url: process.env.NEXT_PUBLIC_BACKEND_APP_URL + 'test-get-block',
    perform: true,
    isLoading: true,
    data: {},
  },
  {
    id: 1,
    order: 2,
    method_used: 'eth_call',
    method_url: process.env.NEXT_PUBLIC_BACKEND_APP_URL + 'test-eth-call',
    perform: true,
    isLoading: true,
    data: {},
  },
]);

export const GET_METHODS_NAMES = entity(
  METHODS.get().map((item) => item.method_used)
);

export const SET_METHOD_RESPONSE_DATA = (id, payload) => {
  METHODS.set(
    produce((value) => {
      value[id].data = payload;
      // keep this code to test rate limits
      // let x = payload;
      // x.blocks_processed_successfully = 78;
      // value[id].data = x;
    })
  );
};

export const SET_METHOD_RESPONSE_DATA_2 = (id, payload) => {
  METHODS_2.set(
    produce((value) => {
      value[id].data = payload;
      // keep this code to test rate limits
      // let x = payload;
      // x.blocks_processed_successfully = 78;
      // value[id].data = x;
    })
  );
};

// export const SET_METHOD_IS_LOADING = (id, payload) => {
//   METHODS.set(
//     produce((value) => {
//       value[id].isLoading = payload;
//     })
//   );
// };

export const CLEAR_METHODS_DATA = () => {
  METHODS.get().forEach((item) => {
    METHODS.set(
      produce((value) => {
        value[item.id].data = {};
        value[item.id].isLoading = true;
      })
    );
  });
  METHODS_2.get().forEach((item) => {
    METHODS_2.set(
      produce((value) => {
        value[item.id].data = {};
        value[item.id].isLoading = true;
      })
    );
  });
};

export const SUPPORTED_NETWORKS = entity([
  {
    protocol: 'Ethereum',
    networks: ['Mainnet', 'Holešky Testnet', 'Sepolia Testnet'],
  },
  {
    protocol: 'Polygon',
    networks: ['Mainnet', 'Mumbai Testnet'],
  },
  {
    protocol: 'BNB Smart Chain',
    networks: ['Mainnet', 'Testnet'],
  },
  {
    protocol: 'Base',
    networks: ['Mainnet', 'Sepolia Testnet'],
  },
  {
    protocol: 'Avalanche',
    networks: ['Mainnet', 'Fuji Testnet'],
  },
  {
    protocol: 'Arbitrum',
    networks: ['Mainnet', 'Sepolia Testnet'],
  },
  {
    protocol: 'Optimism',
    networks: ['Mainnet', 'Sepolia Testnet'],
  },
  {
    protocol: 'Scroll',
    networks: ['Mainnet', 'Sepolia Testnet'],
  },
  {
    protocol: 'Ronin',
    networks: ['Saigon Testnet'],
  },
  {
    protocol: 'Gnosis Chain',
    networks: ['Mainnet', 'Chiado Testnet'],
  },
  {
    protocol: 'Cronos',
    networks: ['Mainnet', 'Testnet'],
  },
  {
    protocol: 'Fantom',
    networks: ['Mainnet', 'Testnet'],
  },
  {
    protocol: 'Harmony',
    networks: ['Mainnet', 'Testnet'],
  },
]);
