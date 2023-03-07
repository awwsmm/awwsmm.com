# awwsmm.com

These are my development notes for this website.

They include instructions on how to build the project, run tests, and so on.

## Installing

Clone the repository with

```sh
$ git clone git@github.com:awwsmm/awwsmm.com.git
```

If not already installed, get `npm` [using Homebrew](https://formulae.brew.sh/formula/node)

```sh
$ if ! command -v npm &> /dev/null; then; brew install node; fi
```

Move to the `awwsmm.com.git/` project root directory and install all the dependencies listed in `package.json` with

```sh
$ npm install
```

Set up the git hooks in `git-hooks/` by running

```sh
$ npm run hook
```

## Running in Development Mode

Check out the available `"scripts"` in `package.json`:

```json
  "scripts": {
    "build": "next build",
    "deplock": "rm package-lock.json && rm -rf node_modules && npm install",
    "dev": "next dev",
    "hook": "npm run unhook && find git-hooks -maxdepth 1 -type f -exec chmod +x {} \\; -exec ln -sf $(pwd)/{} .git/hooks \\;",
    "lint": "eslint . --ext .ts --ext .tsx",
    "lint-and-fix": "eslint . --ext .ts --ext .tsx --fix",
    "sandbox": "env TS_NODE_COMPILER_OPTIONS='{\"module\": \"commonjs\" }' mocha -r ts-node/register 'sandbox.ts'",
    "tests": "env TS_NODE_COMPILER_OPTIONS='{\"module\": \"commonjs\" }' mocha -r ts-node/register 'tests/**/*.ts'",
    "unhook": "find .git/hooks -type l -exec unlink {} \\;"
  },
```

Run the website locally by moving to the `development` git branch and running `npm run dev` (runs the `dev` script above).

```sh
$ git switch development
$ npm run dev
```

## Updating Dependencies

```sh
$ npm run deplock
```