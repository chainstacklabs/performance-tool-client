import React from 'react';
import Logo from '@/components/Logo/Logo';
import { Button } from '@lemonsqueezy/wedges';
import GithubIcon from '@/components/Icons/GithubIcon';
import ChainstackIcon from '@/components/Icons/ChainstackIcon';

const Header = () => {
  return (
    <header className="flex justify-between items-center my-5">
      <Logo />
      <div>
        <Button
          variant="transparent"
          before={<GithubIcon width={24} height={24} />}
          className="mr-4"
        >
          Source code
        </Button>
        <Button before={<ChainstackIcon width={24} height={24} />}>
          Start for free
        </Button>
      </div>
    </header>
  );
};

export default Header;
