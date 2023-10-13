# Riot Router

[![Route logo](https://raw.githubusercontent.com/riot/branding/main/route/route-horizontal.svg)](https://github.com/riot/route/)

[![Build Status][ci-image]][ci-url] [![Code Quality][codeclimate-image]][codeclimate-url] [![NPM version][npm-version-image]][npm-url] [![NPM downloads][npm-downloads-image]][npm-url] [![MIT License][license-image]][license-url] [![Coverage Status][coverage-image]][coverage-url]

> Simple isomorphic router

The Riot.js Router is the minimal router implementation with such technologies:

- compatible with the DOM pushState and history API
- isomorphic functional API
- [erre.js streams](https://github.com/GianlucaGuarini/erre) and javascript async generators
- [rawth.js](https://github.com/GianlucaGuarini/rawth) urls parsing

It doesn't need Riot.js to work and can be used as standalone module.

**For Riot.js 3 and the older route version please check the [v3 branch](https://github.com/riot/route/tree/v3)**

## Table of Contents

- [Install](#install)
- [Documentation](#documentation)
- [Demos](https://github.com/riot/examples)

## Install

We have 2 editions:

| edition                   | file                      |
| :------------------------ | :------------------------ |
| **ESM Module**            | `index.js`                |
| **UMD Version**           | `index.umd.js`            |
| **Standalone ESM Module** | `index.standalone.js`     |
| **Standalone UMD Module** | `index.standalone.umd.js` |

### Script injection

```html
<script src="https://unpkg.com/@riotjs/route@x.x.x/index.umd.js"></script>
```

_Note_: change the part `x.x.x` to the version numbers what you want to use: ex. `4.5.0` or `4.7.0`.

### ESM module

```js
import { route } from 'https://unpkg.com/@riotjs/route/index.js'
```

### npm

```bash
$ npm i -S @riotjs/route
```

### Download by yourself

- [Standalone](https://unpkg.com/@riotjs/route/route.js)
- [ESM](https://unpkg.com/@riotjs/route/route.esm.js)

## Documentation

### With Riot.js

You can import the `<router>` and `<route>` components in your application and use them as it follows:

```html
<app>
  <router>
    <!-- These links will trigger automatically HTML5 history events -->
    <nav>
      <a href="/home">Home</a>
      <a href="/about">About</a>
      <a href="/team/gianluca">Gianluca</a>
    </nav>

    <!-- Your application routes will be rendered here -->
    <route path="/home"> Home page </route>
    <route path="/about"> About </route>
    <route path="/team/:person"> Hello dear { route.params.person } </route>
  </router>

  <script>
    import { Router, Route } from '@riotjs/route'

    export default {
      components { Router, Route }
    }
  </script>
</app>
```

You can also use the `riot.register` method to register them globally

```js
import { Route, Router } from '@riotjs/route'
import { register } from 'riot'

// now the Router and Route components are globally available
register('router', Router)
register('route', Route)
```

#### Router

The `<router>` component should wrap your application markup and will detect automatically all the clicks on links that should trigger a route event.

```html
<router>
  <!-- this link will trigger a riot router event -->
  <a href="/path/somewhere">Link</a>
</router>
<!-- this link will work as normal link without triggering router events -->
<a href="/path/to/a/page">Link</a>
```

You can also specify the base of your application via component attributes:

```html
<router base="/internal/path">
  <!-- this link is outside the base so it will work as a normal link -->
  <a href="/somewhere">Link<a>
</router>
```

The router component has also an `onStarted` callback that will be called asynchronously after the first route event will be called

```html
<router onStarted="{onRouterStarted}"></router>
```

#### Route

The `<route>` component provides the `route` property to its children (it's simply a [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) object) allowing you to detect the url params and queries.

```html
<route path="/:some/:route/:param"> {JSON.stringify(route.params)} </route>

<route path="/search(.*)">
  <!-- Assuming the URL is "/search?q=awesome" -->

  {route.searchParams.get('q')}
</route>
```

Each `<route>` component has its own lifecycle attributes in order to let you know when it gets mounted or unmounted.

```riot
<app>
  <router>
    <route path="/home"
      on-before-mount={onBeforeHomeMount}
      on-mounted={onHomeMounted}
      on-before-unmount={onBeforeHomeUnmount}
      on-unmounted={onHomeUnmounted}
    />
  </router>
</app>
```

### Standalone

This module was not only designed to be used with Riot.js but also as standalone module.
Without importing the Riot.js components in your application you can use the core methods exported to build and customize your own router compatible with any kind of frontend setup.

Depending on your project setup you might import it as follows:

```js
// in a Riot.js application
import { route } from '@riotjs/route'

// in a standalone context
import { route } from '@riotjs/route/standalone'
```

#### Fundamentals

This module works on node and on any modern browser, it exports the `router` and `router` property exposed by [rawth](https://github.com/GianlucaGuarini/rawth)

```js
import { route, router, setBase } from '@riotjs/route'

// required to set base first
setBase('/')

// create a route stream
const aboutStream = route('/about')

aboutStream.on.value((url) => {
  console.log(url) // URL object
})

aboutStream.on.value(() => {
  console.log('just log that the about route was triggered')
})

// triggered on each route event
router.on.value((path) => {
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

// in case you want to use the HTML5 history navigation
setBase(`/`)

// in case you use the hash navigation
setBase(`#`)
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

[ci-image]: https://img.shields.io/github/actions/workflow/status/riot/route/test.yml?style=flat-square
[ci-url]: https://github.com/riot/route/actions
[license-image]: http://img.shields.io/badge/license-MIT-000000.svg?style=flat-square
[license-url]: LICENSE.txt
[npm-version-image]: http://img.shields.io/npm/v/@riotjs/route.svg?style=flat-square
[npm-downloads-image]: http://img.shields.io/npm/dm/@riotjs/route.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@riotjs/route
[coverage-image]: https://img.shields.io/coveralls/riot/route/main.svg?style=flat-square
[coverage-url]: https://coveralls.io/github/riot/route/?branch=main
[codeclimate-image]: https://api.codeclimate.com/v1/badges/1487b171ba4409b5c302/maintainability
[codeclimate-url]: https://codeclimate.com/github/riot/route
