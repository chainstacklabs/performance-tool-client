"use client";
import { useEffect } from "react";
import { Button, Badge, Tabs, Tooltip, Input } from "@lemonsqueezy/wedges";
import { TypeAnimation } from "react-type-animation";
import Performance from "@/components/Performance/Preformance";
import Bento from "@/components/Bento/Bento";
import FaqBasic from "@/components/Faq/FaqBasic";
import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import Link from "next/link";
import {
  NODE_ENDPOINT,
  SET_NODE_ENDPOINT,
  CLEAR_METHODS_DATA,
} from "./store/store";

function FormTabs() {
  return (
    <div className="m-auto flex w-fit max-w-full flex-col gap-10 text-left">
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
  useEffect(() => {
    CLEAR_METHODS_DATA();
  }, []);

  return (
    <div className="m-auto max-w-6xl">
      <Header />

      <main>
        <h1 className="uppercase text-left text-5xl leading-tight tracking-wide my-48 font-black">
          meet{" "}
          <TypeAnimation
            sequence={[
              "modern",
              3000,
              "sophisticated",
              3000,
              "precise",
              3000,
              "tailored",
              3000,
              "perfect",
              3000,
              "modern",
              3000,
            ]}
            preRenderFirstString={true}
            speed={20}
            repeat={Infinity}
          />
          <Performance />
          tool
        </h1>
        <div className="grid grid-cols-2 gap-8 my-20 text-gray-400 font-mono">
          <p>
            In the dynamic landscape of blockchain technology, where the
            efficiency and reliability of RPC nodes are paramount; traditional
            tools often need to catch up by focusing mostly on latency. At
            Chainstack, we recognize the necessity of a more holistic approach
            to node performance evaluation.
          </p>
          <p>
            Chainstack Compare transcends conventional metrics by taking a a
            different approach to measuring node efficiency, particularly in
            data fetching—a critical factor for the performance of decentralized
            applications. Designed to the modern needs of developers, our tool
            provides a nuanced assessment that goes beyond simple latency
            numbers to capture the essence of real-world node performance.
          </p>
        </div>

        {/* FORM */}

        <div className="flex flex-row justify-between items-center p-12 custom-bento-card mb-10">
          <h2 className="text-5xl font-bold text-accent">
            Test your
            <br />
            endpoint
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
                pathname: "/result",
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
