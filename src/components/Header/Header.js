import React from 'react';
import Logo from '@/components/Logo/Logo';
import { Button } from '@lemonsqueezy/wedges';
import GithubIcon from '@/components/Icons/GithubIcon';
import ChainstackIcon from '@/components/Icons/ChainstackIcon';
import GrafanaIcon from '@/components/Icons/GrafanaIcon';

const Header = () => {
  return (
    <header className="flex flex-col items-start sm:flex-row justify-between sm:items-center my-5">
      <Logo />
      <div className="flex mt-4 sm:mt-0 lg:mt-0">
        {/*
        <a
          href="https://github.com/chainstacklabs"
          target="_blank"
          className="sm:block lg:block hidden"
        >
          <Button
            variant="transparent"
            before={<GithubIcon width={24} height={24} />}
            className="mr-4"
          >
            Source code
          </Button>
        </a>
*/}
        <a href="/dashboard" target="_blank" className="sm:block lg:block hidden">
          <Button variant="transparent" before={<GrafanaIcon width={24} height={24} />} className="mr-4">
            Dashboard
          </Button>
        </a>
        <a href="https://chainstack.com/" target="_blank">
          <Button before={<ChainstackIcon width={24} height={24} />}>
            Start for free
          </Button>
        </a>
      </div>
    </header>
  );
};

export default Header;
