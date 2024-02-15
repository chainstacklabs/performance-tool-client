'use client';

import React, { createContext, useState } from 'react';

export const Context = createContext();

const Provider = ({ children }) => {
  const BACKEND_URL = 'http://localhost:8000/api/v1/scenarios/';

  const [config, setConfig] = useState({
    endpoints: [
      'https://ethereum-holesky.core.chainstack.com/e4aeac86d26b2ee19f6a03aa3acb0d41',
    ],

    methods: [
      {
        id: 0,
        method_used: 'eth_getBlockByNumber',
        method_url: BACKEND_URL + 'test-get-block',
        perform: true,
        isLoading: true,
        data: {},
      },
      {
        id: 1,
        method_used: 'eth_call',
        method_url: BACKEND_URL + 'test-eth-call',
        perform: true,
        isLoading: true,
        data: {},
      },
    ],
    // {
    //   eth_getBlockByNumber: {
    //     perform: true,
    //     isLoading: true,
    //     data: {},
    //   },
    //   eth_call: {
    //     perform: true,
    //     isLoading: true,
    //     data: {},
    //   },
    //   debug: {
    //     perform: true,
    //     isLoading: true,
    //     data: {},
    //   },
    // },
  });

  return (
    <Context.Provider value={[config, setConfig]}>{children}</Context.Provider>
  );
};

export default Provider;

// Partial<{
//   [otherOptionKey: string]: any;
//   width: number;
//   height: number;
//   is3D: boolean;
//   title: string;
//   backgroundColor: string;
//   hAxis?: {
//     [otherOptionKey: string]: any;
//     minValue?: any;
//     maxValue?: any;
//     ticks?: GoogleChartTicks;
//     title?: string;
//     viewWindow?: { ...; };
//   };
//   vAxis?: { ...; };
//   legend: any;
//   colors: string[]; }>

// {
//   "method_used": "eth_getBlockByNumber",
//   "target_blocks": 120,
//   "time_taken_in_seconds": 11.503856421000023,
//   "blocks_processed_successfully": 120,
//   "failure_rate": 0.0,
//   "blocks_per_seconds": 10.43128457174959,
//   "avg_latency_per_block": 0.09586547017500019,
//   "rate_limit_triggered": false,
//   "rate_limit_message": "N/A"
// }
