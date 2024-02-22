import React from 'react';
import { MDXProvider } from '@mdx-js/react';
import Post from './post.mdx';

const FaqBasic = () => {
  return (
    <div>
      <h2 className="text-5xl font-bold text-accent text-left sm:text-center lg:text-center mt-20 mb-10">
        FAQ
      </h2>
      <div className="max-w-lg m-auto">
        <MDXProvider
          components={{
            h2(props) {
              return (
                <h2 className="text-2xl mt-10 mb-2 font-semibold" {...props} />
              );
            },
            p(props) {
              return <p className="text-m text-gray-400" {...props} />;
            },
          }}
        >
          <Post />
        </MDXProvider>
      </div>
    </div>
  );
};

export default FaqBasic;
