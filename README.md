# Riot Router

[![Build Status][travis-image]][travis-url] [![Code Quality][codeclimate-image]][codeclimate-url] [![NPM version][npm-version-image]][npm-url] [![NPM downloads][npm-downloads-image]][npm-url] [![MIT License][license-image]][license-url] [![Coverage Status][coverage-image]][coverage-url]

> Simple isomorphic router

The Riot.js Router is the minimal router implementation with such technologies:

- compatible with the DOM pushState and history API
- isomorphic functional API
- [erre.js streams](https://github.com/GianlucaGuarini/erre) and javascript async generators
- [rawth.js](https://github.com/GianlucaGuarini/rawth) urls parsing

It doesn't need Riot.js to work and can be used as standalone module.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Documentation](#documentation)
- [Demos](#demos)

## Install

We have 2 editions:

edition | file
:-- | :--
**Standalone UMD** | `route.js`
**Standalone ESM Module** | `route.esm.js`

### Script injection

```html
<script src="https://unpkg.com/@riotjs/route@x.x.x/route.js"></script>
```

*Note*: change the part `x.x.x` to the version numbers what you want to use: ex. `4.5.0` or `4.7.0`.

### ESM module

```js
import { route } from 'https://unpkg.com/@riotjs/route/route.esm.js'
```

### npm

```bash
$ npm i -S @riotjs/route
```

### Download by yourself

- [Standalone](https://unpkg.com/@riotjs/route/route.js)
- [ESM](https://unpkg.com/@riotjs/route/route.esm.js)

## Documentation

### Standalone

This module was not only designed to be used with Riot.js but also as standalone module.
Without importing the Riot.js components in your application you can use the core methods exported to build and customize your own router compatible with any kind of frontend setup.

#### Basics

This module works on node and on any modern browser, it exports the `router` and `router` property exposed by [rawth](https://github.com/GianlucaGuarini/rawth)

```js
import { route, router } from '@riotjs/route'

// create a route stream
const aboutStream = route('/about')

aboutStream.on.value(url => {
  console.log(url) // URL object
})

aboutStream.on.value(() => {
  console.log('just log that the about route was triggered')
})

// triggered on each route event
router.on.value(path => {
  // path is always a string in this function
  console.log(path)
})

// trigger a route change manually
router.push('/about')

// end the stream
aboutStream.end()
```

#### Base path

Before using the router in your browser you will need to set your application base path.
This setting can be configured simply via `setBase` method:

```js
import { setBase } from '@riotjs/route'

const loc = window.location

// in case you want to use the HTML5 history navigation
setBase(`${loc.protocol}//${loc.host}`)

// in case you use the hash navigation
setBase(`${loc.protocol}//${loc.host}#`)
```

Setting the base path of your application route is mandatory and is the first you probably are going to do before creating your route listeners.

#### DOM binding
The example above is not really practical in case you are working in a browser environment. In that case you might want to bind your router to the DOM listening all the click events that might trigger a route change event.
Window history `popstate` events should be also connected to the router.
With the `initDomListeners` method you can automatically achieve all the features above:

```js

import { initDomListeners } from '@riotjs/route'

const unsubscribe = initDomListeners()
// the router is connected to the page DOM

// ...tear down and disconnect the router from the DOM
unsubscribe()
```

The `initDomListeners` will intercept any link click on your application. However it can also receive a HTMLElement or a list of HTMLElements as argument to scope the click listener only to a specific DOM region of your application

```js
import { initDomListeners } from '@riotjs/route'

initDomListeners(document.querySelector('.main-navigation'))
```

## Demos


[travis-image]:https://img.shields.io/travis/riot/observable.svg?style=flat-square
[travis-url]:https://travis-ci.org/riot/route

[license-image]:http://img.shields.io/badge/license-MIT-000000.svg?style=flat-square
[license-url]:LICENSE.txt

[npm-version-image]:http://img.shields.io/npm/v/@riotjs/route.svg?style=flat-square
[npm-downloads-image]:http://img.shields.io/npm/dm/@riotjs/route.svg?style=flat-square
[npm-url]:https://npmjs.org/package/@riotjs/route

[coverage-image]:https://img.shields.io/coveralls/riot/route/master.svg?style=flat-square
[coverage-url]:https://coveralls.io/github/riot/route/?branch=master

[codeclimate-image]:https://api.codeclimate.com/v1/badges/1487b171ba4409b5c302/maintainability
[codeclimate-url]:https://codeclimate.com/github/riot/route
