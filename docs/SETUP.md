# 🛠️ TabNova - Development Setup

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+
- **Git**
- **Chrome/Edge browser** (for testing)
- **Visual Studio Code** (optional but recommended)

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/ygle/TabNova.git
cd TabNova
```

### 2. Install dependencies
```bash
npm install
```

### 3. Verify installation
```bash
npm run type-check
```

## Development

### Start development server
```bash
npm run dev
```

This will:
- Build the extension in watch mode
- Serve assets on http://localhost:5173

### Load extension in Chrome/Edge

1. Open Chrome/Edge DevTools: `chrome://extensions/` or `edge://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select `./dist` folder (or wherever Vite outputs)
5. Extension should appear in your list
6. Pin it to toolbar for easy access

## Building

### Build extension (production)
```bash
npm run build:extension
```

Output: `dist/` folder with optimized extension

### Build backend (optional)
```bash
npm run build:backend
```

## Testing

### Run all tests
```bash
npm run test
```

### Run tests in watch mode
```bash
npm run test
```

### Watch mode with UI
```bash
npm run test:ui
```

### Coverage report
```bash
npm run test:coverage
```

Target: 70-80% coverage

## Linting & Formatting

### Lint code
```bash
npm run lint
```

### Fix linting issues
```bash
npm run lint:fix
```

### Format code
```bash
npm run format
```

### Type checking
```bash
npm run type-check
```

## Project Structure

```
extension/src/
├── background/          Service Worker (background.ts)
├── popup/              Popup UI entry (index.tsx)
├── dashboard/          Dashboard UI entry (index.tsx)
├── components/         Reusable React components
├── hooks/              Custom React hooks
├── store/              Zustand state stores
├── services/           Business logic services
├── storage/            IndexedDB operations
├── types/              TypeScript interfaces
├── utils/              Helper utilities
└── App.tsx             Root component
```

## File Naming Conventions

```
Components:            PascalCase.tsx      (e.g., BubbleCluster.tsx)
Hooks:                 camelCase.ts        (e.g., useTabGroups.ts)
Services:              camelCase.ts        (e.g., groupService.ts)
Stores:                camelCase.ts        (e.g., groupStore.ts)
Types:                 PascalCase.ts       (e.g., TabGroup.ts)
Utils:                 camelCase.ts        (e.g., formatters.ts)
Tests:                 *.test.ts           (colocated with source)
```

## Debugging

### Browser DevTools
- Right-click on popup → "Inspect popup"
- For Service Worker: DevTools → Extensions → "Service Workers" → Inspect

### Chrome DevTools for Extension
- `chrome://extensions/` → Your extension → "Details" → "Errors"
- Use `console.log()` in background.ts (viewable in DevTools)

### VS Code Debugging
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "test"],
      "console": "integratedTerminal"
    }
  ]
}
```

## Environment Variables

Create `.env.local`:
```
VITE_APP_NAME=TabNova
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-client-id
```

## Git Workflow

### Branch naming
```
feature/feature-name
fix/bug-description
docs/documentation-update
refactor/refactor-description
test/test-name
```

### Commit messages
```
feat: Add bubble cluster visualization
fix: Resolve IndexedDB transaction issue
docs: Update architecture guide
style: Format code with prettier
test: Add tests for groupService
refactor: Simplify messageHandler logic
```

### Pull Request
1. Create feature branch
2. Make commits with clear messages
3. Push and create PR
4. Ensure CI passes (tests, lint)
5. Code review
6. Merge to main

## CI/CD

GitHub Actions workflows in `.github/workflows/`:

- `test.yml` - Runs tests on PR
- `build.yml` - Builds extension on push to main
- `deploy.yml` - Deploys to Chrome Web Store

## Troubleshooting

### Extension not updating
- Reload extension in `chrome://extensions/`
- Clear IndexedDB: F12 → Application → IndexedDB → Delete

### Module not found errors
- Check `tsconfig.json` path aliases match your file
- Clear node_modules: `rm -rf node_modules && npm install`

### Tests failing
- Ensure no tests are skipped: `test.skip()` → `test()`
- Check mock data is correctly set up
- Run with `--reporter=verbose` for details

### Vite caching issues
- Delete `.vite/` folder
- Restart dev server

## Resources

- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [React Documentation](https://react.dev)
- [D3.js Documentation](https://d3js.org)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Vite Documentation](https://vitejs.dev)

---

**Last Updated**: 2025-04-09
