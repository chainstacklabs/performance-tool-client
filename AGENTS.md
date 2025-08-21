# AGENTS Guidelines for This Repository

This repository contains a Next.js application for blockchain network performance monitoring and analysis. When working on the project interactively with an agent (e.g. the Codex CLI) please follow the guidelines below for efficient development and deployment.

## 1. Use Development Server for Testing

* **Always use `npm run dev`** for local development.
* **Test changes** at http://localhost:3000.
* **Do _not_ deploy to production** during agent development sessions.
* **Monitor console** for Next.js warnings and errors.

## 2. Keep Dependencies in Sync

If you update dependencies:

1. Install packages with `npm install`.
2. Update specific packages with `npm update <package>`.
3. Run `npm audit fix` for security updates.
4. Verify compatibility with Next.js 14 and React 18.

## 3. Development Workflow

Follow the Next.js App Router workflow:

1. **Start dev server**: Run with hot-reload
   ```bash
   npm run dev
   ```

2. **Build production**: Create optimized build
   ```bash
   npm run build
   ```

3. **Run production**: Test production build
   ```bash
   npm start
   ```

4. **Lint code**: Check for issues
   ```bash
   npm run lint
   ```

## 4. Code Quality Checks

Before completing any task, run these checks:

| Command | Purpose |
| ------- | ------- |
| `npm run lint` | ESLint checks |
| `npm run build` | TypeScript compilation |
| `npx tsc --noEmit` | Type checking |
| Browser DevTools | Runtime errors |

## 5. Adding New Methods

To add blockchain RPC methods:

1. Open `src/app/store/store.js`
2. Find the `METHODS` array
3. Add new method object:
   ```javascript
   {
     id: [next_id],
     method_used: 'your_method_name',
     method_url: process.env.NEXT_PUBLIC_BACKEND_APP_PATH_URL + 'your-endpoint',
     perform: true,
     isLoading: true,
     data: {},
   }
   ```
4. Test in development environment

## 6. Environment Configuration

Create `.env.local` file with required variables:

```env
NEXT_PUBLIC_BACKEND_APP_PATH_URL=your_backend_url
# Add other environment variables as needed
```

Never commit `.env.local` to version control.

## 7. Component Development

When modifying components:

* Follow existing structure in `src/components/`.
* Use TypeScript for new components.
* Apply Tailwind CSS classes for styling.
* Keep components modular and reusable.
* Update prop types appropriately.

## 8. Page Structure

Key pages and their purposes:

| Page | Purpose |
| ---- | ------- |
| `/` | Landing page |
| `/compare-single` | Single node testing |
| `/compare-double` | Two nodes comparison |
| `/injection-start` | Test injection start |
| `/injection-result-double` | Injection results comparison |

## 9. State Management

* Global state in `src/app/store/store.js`.
* Uses simpler-state and immer.
* Keep state updates immutable.
* Test state changes thoroughly.

## 10. Styling Guidelines

* Use Tailwind CSS utility classes.
* Follow mobile-first responsive design.
* Maintain consistent spacing and colors.
* Use Wedges UI components where applicable.
* Keep custom CSS minimal.

## 11. Performance Optimization

* Use Next.js Image optimization.
* Implement code splitting.
* Minimize bundle size.
* Use dynamic imports for heavy components.
* Monitor Core Web Vitals.

## 12. Deployment Process

Automatic deployment on Vercel:

1. Create feature branch
2. Make changes and test locally
3. Push to GitHub
4. Create Pull Request
5. Vercel deploys preview
6. Merge triggers production deployment

## 13. Common Development Tasks

### Add New Protocol Icon
1. Add SVG to `src/components/ProtocolIcon/`
2. Import in `ProtocolIcon.js`
3. Add case in component logic
4. Test icon rendering

### Create New Page
1. Add page.js in `src/app/[route]/`
2. Use TypeScript for type safety
3. Follow App Router conventions
4. Update navigation if needed

### Modify Charts
1. Edit React Google Charts config
2. Test with various data sets
3. Ensure responsive design
4. Check performance impact

## 14. Testing Checklist

Before deployment:

- [ ] All pages load without errors
- [ ] TypeScript builds successfully
- [ ] ESLint passes
- [ ] Environment variables configured
- [ ] API endpoints responsive
- [ ] Charts render correctly
- [ ] Mobile responsive
- [ ] No console errors

## 15. Useful Commands Recap

| Command | Purpose |
| ------- | ------- |
| `npm install` | Install dependencies |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Run production server |
| `npm run lint` | Run ESLint |

## 16. Troubleshooting

### Common Issues

**"Module not found"**
- Run `npm install`
- Check import paths
- Clear `.next` folder

**"Type error"**
- Run `npx tsc --noEmit`
- Fix TypeScript issues
- Update type definitions

**"Build failed"**
- Check environment variables
- Verify API endpoints
- Review build logs

**"Hydration error"**
- Check server/client consistency
- Review dynamic content
- Ensure proper data fetching

---

Following these practices ensures smooth Next.js development, maintains code quality, and enables reliable deployment to production. Always test thoroughly in development before merging to trigger automatic Vercel deployment.