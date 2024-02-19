## Commands

Run the development server on localhost:

```bash
npm run dev
```

Build app:

```bash
npm run build
```

More bout [deploying options](https://nextjs.org/docs/app/building-your-application/deploying)

## How to add new method

Go to `src/app/store/store.js`, find `METHODS` array.

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

Add new object at the end of array.

- Don't forget to increment `id` field's value.
- `method_used` field is for cards label, shown in results UI
- update `method_url` with new path
- leave rest fileds with no updates
