[![Build Status][travis-image]][travis-url]
[![Code Quality][codeclimate-image]][codeclimate-url]
[![NPM version][npm-version-image]][npm-url]
[![NPM downloads][npm-downloads-image]][npm-url]
[![MIT License][license-image]][license-url]
[![Coverage Status][coverage-image]][coverage-url]

# Riot Router

Router is a generic tool to take care of the URL and the back button. It's the smallest implementation you can find and it works on all browsers including IE9. It can do the following:

1. Change the hash part of the URL
2. Notify when the hash changes
3. Study the current hash

You can place routing logic everywhere; in custom tags or non-UI modules. Some application frameworks make the router a central element that dispatches work to the other pieces of the application. Some take a milder approach where URL events are like keyboard events, not affecting the overall architecture.

Every browser application needs routing since there is always an URL in the location bar.

## Documentation

- [API (English)](doc/)
- [API (日本語)](doc/ja/)

## Installation

### Npm (not yet published)

```bash
$ npm install --save riot-route
```

or from GitHub directly:

```bash
$ npm install --save riot/router
```

### Bower (not yet published)

```bash
$ bower install --save riot-route
```

or from GitHub directly:

```bash
$ bower install --save riot/router
```

## Demos

- [Page switching](http://riotjs.com/examples/plunker/?app=router-page-switcher)

## Development

- `$ npm install` to setup
- `$ make build` to build it once
- `$ make watch` to watch and build it continuously
- `$ npm test` to test

[travis-image]:https://img.shields.io/travis/riot/observable.svg?style=flat-square
[travis-url]:https://travis-ci.org/riot/router

[license-image]:http://img.shields.io/badge/license-MIT-000000.svg?style=flat-square
[license-url]:LICENSE.txt

[npm-version-image]:http://img.shields.io/npm/v/riot-route.svg?style=flat-square
[npm-downloads-image]:http://img.shields.io/npm/dm/riot-route.svg?style=flat-square
[npm-url]:https://npmjs.org/package/riot-route

[coverage-image]:https://img.shields.io/coveralls/riot/router/master.svg?style=flat-square
[coverage-url]:https://coveralls.io/r/riot/router/?branch=master

[codeclimate-image]:https://img.shields.io/codeclimate/github/riot/router.svg?style=flat-square
[codeclimate-url]:https://codeclimate.com/github/riot/router
