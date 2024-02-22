import React from 'react';

import GithubIcon from '@/components/Icons/GithubIcon';
import BarChartIcon from '@/components/Icons/BarChartIcon';
import Customization from '@/components/Icons/Customization';
import Profiling from '@/components/Icons/Profiling';

import Image from 'next/image';

import { Badge } from '@lemonsqueezy/wedges';

const Bento = () => {
  const bentoConfig = [
    {
      badge: {
        color: 'blue',
        stroke: false,
        text: 'Data',
        icon: <BarChartIcon width={16} height={16} />,
      },
      heading: 'Sensible Metrics',
      copy: 'Say goodbye to random latency numbers.\nChainstack Compare measures how your node performs based on real data-fetching.',
      image: {
        url: '/bento-[0].png',
        size: [360, 233],
        alt: '',
        style: 'mt-8 hidden lg:block absolute lg:-right-2 lg:-bottom-10',
      },
    },
    {
      badge: {
        color: 'green',
        stroke: false,
        text: 'Multiple modes',
        icon: <Customization width={16} height={16} />,
      },
      heading: 'Versatile Testing Options',
      copy: 'From single endpoint to comparisons across multiple endpoints, get a wide range of testing needs.',
    },
    {
      badge: {
        color: '',
        stroke: false,
        text: 'Github',
        icon: <GithubIcon width={16} height={16} />,
      },
      heading: 'Embracing Open Source',
      copy: 'We believe in giving back to the community. Our tool will be open source, accessible to all.',
    },
    {
      badge: {
        color: 'pink',
        stroke: false,
        text: 'Realistic profiles',
        icon: <Profiling width={16} height={16} />,
      },
      heading: "Profiling at it's Best",
      copy: 'Profiles based on the most common blockchain data-fetching methods.',
      image: {
        url: '/bento-[3].png',
        size: [463, 242],
        alt: '',
        style: 'mt-8 hidden lg:block absolute -right-20 -bottom-14',
      },
    },
  ];

  return (
    <div className="">
      <h2 className="text-5xl font-bold text-accent text-left sm:text-center lg:text-center mt-20 mb-10">
        Performance
      </h2>
      <div className="grid lg:auto-rows-[235px] sm:auto-rows-auto lg:grid-cols-3 sm:grid-cols-1 gap-8">
        {bentoConfig.map((item, i) => (
          <div
            key={i}
            className={`custom-bento-card row-span-1 rounded-xl border-2 px-6 py-6 sm:px-8 lg:px-8 sm:py-10 overflow-hidden ${
              i === 0 || i === 3 ? 'col-span-1 lg:col-span-2' : ''
            }`}
          >
            <Badge
              before={item.badge.icon}
              color={item.badge.color}
              stroke={item.badge.stroke}
            >
              {item.badge.text}
            </Badge>
            <h2 className="text-xl mt-5 font-semibold">{item.heading}</h2>
            <p
              className={
                item.hasOwnProperty('image')
                  ? 'lg:w-2/4 sm:w-full text-base mt-2 text-gray-400'
                  : 'text-base mt-2 text-gray-400'
              }
            >
              {item.copy}
            </p>
            {item.hasOwnProperty('image') && (
              <Image
                src={item.image.url}
                width={item.image.size[0]}
                height={item.image.size[1]}
                alt={item.image.alt}
                className={item.image.style}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bento;
