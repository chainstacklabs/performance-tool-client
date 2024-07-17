'use client';
import { useEffect } from 'react';
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

  useEffect(() => {
    CLEAR_METHODS_DATA();
  }, []);

  return (
    <div className="max-w-lg mx-4 my-4">
      <div className="flex gap-4">
        <div className="flex-grow">
          <Input
            required
            className="fix-input-bg"
            placeholder="Endpoint 1"
            value={nodeEndpoint}
            onChange={(e) => {
              SET_NODE_ENDPOINT(e.target.value);
            }}
          />
        </div>
        <div className="flex-grow">
          <Input
            required
            className="flex-1 fix-input-bg"
            placeholder="Endpoint 2"
            value={nodeEndpoint2}
            onChange={(e) => {
              SET_NODE_ENDPOINT_2(e.target.value);
            }}
          />
        </div>
      </div>

      <Link
        href={{
          pathname: '/injection-result-double',
        }}
      >
        <Button variant="primary" className="fix-cta-button w-full mt-4">
          Run test →
        </Button>
      </Link>
    </div>
  );
}
