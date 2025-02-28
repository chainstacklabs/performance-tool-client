'use client';
import { useEffect, useState } from 'react';

import Header from '@/components/Header/Header';
import ResultCard from '@/components/ResultCard/ResultCard';
import ExplainResultsIcon from '../../components/Icons/ExplainResultsIcon';

import { Button, Loading } from '@lemonsqueezy/wedges';
import { ClipboardIcon, CheckIcon, PlusIcon } from '@iconicicons/react';
import { Chart } from 'react-google-charts';
import Link from 'next/link';

import {
  NODE_ENDPOINT,
  METHODS,
  SET_METHOD_RESPONSE_DATA,
} from '../store/store';

const Result = () => {
  const nodeEndpoint = NODE_ENDPOINT.use();
  const methods = METHODS.use();

  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [explainIsDisabled, setExplainIsDisabled] = useState(true);

  const downloadJson = () => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(
        methods.map((method) => {
          return {
            method: method.method_used,
            results: method.data,
          };
        })
      )
    )}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = 'data.json';

    link.click();
  };

  useEffect(() => {
    if (methods.every((item) => Object.keys(item.data).length != 0) === true) {
      setChartData([
        ['', ...methods.map((item) => item.method_used)],
        [
          '',
          ...methods.map((item) => {
            if (
              Object.keys(item.data).length != 0 &&
              item.data.hasOwnProperty('error') === false
            ) {
              return +item.data.blocks_per_seconds.toFixed(2);
            } else {
              return 0;
            }
          }),
        ],
      ]);
      setExplainIsDisabled(false);
    }
  }, [methods]);

  return (
    <div className="lg:m-auto lg:max-w-6xl sm:mx-4 mx-4">
      <Header />
      <main className="max-w-lg m-auto">
        <div className="mb-10 px-4 border-gray-800 border-r border-l flex items-center">
          <div className="w-full truncate mr-4 font-mono">{nodeEndpoint}</div>
          <Button
            before={
              copiedToClipboard === true ? (
                <CheckIcon style={{ color: 'rgba(52, 211, 153, 1)' }} />
              ) : (
                <ClipboardIcon />
              )
            }
            variant="transparent"
            onClick={() => {
              navigator.clipboard.writeText(nodeEndpoint);
              setCopiedToClipboard(true);
              setTimeout(() => {
                setCopiedToClipboard(false);
              }, 1000);
            }}
          />
        </div>
        {methods.map((item, index) => {
          return (
            <ResultCard
              key={index}
              endpoint={nodeEndpoint}
              config={item}
              setMethodResponseData={SET_METHOD_RESPONSE_DATA}
            />
          );
        })}

        <div className="custom-bento-card rounded-xl border-2 px-6 py-2">
          {!chartData ? (
            <div
              style={{ width: '100%', height: '200px' }}
              className="flex justify-around items-center"
            >
              <Loading type="spinner" size="xxs" />
            </div>
          ) : (
            <Chart
              chartType="BarChart"
              width="100%"
              data={chartData}
              options={{
                chartArea: { width: '100%' },
                backgroundColor: 'transparent',
                colors: ['#0BB6FF', '#0162F3', '#005C89', '#008960'],
                hAxis: {
                  title: 'Blocks per second',
                  titleTextStyle: { color: '#fff' },
                  minValue: 0,
                  textStyle: { color: '#EEF8FB' },
                  gridlines: {
                    color: '#333645',
                  },
                },
                vAxis: {
                  textStyle: { color: '#ff00d0' },
                },
                legend: {
                  position: 'top',
                  textStyle: { color: '#fff' },
                },
              }}
            />
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 flex-grow my-8 sm:mt-4">
          <Button
            className="w-full sm:w-[calc(50%-8px)]"
            before={<ExplainResultsIcon />}
            variant="tertiary"
            disabled={explainIsDisabled}
            onClick={downloadJson}
          >
            Download JSON
          </Button>
          <Link
            className="w-full sm:w-[calc(50%-8px)]"
            href={{
              pathname: '/',
            }}
          >
            <Button
              className="w-full"
              before={<PlusIcon />}
              variant="tertiary"
              disabled={explainIsDisabled}
            >
              New test
            </Button>
          </Link>
        </div>

        <a
          href="https://docs.chainstack.com/docs/chainstack-compare-rpc-node-performance"
          className="text-blue-500 hover:text-blue-700"
          target="_blank"
          rel="noopener noreferrer"
        >
          <p className="text-center w-full text-s mt-8 font-mono">
            Learn how Chainstack Compare works
            <br /> under the hood and why we built it ↗.
          </p>
        </a>
      </main>
    </div>
  );
};

export default Result;
