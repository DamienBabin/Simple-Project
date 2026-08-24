# Client Scorecard Assessment

An interactive, smart-board-friendly client assessment built with React,
TypeScript, and Vite.

## Why this stack?

- **React** updates scores and progress immediately as answers change.
- **TypeScript** makes assessment records and calculation inputs explicit.
- **Vite** keeps local development fast and the project configuration small.

The first version will store completed meetings in browser local storage. The
storage logic will be kept separate so it can later be replaced by a database.

## Run the project

Use Node.js 22 LTS (the `.nvmrc` file records the recommended version). The
project can build on the currently installed Node 21 runtime, but npm correctly
warns that odd-numbered Node releases are not supported long-term.

```powershell
npm install
npm run dev
```

Open the local address shown in the terminal.

## Verify the project

```powershell
npm run lint
npm run build
```

## Important files

- `src/main.tsx` starts the React application.
- `src/App.tsx` is the current top-level screen.
- `src/App.css` contains styles for the current screen.
- `src/index.css` contains reusable brand colors and global styles.
- `package.json` lists project commands and dependencies.

## Development stages

This project follows the requested staged approach. Step 1 establishes the
project and visual foundation. Step 2 will add the configurable categories and
questions before any scoring interface is implemented.
