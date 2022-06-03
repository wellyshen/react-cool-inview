# Contributing to REACT COOL INVIEW

When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change.

Please note we have a [code of conduct](CODE_OF_CONDUCT.md), please follow it in all your interactions with the project.

> Working on your first Pull Request? You can learn how from [this free video series](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github).

## Pull Request Process

1. Fork the repository and create your branch from `master`.
2. Run `yarn` to install dependencies.
3. If you’ve fixed a bug or added code that should be tested.
4. Ensure the test suite passes by running `yarn test`.
5. Update the [README.md](README.md) with details of changes to the interface.
6. Update the [demo app](app/src) if needed.
7. Make sure your code lints by running `yarn lint`.

## Development Workflow

You can test new features or debug an issue by the way that I'm using.

1. Run `yarn link-pkg` to link the package into the [app directory](app).
2. Run `yarn start` to create an `ESM` build and type definition file by `rollup` watch mode.
3. Access the [app directory](app).
4. In the **app directory**, run `yarn link-pkg` to link with the package then run `yarn start` to start development.
5. Try something cool via the [demo app](app/src).

## Development Workflow

There're several useful commands that you can use during the development:

- `yarn link-pkg` links the package into the [app directory](app). You can develop or debug it via the [demo app](app/src).
- `yarn start` creates a `dist` folder with an `ESM` build and type definition file by `rollup` watch mode.
- `yarn lint:code` lints all `.js` and `.tsx?` files.
- `yarn lint:type` runs the [TypeScript](https://www.typescriptlang.org) type-checks.
- `yarn lint:format` formats all files except the file list of `.prettierignore`.
- `yarn lint` lints `code`, `type`, and `format`.
- `yarn test` runs the complete test suite.
- `yarn test:watch` runs an interactive test watcher (helpful in development).
- `yarn test:cov` runs the complete test suite with coverage report.
- `yarn test:update` updates the [Jest snapshots](src/__tests__/__snapshots__).
- `yarn build:dev` creates a `dist` folder with an `ESM` build and type definition file for development.
- `yarn build:prod` creates a `dist` folder with package builds (`CJS` & `ESM`) and type definition file. You can test the package locally via [yarn link](https://yarnpkg.com/lang/en/docs/cli/link).
- `yarn clean:dist` deletes the `dist` build folder.
- `yarn clean:size` deletes the `.size-snapshot.json` file.
- `yarn clean:cov` deletes the `coverage` report folder.
- `yarn clean` deletes build, test, and size relevant files.

## Style Guide

We use [ESLint](https://eslint.org), [StyleLint](https://stylelint.io) and [Prettier](https://prettier.io) for code style and formatting. Run `yarn lint` after making any changes to the code. Then, our linter will catch most issues that may exist in your code.

However, there are still some styles that the linter cannot pick up. If you are unsure about something, looking at [Airbnb’s Style Guide](https://github.com/airbnb/javascript) will guide you in the right direction.

## License

By contributing to REACT COOL INVIEW, you agree that your contributions will be licensed under its MIT license.
