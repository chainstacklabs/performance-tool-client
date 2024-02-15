'use client';
import { useContext, useEffect, useState } from 'react';
import { Context } from '../context';

import Header from '@/components/Header/Header';
import ResultCard from '@/components/ResultCard/ResultCard';

import { Button } from '@lemonsqueezy/wedges';
import { ClipboardIcon, CheckIcon, PlusIcon } from '@iconicicons/react';

import ExplainResultsIcon from '../../components/Icons/ExplainResultsIcon';

import { Chart } from 'react-google-charts';

const result = () => {
  const [config, setConfig] = useContext(Context);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const [chartData, setChartData] = useState([]);

  // const configMethodNamesArray = Object.keys(config.methods);

  useEffect(() => {
    console.log('config', config);
    
    setChartData([
      ['', ...config.methods.map((item) => item.method_used)],
      [
        '',
        ...config.methods.map((item) => {
          if (Object.keys(item.data).length != 0) {
            return item.time_taken_in_seconds;
          } else {
            return 0;
          }
        }),
      ],
    ]);
  }, [config]);

  return (
    <div className="m-auto max-w-6xl">
      <Header />
      <main className="max-w-lg m-auto">
        <div className="mb-10 px-4 border-gray-800 border-r border-l flex items-center">
          <div className="w-full truncate mr-4 font-mono">
            {config.endpoints[0]}
          </div>
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
              navigator.clipboard.writeText(config.endpoints[0]);
              setCopiedToClipboard(true);
              setTimeout(() => {
                setCopiedToClipboard(false);
              }, 1000);
            }}
          />
        </div>
        {config.methods.map((item, index) => {
          return (
            <ResultCard
              key={index}
              endpoint={config.endpoints[0]}
              cardData={item}
            />
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
          <Chart
            chartType="BarChart"
            width="100%"
            // height="400px"
            data={chartData}
            options={{
              chartArea: { width: '100%' },
              backgroundColor: 'transparent',
              colors: ['#0BB6FF', '#0162F3', '#005C89', '#008960'],
              hAxis: {
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
        </div>
      </main>
    </div>
  );
};

export default result;
