'use client';
import { useEffect } from 'react';
import { Button, Badge, Tabs, Tooltip, Input } from '@lemonsqueezy/wedges';
import { TypeAnimation } from 'react-type-animation';
import Performance from '@/components/Performance/Preformance';
import Compare from '@/components/Performance/Compare';
import Bento from '@/components/Bento/Bento';
import FaqBasic from '@/components/Faq/FaqBasic';
import Footer from '@/components/Footer/Footer';
import Header from '@/components/Header/Header';
import ProtocolIcon from '@/components/ProtocolIcon/ProtocolIcon';
import Link from 'next/link';
import {
  NODE_ENDPOINT,
  SET_NODE_ENDPOINT,
  CLEAR_METHODS_DATA,
  SUPPORTED_NETWORKS,
} from './store/store';

function FormTabs() {
  return (
    <div className="hidden m-auto lg:flex sm:flex w-fit max-w-full flex-col gap-10 text-left">
      <Tabs variant="fill" defaultValue="examples">
        <Tabs.List>
          <Tabs.Trigger value="examples">Single endpoint</Tabs.Trigger>

          <Tooltip content="Work in progress. Let us know if you are interested in this feature.">
            <Tabs.Trigger
              value="usage"
              disabled
              after={
                <Badge size="sm" color="yellow">
                  🚧
                </Badge>
              }
            >
              Chainstack vs Your
            </Tabs.Trigger>
          </Tooltip>

          <Tooltip content="Work in progress. Let us know if you are interested in this feature.">
            <Tabs.Trigger
              value="playground"
              disabled
              after={
                <Badge size="sm" color="yellow">
                  🚧
                </Badge>
              }
            >
              Chainstack vs Custom
            </Tabs.Trigger>
          </Tooltip>
        </Tabs.List>
        {/* Add Tabs.Content for each trigger/tab */}
      </Tabs>
    </div>
  );
}

export default function Home() {
  const nodeEndpoint = NODE_ENDPOINT.use();
  const supportedNetworks = SUPPORTED_NETWORKS.use();
  useEffect(() => {
    CLEAR_METHODS_DATA();
  }, []);

  return (
    <div className="lg:m-auto lg:max-w-6xl sm:mx-4 mx-4">
      <Header />

      <main>
        <h1 className="uppercase text-left text-5xl leading-tight tracking-wide my-24 sm:my-48 lg:my-48 font-black">
          meet the{' '}
          <span className="block sm:hidden lg:hidden">modern compare</span>
          <TypeAnimation
            className="sm:hidden lg:inline hidden"
            sequence={[
              'uniform',
              3000,
              'practical',
              3000,
              'precise',
              3000,
              'useful',
              3000,
              'factual',
              3000,
            ]}
            preRenderFirstString={true}
            speed={20}
            repeat={Infinity}
          />
          <Compare />
          tool
        </h1>
        <div className="grid lg:grid-cols-2 lg:grid-rows-1 sm:grid-cols-1 sm:grid-rows-2 gap-4 lg:gap-8 sm:gap-4 my-20 text-gray-400 font-mono">
          <div>
            <p className="mb-4">
              Chainstack Compare is tool to measure the node performance metrics
              that make sense.
            </p>

            <p className="mb-4">
              The tool runs server-side on an instance maintained by Chainstack.
            </p>

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
              As you can see, all the parameters are uninform except for the one
              you care about and feed to the tool — your node endpoint.
            </p>
            <p>
              <a
                href="https://docs.chainstack.com/docs/chainstack-compare-rpc-node-performance"
                className="text-blue-500 hover:text-blue-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn how Chainstack Compare works under the hood and and why we
                built it ↗.
              </a>
            </p>
          </div>

          <div>
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
            <div>
              <p className="mb-2">Supported networks:</p>
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
          </div>
        </div>
        {/* <div className="transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg p-2 bg-white rounded-lg shadow-md mb-4">
          <a
            href="https://docs.chainstack.com/docs/chainstack-compare-rpc-node-performance"
            target="blank"

          >
            <h3 className="text-lg text-gray-900 font-semibold mb-2">
              Learn how Chainstack Compare works
            </h3>
            <p className="text-gray-600">
              The guide will explain the logic behind the tool and why we built
              it.
            </p>
          </a>
        </div> */}

        {/* FORM */}

        <div className="flex lg:flex-row sm:flex-col flex-col justify-between lg:items-center sm:items-center p-8 sm:p-12 lg:p-12 custom-bento-card mb-10">
          <h2 className="text-5xl font-bold text-accent sm:mb-8">
            Test your
            <br className="lg:block sm:hidden hidden" /> endpoint
          </h2>

          <div className="">
            <FormTabs />
            <Input
              required
              className="fix-input-bg my-4 w-full"
              placeholder="Your endpoint URL"
              value={nodeEndpoint}
              onChange={(e) => {
                SET_NODE_ENDPOINT(e.target.value);
              }}
            />
            <Link
              href={{
                pathname: '/result',
              }}
            >
              <Button variant="primary" className="fix-cta-button w-full">
                Run test →
              </Button>
            </Link>
          </div>
        </div>

        {/* BENTO */}

        <Bento />

        {/* FAQ */}

        <FaqBasic />
      </main>
      <Footer />
    </div>
  );
}
