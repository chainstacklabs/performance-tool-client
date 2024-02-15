'use client';
import React, { useEffect, useState, useContext } from 'react';
import { CodeIcon } from '@iconicicons/react';
import { Badge, Loading } from '@lemonsqueezy/wedges';

import {
  NODE_ENDPOINT,
  METHODS,
  SET_METHOD_RESPONSE_DATA,
} from '../../app/store/store';

const ResultCard = ({ config, endpoint }) => {
  const [cardData, setCardData] = useState(config);
  // const methods = METHODS.use();
  // const nodeEndpoint = NODE_ENDPOINT.use();
  // UI result state

  const [normalResult, setNormalResult] = useState(false);
  const [rateLimitResult, setRateLimitResult] = useState(false);
  // const [errorResult, setErrorResult] = useState(false);
  const [fetchErrorResult, setFetchErrorResult] = useState(false);

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
      // return response.json();
      console.log(response);
      // return response.json().then((res) => {
      throw new Error(
        'Fetch failed. ' + response.status + ' ' + response.statusText
      );
      // });
    }
    const body = await response.json();
    return body;
  };

  useEffect(() => {
    Object.keys(cardData.data).length === 0 &&
      fetchData()
        .then((res) => {
          console.log(res);
          setCardData((prev) => {
            return {
              ...prev,
              isLoading: false,
              data: res,
            };
          });
          SET_METHOD_RESPONSE_DATA(cardData.id, res);
        })
        .catch((error) => {
          setCardData((prev) => {
            return {
              ...prev,
              isLoading: false,
              data: { error: error.message },
            };
          });
          SET_METHOD_RESPONSE_DATA(cardData.id, {
            error: error.message,
          });
        });
  }, []);

  useEffect(() => {
    // no errors
    if (
      Object.keys(cardData.data).length != 0 &&
      cardData.data.hasOwnProperty('error') === false
    ) {
      setNormalResult(true);
    }

    if (
      cardData.data.target_blocks !==
      cardData.data.blocks_processed_successfully
    ) {
      setRateLimitResult(true);
    }

    if (cardData.data.hasOwnProperty('error') === true) {
      setFetchErrorResult(cardData.data.error);
    }
  }, [cardData]);

  return (
    <div className="custom-bento-card rounded-xl border-2 p-6 mb-4">
      <div className="flex justify-between items-center mb-6">
        <Badge before={<CodeIcon />} color="blue" stroke>
          {cardData.method_used}
        </Badge>
        {cardData.isLoading === true && <Loading type="spinner" size="xxs" />}
      </div>

      {normalResult && (
        <div className="grid grid-cols-3">
          <div>
            <div
              className={
                rateLimitResult
                  ? 'text-xl font-bold mb-1 text-yellow-500 '
                  : 'text-xl font-bold mb-1'
              }
            >
              {cardData.data.blocks_processed_successfully}/
              {cardData.data.target_blocks}
            </div>
            <p className="text-xs">Blocks</p>
          </div>
          <div>
            <div className="text-xl font-bold mb-1">
              {cardData.data.time_taken_in_seconds.toFixed(2)} s
            </div>
            <p className="text-xs">Time taken</p>
          </div>
          <div>
            <div className="text-xl font-bold mb-1">
              {cardData.data.blocks_per_seconds.toFixed(2)}
            </div>
            <p className="text-xs">Blocks per second</p>
          </div>
        </div>
      )}

      {rateLimitResult && (
        <div className="text-xs text-yellow-500 font-mono mt-6">
          Rate limit exceeded. Failure rate{' '}
          {(
            (cardData.data.blocks_processed_successfully /
              cardData.data.target_blocks) *
            100
          ).toFixed(2)}
          %.
        </div>
      )}

      {fetchErrorResult !== false && (
        <div className="text-xs text-red-500 font-mono mt-6">
          {fetchErrorResult}
        </div>
      )}
    </div>
  );
};

export default ResultCard;
