'use client';
import { useContext, useEffect, useState } from 'react';

import Header from '@/components/Header/Header';
import ResultCard from '@/components/ResultCard/ResultCard';
import ExplainResultsIcon from '../../components/Icons/ExplainResultsIcon';

import { Button, Loading } from '@lemonsqueezy/wedges';
import { ClipboardIcon, CheckIcon, PlusIcon } from '@iconicicons/react';
import { Chart } from 'react-google-charts';

import { NODE_ENDPOINT, METHODS } from '../store/store';

const result = () => {
  const nodeEndpoint = NODE_ENDPOINT.use();
  const methods = METHODS.use();

  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    console.log('methods', methods);
    console.log(
      'check',
      methods.every((item) => Object.keys(item.data).length != 0) === true
    );
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
            }
            // if (item.data.hasOwnProperty('error') === true) {
            //   return 0;
            // }
            else {
              return 0;
            }
          }),
        ],
      ]);
    }
  }, [methods]);

  return (
    <div className="m-auto max-w-6xl">
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
            <ResultCard key={index} endpoint={nodeEndpoint} config={item} />
          );
        })}
        <div className="flex gap-4 flex-grow mb-4">
          <Button
            style={{ width: 'calc(50% - 8px)' }}
            before={<ExplainResultsIcon />}
            variant="tertiary"
          >
            Explain results
          </Button>
          <Button
            style={{ width: 'calc(50% - 8px)' }}
            before={<PlusIcon />}
            variant="tertiary"
          >
            New test
          </Button>
        </div>
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
      </main>
    </div>
  );
};

export default result;
