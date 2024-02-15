'use client';
import React, { useEffect, useState, useContext } from 'react';
import { CodeIcon } from '@iconicicons/react';
import { Badge, Loading } from '@lemonsqueezy/wedges';
import { Context } from '../../app/context';

const ResultCard = ({ cardData, endpoint }) => {
  const [responseObject, setResponseObject] = useState(cardData);

  // UI result state
  const [normalResult, setNormalResult] = useState(false);
  const [rateLimitResult, setRateLimitResult] = useState(false);
  const [errorResult, setErrorResult] = useState(false);
  const [fetchErrorResult, setFetchErrorResult] = useState(false);

  // context provider is updated here to use data in charts outside the card on results page
  const [config, setConfig] = useContext(Context);

  const fetchData = async () => {
    const response = await fetch(cardData.method_url, {
      body: JSON.stringify({ rpc_url: endpoint }),
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!response.ok) {
      return response.text().then((text) => {
        throw new Error(text);
      });
    }

    const body = await response.json();
    return body;
  };

  useEffect(() => {
    Object.keys(responseObject.data).length === 0 &&
      fetchData()
        .then((res) => {
          console.log(res);
          setResponseObject((prev) => {
            return {
              ...prev,
              isLoading: false,
              data: res,
            };
          });
          setConfig(() => {
            let updated = config;
            updated.methods[responseObject.id] = responseObject;
            return updated;
          });
          // setConfig((prev) => {
          //   let upd = prev;
          //   upd.methods[responseObject.id] = {
          //     ...prev,
          //     isLoading: false,
          //     data: res,
          //   };
          //   return upd;
          // });
        })
        .catch((error) => {
          setResponseObject((prev) => {
            return {
              ...prev,
              isLoading: false,
            };
          });
          setFetchErrorResult(error.message);
        });
  }, []);

  useEffect(() => {
    // no errors
    if (
      Object.keys(responseObject.data).length != 0 &&
      responseObject.data.hasOwnProperty('error') === false &&
      responseObject.data.target_blocks ===
        responseObject.data.blocks_processed_successfully
    ) {
      // Blocks processed = Target blocks
      setNormalResult(true);
    }

    // method error
    // if (
    //   Object.keys(results.data).length != 0 &&
    //   results.data.hasOwnProperty('error') === true
    // ) {
    //   setErrorResult(true);
    // }
  }, [responseObject]);

  // useEffect(() => {
  //   if (
  //     Object.keys(responseObject.data).length != 0 &&
  //     responseObject.data.hasOwnProperty('error') === false
  //   ) {
  //     setConfig((prev) => {
  //       let upd = prev;
  //       upd.methods[responseObject.id] = {
  //         ...responseObject,
  //       };
  //       return upd;
  //     });
  //   }
  // }, [responseObject]);

  return (
    <div className="custom-bento-card rounded-xl border-2 p-6 mb-4">
      <div className="flex justify-between items-center mb-6">
        <Badge before={<CodeIcon />} color="blue" stroke>
          {responseObject.method_used}
        </Badge>
        {responseObject.isLoading === true && (
          <Loading type="spinner" size="xxs" />
        )}
      </div>
      {normalResult && (
        <div className="grid grid-cols-3">
          <div>
            <div className="text-xl font-bold mb-1">
              {responseObject.data.blocks_processed_successfully}/
              {responseObject.data.target_blocks}
            </div>
            <p className="text-xs">Blocks</p>
          </div>
          <div>
            <div className="text-xl font-bold mb-1">
              {responseObject.data.time_taken_in_seconds.toFixed(2)} s
            </div>
            <p className="text-xs">Time taken</p>
          </div>
          <div>
            <div className="text-xl font-bold mb-1">
              {responseObject.data.blocks_per_seconds.toFixed(2)}
            </div>
            <p className="text-xs">Blocks per second</p>
          </div>
        </div>
      )}
      {errorResult && (
        <div className="text-xs text-yellow-500 font-mono">
          {results.data.error}
        </div>
      )}
      {fetchErrorResult !== false && (
        <div className="text-xs text-red-500 font-mono">{fetchErrorResult}</div>
      )}
    </div>
  );
};

export default ResultCard;
