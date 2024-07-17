'use client';
import { useEffect, useState } from 'react';

import Header from '@/components/Header/Header';
import ResultCard from '@/components/ResultCard/ResultCard';
import ExplainResultsIcon from '../../components/Icons/ExplainResultsIcon';

import { CodeIcon } from '@iconicicons/react';
import { Button, Loading, Badge } from '@lemonsqueezy/wedges';
import { ClipboardIcon, CheckIcon, PlusIcon } from '@iconicicons/react';
import { Chart } from 'react-google-charts';
import Link from 'next/link';

import {
  NODE_ENDPOINT,
  NODE_ENDPOINT_2,
  METHODS,
  METHODS_2,
  SET_METHOD_RESPONSE_DATA,
  SET_METHOD_RESPONSE_DATA_2,
  GET_METHODS_NAMES,
} from '../store/store';

const Result = () => {
  const nodeEndpoint = NODE_ENDPOINT.use();
  const nodeEndpoint2 = NODE_ENDPOINT_2.use();
  const methods = METHODS.use();
  const methods2 = METHODS_2.use();
  const methodsNames = GET_METHODS_NAMES.use();

  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [copiedToClipboard2, setCopiedToClipboard2] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [chartData2, setChartData2] = useState(null);
  const [explainIsDisabled, setExplainIsDisabled] = useState(false);

  const downloadJson = () => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify([
        {
          endpoint: nodeEndpoint,
          results: methods.map((method) => {
            return {
              method: method.method_used,
              results: method.data,
            };
          }),
        },
        {
          endpoint: nodeEndpoint2,
          results: methods2.map((method) => {
            return {
              method: method.method_used,
              results: method.data,
            };
          }),
        },
      ])
    )}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = 'data.json';

    link.click();
  };

  useEffect(() => {
    if (
      methods.every((item) => Object.keys(item.data).length != 0) === true &&
      methods2.every((item) => Object.keys(item.data).length != 0) === true
    ) {
      let chart = [methods[1], methods2[1]];
      let chart2 = [methods[0], methods2[0]];

      setChartData([
        [
          '',
          ...chart.map((item, index) => {
            return `Endpoint ${index + 1}`;
          }),
        ],
        [
          '',
          ...chart.map((item) => {
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

      setChartData2([
        [
          '',
          ...chart2.map((item, index) => {
            return `Endpoint ${index + 1}`;
          }),
        ],
        [
          '',
          ...chart2.map((item) => {
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
    }
  }, [methods, methods2]);

  let grid = 'grid grid-cols-2 gap-10';

  return (
    <div className="lg:m-auto lg:max-w-6xl ">
      {/* URLS */}
      <div className={grid + ' mt-8'}>
        {[
          {
            endpoint: nodeEndpoint,
            copied: copiedToClipboard,
            clip(value) {
              setCopiedToClipboard(value);
            },
          },
          {
            endpoint: nodeEndpoint2,
            copied: copiedToClipboard2,
            clip(value) {
              setCopiedToClipboard2(value);
            },
          },
        ].map((item, index) => {
          return (
            <div
              key={index}
              className="mb-4 px-4 border-gray-800 border-r border-l flex items-center"
            >
              <div className="mr-2 font-mono">[{index + 1}]</div>
              <div className="w-full truncate mr-4 font-mono">
                {item.endpoint}
              </div>
              <Button
                before={
                  item.copied === true ? (
                    <CheckIcon style={{ color: 'rgba(52, 211, 153, 1)' }} />
                  ) : (
                    <ClipboardIcon />
                  )
                }
                variant="transparent"
                onClick={() => {
                  navigator.clipboard.writeText(item.endpoint);
                  item.clip(true);
                  setTimeout(() => {
                    item.clip(false);
                  }, 1000);
                }}
              />
            </div>
          );
        })}
      </div>
      {/* URLS */}

      {/* eth_getBlockByNumber */}
      <div className={grid}>
        {[
          {
            config: methods[0],
            endpoint: nodeEndpoint,
            setResponse: SET_METHOD_RESPONSE_DATA,
          },
          {
            config: methods2[0],
            endpoint: nodeEndpoint2,
            setResponse: SET_METHOD_RESPONSE_DATA_2,
          },
        ].map((item, index) => {
          return (
            <ResultCard
              key={index}
              endpoint={item.endpoint}
              config={item.config}
              setMethodResponseData={item.setResponse}
            />
          );
        })}
      </div>
      {/* eth_getBlockByNumber */}

      {/* eth_call */}
      <div className={grid}>
        {[
          {
            config: { ...methods[1] },
            endpoint: nodeEndpoint,
            setResponse: SET_METHOD_RESPONSE_DATA,
          },
          {
            config: { ...methods2[1] },
            endpoint: nodeEndpoint2,
            setResponse: SET_METHOD_RESPONSE_DATA_2,
          },
        ].map((item, index) => {
          return (
            <ResultCard
              key={index}
              endpoint={item.endpoint}
              config={item.config}
              setMethodResponseData={item.setResponse}
            />
          );
        })}
      </div>
      {/* eth_call */}

      <main className="m-auto mt-8">
        <h2 className="text-5xl font-bold text-accent text-left mt-20 mb-10">
          Compare results
        </h2>

        <div className="custom-bento-card rounded-xl border-2 px-6 py-2 mt-4">
          <div className="flex flex-row my-4 items-center">
            <Badge before={<CodeIcon />} color="blue" stroke className="">
              {methodsNames[1]}
            </Badge>
            <div className="text-sm ml-4">Blocks per second</div>
          </div>
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
                colors: ['#0162F3', '#74ACFF', '#6100AE', '#D29AFF'],

                hAxis: {
                  // title: 'Blocks per second',
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
        <div className="custom-bento-card rounded-xl border-2 px-6 py-2 mt-4">
          <div className="flex flex-row my-4 items-center">
            <Badge before={<CodeIcon />} color="blue" stroke className="">
              {methodsNames[0]}
            </Badge>
            <div className="text-sm ml-4">Blocks per second</div>
          </div>
          {!chartData2 ? (
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
              data={chartData2}
              options={{
                chartArea: { width: '100%' },
                backgroundColor: 'transparent',
                colors: ['#0162F3', '#74ACFF', '#6100AE', '#D29AFF'],
                // colors: ['#6100AE', '#D29AFF'],

                hAxis: {
                  // title: 'Blocks per second',
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
