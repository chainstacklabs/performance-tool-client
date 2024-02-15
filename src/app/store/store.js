'use client';
// state management https://simpler-state.js.org/quick-start.html
import { entity } from 'simpler-state';
import { produce } from 'immer';

const BACKEND_URL = 'http://localhost:8000/api/v1/scenarios/';

export const NODE_ENDPOINT = entity(
  //   ''
  'https://ethereum-holesky.core.chainstack.com/e4aeac86d26b2ee19f6a03aa3acb0d41'
  //   'https://eth-mainnet.blastapi.io/bd70bad7-693b-4112-bc03-7bd06fe8a675'
);

export const SET_NODE_ENDPOINT = (value) => {
  NODE_ENDPOINT.set(value);
};

export const METHODS = entity([
  {
    id: 0,
    method_used: 'eth_getBlockByNumber',
    method_url: BACKEND_URL + 'test-get-block2',
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
]);

export const GET_METHODS_NAMES = entity(
  METHODS.get().map((item) => item.method_used)
);

export const SET_METHOD_RESPONSE_DATA = (id, payload) => {
  METHODS.set(
    produce((value) => {
      //   value[id].data = payload;
      let x = payload;
      x.blocks_processed_successfully = 78;
      value[id].data = x;
    })
  );
};

export const SET_METHOD_IS_LOADING = (id, payload) => {
  METHODS.set(
    produce((value) => {
      value[id].isLoading = payload;
    })
  );
};

export const CLEAR_METHODS_DATA = () => {
  METHODS.get().forEach((item) => {
    METHODS.set(
      produce((value) => {
        value[item.id].data = {};
        value[item.id].isLoading = true;
      })
    );
  });
};
