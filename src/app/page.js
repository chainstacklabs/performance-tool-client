'use client';
import { useEffect } from 'react';
import { Button, Badge, Tabs, Input } from '@lemonsqueezy/wedges';
import Bento from '@/components/Bento/Bento';
import FaqBasic from '@/components/Faq/FaqBasic';
import Footer from '@/components/Footer/Footer';
import Header from '@/components/Header/Header';
import ProtocolIcon from '@/components/ProtocolIcon/ProtocolIcon';
import Link from 'next/link';

import { ColumnsIcon, StopIcon } from '@iconicicons/react';

import {
  NODE_ENDPOINT,
  NODE_ENDPOINT_2,
  SET_NODE_ENDPOINT,
  SET_NODE_ENDPOINT_2,
  CLEAR_METHODS_DATA,
  SUPPORTED_NETWORKS,
  COMPARE_MODE,
  SET_COMPARE_MODE,
} from './store/store';

export default function Home() {
  const nodeEndpoint = NODE_ENDPOINT.use();
  const nodeEndpoint2 = NODE_ENDPOINT_2.use();
  const supportedNetworks = SUPPORTED_NETWORKS.use();
  const compareMode = COMPARE_MODE.use();

  useEffect(() => {
    CLEAR_METHODS_DATA();
  }, []);

  return (
    <div className="lg:m-auto lg:max-w-6xl sm:mx-4 mx-4">
      <Header />

      <main>
        <h1 className="uppercase text-center text-6xl tracking-wide mt-48 mb-4 font-black heading-gradient ">
          Test RPC endpoint
          <br />
          performance
        </h1>
        <div className="text-base mb-10 text-gray-400 text-center">
          Chainstack Compare runs profiles based on standard
          <br />
          Ethereum RPC methods that fetch blockchain data.
        </div>

        <div className="flex lg:flex-row sm:flex-col flex-col justify-between lg:items-center sm:items-center p-8 sm:p-12 lg:p-12 mb-10 justify-around">
          {/* <div className="w-8/12"> */}
          <div className="hidden lg:w-8/12 lg:flex sm:flex w-fit max-w-full flex-col gap-10 text-left p-12 custom-bento-card ">
            <Tabs
              variant="underlined"
              defaultValue={compareMode}
              onValueChange={(value) => SET_COMPARE_MODE(value)}
            >
              <Tabs.List stretch>
                <Tabs.Trigger value="double" before={<ColumnsIcon />}>
                  Two endpoints comparison
                </Tabs.Trigger>
                <Tabs.Trigger value="single" before={<StopIcon />}>
                  Single endpoint performance
                </Tabs.Trigger>
              </Tabs.List>

              {/* // CONTENT 1 */}

              <Tabs.Content value="single">
                <div className="mt-10">
                  <Input
                    required
                    className="fix-input-bg w-full"
                    placeholder="Your endpoint URL"
                    value={nodeEndpoint}
                    onChange={(e) => {
                      SET_NODE_ENDPOINT(e.target.value);
                    }}
                  />
                  <Link
                    href={{
                      pathname: '/compare-single',
                    }}
                  >
                    <Button
                      variant="primary"
                      className="fix-cta-button w-full mt-4"
                    >
                      Run test →
                    </Button>
                  </Link>
                </div>
              </Tabs.Content>

              {/* // CONTENT 2 */}

              <Tabs.Content value="double">
                <div className="flex gap-4 mt-10">
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
                    pathname: '/compare-double',
                  }}
                >
                  <Button
                    variant="primary"
                    className="fix-cta-button w-full mt-4"
                  >
                    Run test →
                  </Button>
                </Link>
              </Tabs.Content>
            </Tabs>
          </div>
          {/* </div> */}
        </div>
        <div>
          <h2 className="text-5xl font-bold text-accent text-left sm:text-center lg:text-center mt-40 mb-10">
            Supported networks
          </h2>

          <div className="[&>span]:mb-2 [&>span]:mr-2 [&>span]:!bg-[#121d3a]">
            {supportedNetworks.map((item, i) => (
              <>
                {item.networks.map((network, idx) => {
                  return (
                    <Badge
                      key={idx}
                      before={<ProtocolIcon protocolName={item.protocol} />}
                    >
                      {network}
                    </Badge>
                  );
                })}
              </>
            ))}
          </div>
        </div>
        <div className="grid lg:grid-cols-2 lg:grid-rows-1 sm:grid-cols-1 sm:grid-rows-2 gap-4 lg:gap-8 sm:gap-4 my-20 text-gray-400 font-mono">
          <div>
            <p className="mb-4">
              Chainstack Compare is tool to measure the node performance metrics
              that make sense.
            </p>

            <p className="mb-4">
              The tool runs server-side on an instance maintained by Chainstack.
            </p>
            <div className="mb-4">
              <p>Server-side instance specs:</p>
              <p>2 vCPUs with 2GB of RAM</p>
            </div>
            <div className="mb-4">
              <p>Contract:</p>
              <a
                href="https://etherscan.io/address/0x087CDFb5D353395Cff09d986295d59A0B9E15D77#code"
                className="text-blue-500 hover:text-blue-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                CompareNodePerformance
              </a>
            </div>
          </div>

          <div>
            <p className="mb-2">
              The tool does a few calls to the exact same dummy contracts
              deployed on a few EVM networks. The tool measures the performance
              from three data points:
            </p>

            <ul className="list-disc list-inside mb-4">
              <li>the number of processed blocks with the calls;</li>
              <li>the time it takes to process the blocks with the calls;</li>
              <li>
                the resulting blocks-per-second metric, or the expected data
                throughput.
              </li>
            </ul>
            <p className="mb-2">
              As you can see, all the parameters are uniform except for the one
              you care about and feed to the tool — your node endpoint.
            </p>
            <p>
              <a
                href="https://docs.chainstack.com/docs/chainstack-compare-rpc-node-performance"
                className="text-blue-500 hover:text-blue-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn how Chainstack Compare works under the hood and why we
                built it ↗.
              </a>
            </p>
          </div>
        </div>

        {/* FORM */}

        {/* BENTO */}

        <Bento />

        {/* FAQ */}

        <FaqBasic />
      </main>
      <Footer />
    </div>
  );
}
