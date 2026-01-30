# Template

A modern webpack project template with ESLint, Prettier, and date-fns pre-configured.

## Setup

1. Clone this repo or use it as a template
2. Run `npm install` to install all dependencies
3. Start developing!

## Available Scripts

- **`npm dev`** — Start the dev server (runs on http://localhost:8080)
- **`npm run build`** — Build for production
- **`npm run lint`** — Check for linting issues
- **`npm run lint:fix`** — Auto-fix linting issues
- **`npm run format`** — Format code with Prettier
- **`npm run format:check`** — Check if code is formatted correctly
- **`npm run deploy`** — Build and deploy to GitHub Pages (requires gh-pages setup)

## Using date-fns

Date-fns is already installed as a dependency. You can import and use it like this:

```javascript
import { format, addDays } from "date-fns";

const today = new Date();
const tomorrow = addDays(today, 1);

console.log(format(today, "yyyy-MM-dd")); // 2024-01-27
console.log(format(tomorrow, "yyyy-MM-dd")); // 2024-01-28
```

## Project Structure

```
src/
  index.js         — Entry point
  index.html       — HTML template
  style.css        — Global styles
dist/              — Built files (generated)
node_modules/      — Dependencies
package.json       — Project config
webpack.config.js  — Webpack config
eslint.config.mjs  — ESLint config
.prettierrc         — Prettier config
```

## Tools Included

- **Webpack** — Module bundler
- **Webpack Dev Server** — Development server with hot reload
- **ESLint** — Code quality linter
- **Prettier** — Code formatter
- **HTML Webpack Plugin** — Auto-injects JS into HTML
- **date-fns** — Modern date utility library
- **gh-pages** — Deploy to GitHub Pages

## Tips

- VS Code: Install the Prettier extension for automatic formatting on save
- The ESLint and Prettier configs are already set up to work together
- All config files have sensible defaults but can be customized as needed
