[![Build Status](https://travis-ci.org/nicoespeon/trello-kanban-analysis-tool.svg?branch=develop)](https://travis-ci.org/nicoespeon/trello-kanban-analysis-tool)

# TKAT (Trello Kanban Analysis Tool)

A JavaScript library to analyze Kanban metrics from a Trello board.

Here is [the online application](http://www.nicoespeon.com/trello-kanban-analysis-tool/).

## What it is

This started as a side project for practicing functional programming using:

- [RxJS](https://github.com/Reactive-Extensions/RxJS) & [Cycle.js](http://cycle.js.org/), as the core framework
- [Ramda](http://ramdajs.com/), as a utils library
- [Tape](https://github.com/substack/tape), for testing
- [Brunch](http://brunch.io/), to automate things

To make this side project interesting, I aimed to ease manual repetitive work: generating [Cumulative Flow Diagram](http://brodzinski.com/2013/07/cumulative-flow-diagram.html) for a Kanban-like Trello board.

If you are curious about the context and Trello-Kanban stuff, [I wrote a whole post about it](https://medium.com/@nicoespeon/kanban-and-game-development-with-trello-8819b33f83dc#.qmfuy8pev).

## How to use it

As a user, you can simply go with [the online application](http://www.nicoespeon.com/trello-kanban-analysis-tool/).

If you want to run it locally, let's suppose you've got [node.js](https://nodejs.org) and [npm](https://www.npmjs.com/) installed.

- Clone the repo: `git clone git://github.com/nicoespeon/trello-kanban-analysis-tool.git`
- Install dependencies: `npm install`
- Ensure you've got [brunch](http://brunch.io/) installed globally: `npm install -g brunch`
- Run `brunch watch --server` to get a running application

### Available commands

Basically, all [brunch commands](https://github.com/brunch/brunch/blob/master/docs/commands.md).

You will probably want to use `brunch watch --server` to serve the app locally.

In case of doubt, you can run `npm test` to check if anything is wrong with source code.

#### `npm run lint`

Lint JavaScript through [ESLint](http://eslint.org/).

#### `npm run unit-test`

Launch unit tests with [Babel tape runner](https://github.com/wavded/babel-tape-runner).

#### `npm run unit-test-diff`

Launch unit tests through [tap-diff reporter](https://www.npmjs.com/package/tap-diff).

### Contributing

That would be amazing :metal:

Please have a look at [the CONTRIBUTING.md file](https://github.com/nicoespeon/trello-kanban-analysis-tool/blob/develop/CONTRIBUTING.md) before you do so.

## Versioning

This project uses [SemVer](http://semver.org/) as a guideline for versioning.

That mean releases will be numbered with `<major>.<minor>.<patch>` format, regarding following guidelines:

- Breaking backward compatibility bumps the `<major>` (and resets the `<minor>` and `<patch>`)
- New additions without breaking backward compatibility bumps the `<minor>` (and resets the `<patch>`)
- Bug fixes and misc. changes bumps the `<patch>`

## Inspiration & Readings

### Organisational things

- [7 lean metrics to improve flow](http://leankit.com/learn/kanban/lean-flow-metrics/)
- [One day in Kanban land](http://blog.crisp.se/2009/06/26/henrikkniberg/1246053060000)
- [Kanban and Game Development with Trello](https://medium.com/@nicoespeon/kanban-and-game-development-with-trello-8819b33f83dc#.qmfuy8pev)
- [Kanban Development Oversimplified](http://jpattonassociates.com/kanban_oversimplified/)
- [Versions: Release Names vs Version Numbers](https://github.com/cloverfield-tools/cf-package/blob/master/template/docs/contributing/versions/index.md#versions-release-names-vs-version-numbers)

### Technical stuff

- [The introduction to Reactive Programming you've been missing](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754)
- [Cycle.js - Getting started](http://cycle.js.org/getting-started.html)
- [Cycle.js was built to solve problems (VIDEO)](https://www.youtube.com/watch?v=Rj8ZTRVka4E)
- [Why I use Tape Instead of Mocha & So Should You](https://medium.com/javascript-scene/why-i-use-tape-instead-of-mocha-so-should-you-6aa105d8eaf4#.o6d9u4azh)
- [The Brunch.io Guide](https://github.com/brunch/brunch-guide#readme)

## Copyright and License

Copyright (c) 2016 [Nicolas CARLO](https://twitter.com/nicoespeon) under [the MIT license](https://github.com/nicoespeon/trello-kanban-analysis-tool/blob/develop/LICENSE.md).

:confused: [What does that mean?](http://choosealicense.com/licenses/mit/)
