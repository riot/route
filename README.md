[![Build Status][travis-image]][travis-url]
[![Code Quality][codeclimate-image]][codeclimate-url]
[![NPM version][npm-version-image]][npm-url]
[![NPM downloads][npm-downloads-image]][npm-url]
[![MIT License][license-image]][license-url]
[![Coverage Status][coverage-image]][coverage-url]

# Riot Router

The Riot Router is the minimal router implementation with such technologies:

- pushState and history API
- multiple routing groups
- replacable parser
- compatible with IE9 and higher

A part of Riot.js, but it also works without Riot.js.

## Documentation

- [API (latest)](doc/)

See also riotjs.com:

- [API (English)](http://riotjs.com/api/route/)
- [API (Japanese)](http://riotjs.com/ja/api/route/)

## Downloads

We have 3 editions:

- **Standalone**:
  - [route.js](https://raw.githubusercontent.com/riot/route/master/dist/route.js)
  - [route.min.js](https://raw.githubusercontent.com/riot/route/master/dist/route.min.js)
- **AMD**:
  - *for RequireJS*
  - [amd.route.js](https://raw.githubusercontent.com/riot/route/master/dist/amd.route.js)
  - [amd.route.min.js](https://raw.githubusercontent.com/riot/route/master/dist/amd.route.min.js)
- **CommonJS**
  - *for Browserify, Webpack, ...etc*
  - download via npm

## Installation

### npm

```bash
$ npm install --save riot-route
```

### Bower

```bash
$ bower install --save riot-route
```

### jsdelivr

The files are also hosted on [jsdelivr](https://www.jsdelivr.com/?query=riot-route):

```html
<script src="https://cdn.jsdelivr.net/riot-route/x.x.x/route.min.js"></script>
```

*Note*: change the part `x.x.x` to the version numbers what you want to use. Ex: `2.5.0` or `3.0.0`.

## Demos

- [Page switching](http://riotjs.com/examples/plunker/?app=router-page-switcher)
- [Complex routings](http://riotjs.com/examples/plunker/?app=router-complex)

## Development

- `$ npm install` to setup
- `$ npm run build` to build it once
- `$ npm run watch` to watch and build it continuously
- `$ npm test` to test

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
