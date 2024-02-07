'use client';

import { useState, useEffect, useContext } from 'react';
import Provider, { Context } from '../context';
import { CodeIcon } from '@iconicicons/react';
import { Badge, Loading } from '@lemonsqueezy/wedges';

import Header from '@/components/Header/Header';

const result = () => {
  const [config, setConfig] = useContext(Context);

  const configMethodNamesArray = Object.keys(config.methods);

  const [results, setResults] = useState(
    configMethodNamesArray.map((item, index) => {
      return {
        id: index,
        name: item,
        isLoading: true,
        data: {},
      };
    })
  );

  // console.log(results);

  const methodNameToUrl = (method) => {
    let namesMap = {
      eth_getBlockByNumber: 'test-get-block',
      eth_call: 'test-eth-call',
      debug: 'test-debug',
    };
    return namesMap[method];
  };

  async function fetchData() {
    let promises = configMethodNamesArray.map(async (methodName, index) =>
      fetch(
        // process.env.NEXT_PUBLIC_BACKEND_APP_URL +
        'https://plankton-app-xm39h.ondigitalocean.app/' +
          methodNameToUrl(methodName),
        {
          body: JSON.stringify({ rpc_url: config.endpoints[0] }),
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'POST',
        }
      )
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          setResults((prev) => {
            let updated = prev;
            updated[index] = {
              ...updated[index],
              data: data,
              isLoading: false,
            };

            return updated;
          });
        })
        .catch((error) => console.log(error))
    );
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log(results);
  }, [results]);

  return (
    <div className="m-auto max-w-6xl">
      <Header />
      <main className="max-w-lg m-auto">
        <div>{config.endpoints[0]}</div>

        {results.map((method, index) => {
          return (
            <div
              key={index}
              className="custom-bento-card rounded-xl border-2 p-6"
            >
              <div>
                <Badge before={<CodeIcon />} color="blue" stroke>
                  {method.name}
                </Badge>
                {method.isLoading ? <Loading type="spinner" size="xs" /> : 'v'}
              </div>
              <div>{JSON.stringify(method.data)}</div>
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default result;
