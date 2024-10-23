'use client';
import { useEffect, useState } from 'react';
import { Button, Input } from '@lemonsqueezy/wedges';
import Link from 'next/link';

import {
  NODE_ENDPOINT,
  NODE_ENDPOINT_2,
  SET_NODE_ENDPOINT,
  SET_NODE_ENDPOINT_2,
  CLEAR_METHODS_DATA,
} from '../store/store';

export default function Home() {
  const nodeEndpoint = NODE_ENDPOINT.use();
  const nodeEndpoint2 = NODE_ENDPOINT_2.use();

  // error state for input
  const [input1, setInput1] = useState(false);
  const [input2, setInput2] = useState(false);

  useEffect(() => {
    CLEAR_METHODS_DATA();
  }, []);

  let emptyInput = { border: '1px solid red' };

  return (
    <div
      className="mx-4 my-4"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div>
        <div className="flex gap-4">
          <div className="flex-grow">
            <Input
              style={input1 === true ? emptyInput : {}}
              className="fix-input-bg"
              placeholder="Endpoint 1"
              value={nodeEndpoint}
              onChange={(e) => {
                setInput1(false);
                SET_NODE_ENDPOINT(e.target.value);
              }}
            />
          </div>
          <div className="flex-grow">
            <Input
              style={input2 === true ? emptyInput : {}}
              className="flex-1 fix-input-bg"
              placeholder="Endpoint 2"
              value={nodeEndpoint2}
              onChange={(e) => {
                setInput2(false);
                SET_NODE_ENDPOINT_2(e.target.value);
              }}
            />
          </div>
        </div>

        <Link
          href={
            input1 === false &&
            input2 === false &&
            nodeEndpoint.length !== 0 &&
            nodeEndpoint2.length !== 0
              ? {
                  pathname: '/injection-result-double',
                }
              : { pathname: 'javascript:void(0);' }
          }
        >
          <Button
            variant="primary"
            className="fix-cta-button w-full mt-4"
            onClick={() => {
              if (nodeEndpoint.length === 0) {
                setInput1(true);
              }
              if (nodeEndpoint2.length === 0) {
                setInput2(true);
              }
            }}
          >
            Run test →
          </Button>
        </Link>
      </div>
    </div>
  );
}
