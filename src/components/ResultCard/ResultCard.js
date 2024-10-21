'use client';
import React, { useEffect, useState } from 'react';
import { CodeIcon } from '@iconicicons/react';
import { Badge, Loading, Tooltip } from '@lemonsqueezy/wedges';

import {
  SET_METHOD_RESPONSE_DATA,
  SET_METHOD_RESPONSE_DATA_2,
} from '../../app/store/store';

const ResultCard = ({ config, endpoint, setMethodResponseData }) => {
  const [cardData, setCardData] = useState(config);

  const [normalResult, setNormalResult] = useState(false);
  const [rateLimitResult, setRateLimitResult] = useState(false);
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
      throw new Error(
        'Fetch failed. ' + response.status + ' ' + response.statusText
      );
    }
    const body = await response.json();
    return body;
  };

  useEffect(() => {
    if (endpoint === '' || config.data.length === 0) {
      window.location.replace('/');
    } else {
      Object.keys(cardData.data).length === 0 &&
        fetchData()
          .then((res) => {
            setCardData((prev) => {
              return {
                ...prev,
                isLoading: false,
                data: res,
              };
            });
            setMethodResponseData(cardData.id, res);
          })
          .catch((error) => {
            setCardData((prev) => {
              return {
                ...prev,
                isLoading: false,
                data: { error: error.message },
              };
            });
            setMethodResponseData(cardData.id, {
              error: error.message,
            });
          });
    }
  }, []);

  useEffect(() => {
    // no errors
    if (
      Object.keys(cardData.data).length != 0 &&
      cardData.data.hasOwnProperty('error') === false
    ) {
      setNormalResult(true);
    }

    // show rate limit warning
    if (
      cardData.data.target_blocks !==
      cardData.data.blocks_processed_successfully
    ) {
      setRateLimitResult(true);
    }

    // fetch error
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
                  ? 'text-xl font-bold text-yellow-500 '
                  : 'text-xl font-bold'
              }
            >
              {cardData.data.blocks_processed_successfully}/
              {cardData.data.target_blocks}
            </div>

            <div className="flex items-center">
              <p className="text-xs leading-6 mr-1">Blocks</p>
              <Tooltip
                align="center"
                animation={true}
                content="Blocks processed / Target blocks"
                delayDuration={0}
                side="right"
              />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold">
              {cardData.data.time_taken_in_seconds.toFixed(2)} s
            </div>
            <p className="text-xs leading-6">Time taken</p>
          </div>
          <div>
            <div className="text-xl font-bold">
              {cardData.data.blocks_per_seconds.toFixed(2)}
            </div>
            <p className="text-xs leading-6">Blocks per second</p>
          </div>
        </div>
      )}

      {rateLimitResult && (
        <div className="text-xs text-yellow-500 font-mono mt-6">
          Rate limit exceeded. Success rate{' '}
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
