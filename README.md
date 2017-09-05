# Riot Router

[![Build Status][travis-image]][travis-url] [![Code Quality][codeclimate-image]][codeclimate-url] [![NPM version][npm-version-image]][npm-url] [![NPM downloads][npm-downloads-image]][npm-url] [![MIT License][license-image]][license-url] [![Coverage Status][coverage-image]][coverage-url]

> Simple client-side router

The Riot Router is the minimal router implementation with such technologies:

- pushState and history API
- multiple routing groups
- replacable parser
- compatible with IE9 and higher

It started as a part of Riot.js, but now it becomes an independent library. It works with or without Riot.js.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Demos](#demos)
- [Contribute](#contribute)
- [License](#license)

## Install

We have 4 editions:

edition | target | file | via
:-- | :-- | :-- | :--
**Standalone** | `<script>` tag | `dist/route.min.js` | [jsdelivr](https://www.jsdelivr.com/?query=riot-route) ⋅ Bower ⋅ [download](https://raw.githubusercontent.com/riot/route/master/dist/route.min.js)
**AMD** | [RequireJS](http://requirejs.org/) | `dist/amd.route.min.js` | [jsdelivr](https://www.jsdelivr.com/?query=riot-route) ⋅ Bower ⋅ [download](https://raw.githubusercontent.com/riot/route/master/dist/amd.route.min.js)
**CommonJS** | [Browserify](http://browserify.org/), [webpack](https://webpack.github.io/) | `index.js` | [npm](https://www.npmjs.com/package/riot-route)
**ES module** | [Rollup](http://rollupjs.org/) | `lib/index.js` | [npm](https://www.npmjs.com/package/riot-route)

### jsdelivr

```html
<script src="https://cdn.jsdelivr.net/npm/riot-route@x.x.x/dist/route.min.js"></script>
```

*Note*: change the part `x.x.x` to the version numbers what you want to use: ex. `2.5.0` or `3.0.0`.

### npm

```bash
$ npm install --save riot-route
```

### Bower

```bash
$ bower install --save riot-route
```

### Download by yourself

- [Standalone](https://raw.githubusercontent.com/riot/route/master/dist/route.min.js)
- [AMD](https://raw.githubusercontent.com/riot/route/master/dist/amd.route.min.js)

## Usage

- [API Documentation (latest)](doc/)

See also [riotjs.com](http://riotjs.com/api/route/).

## Demos

- [Page switching](http://riotjs.com/examples/plunker/?app=router-page-switcher)
- [Complex routings](http://riotjs.com/examples/plunker/?app=router-complex)

## Contribute

Feel free to dive in! [Open an issue](https://github.com/riot/route/issues) or submit PRs.

- `$ npm install` to setup
- `$ npm run build` to build it once
- `$ npm run watch` to watch and build it continuously
- `$ npm test` to test

## License

MIT (c) Muut, Inc. and other contributors

[travis-image]:https://img.shields.io/travis/riot/observable.svg?style=flat-square
[travis-url]:https://travis-ci.org/riot/route

[license-image]:http://img.shields.io/badge/license-MIT-000000.svg?style=flat-square
[license-url]:LICENSE.txt

[npm-version-image]:http://img.shields.io/npm/v/riot-route.svg?style=flat-square
[npm-downloads-image]:http://img.shields.io/npm/dm/riot-route.svg?style=flat-square
[npm-url]:https://npmjs.org/package/riot-route

[coverage-image]:https://img.shields.io/coveralls/riot/route/master.svg?style=flat-square
[coverage-url]:https://coveralls.io/github/riot/route/?branch=master

[codeclimate-image]:https://img.shields.io/codeclimate/github/riot/route.svg?style=flat-square
[codeclimate-url]:https://codeclimate.com/github/riot/route
