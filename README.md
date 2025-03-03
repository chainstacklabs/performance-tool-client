# Performance Tool Client

A modern web application for monitoring and analyzing blockchain network performance metrics.

## Overview

This tool provides real-time performance monitoring and analysis capabilities for blockchain networks, built with Next.js, TypeScript, and Tailwind CSS.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Modern web browser

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/your-username/performance-tool-client.git
cd performance-tool-client
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

## Commands

Run the development server on localhost:

```bash
npm run dev
# or
yarn dev
```

Build the application:

```bash
npm run build
# or
yarn build
```

More about [deploying options](https://nextjs.org/docs/app/building-your-application/deploying)

## How to Add New Method

Navigate to `src/app/store/store.js` and find the `METHODS` array:

```javascript
export const METHODS = entity([
  {
    id: 0,
    method_used: 'eth_getBlockByNumber',
    method_url: process.env.NEXT_PUBLIC_BACKEND_APP_PATH_URL + 'test-get-block',
    perform: true,
    isLoading: true,
    data: {},
  },
  {
    id: 1,
    method_used: 'eth_call',
    method_url: process.env.NEXT_PUBLIC_BACKEND_APP_PATH_URL + 'test-eth-call',
    perform: true,
    isLoading: true,
    data: {},
  },
]);
```

To add a new method:

1. Add a new object at the end of the array
2. Increment the `id` field value
3. Set `method_used` for the card label shown in results UI
4. Update `method_url` with the new path
5. Keep other fields unchanged

## Project Structure

```
├── src/
│   ├── app/          # Next.js App Router components
│   ├── components/   # Reusable React components
│   ├── lib/         # Utility functions and helpers
│   └── types/       # TypeScript type definitions
├── public/          # Static assets
└── config/          # Configuration files
```

## Core Technologies

- [Next.js](https://nextjs.org/) - React Framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [ESLint](https://eslint.org/) - Code linting
- [Jest](https://jestjs.io/) - Testing framework

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Code Quality

- Follows best practices for React and Next.js
- Implements maintainable and scalable code structure
- Includes comprehensive documentation
- Uses TypeScript for type safety
- Adheres to ESLint configuration
