# Introduction

The default riot.js bundle does not contain any router allowing you to pick any library that fits better to your needs.

However we have developed and maintain `riot-route`, a small router library that could be used also as standalone module and fits perfectly to the minimal riot philosophy.

If you want to use `riot-route` in your project you just need to include it either adding via `<script>` tag:

```html
<script src="path/to/dist/route.js"></script>
```

Or if you are using es6 syntax you could do:

```js
import route from 'riot-route' // var route = require('riot-route') is also ok
```

# API

The Riot Router is the minimal router implementation with such technologies:

- pushState and history API
- multiple routing groups
- replacable parser
- isomorphic
- use a [polyfill](https://github.com/devote/HTML5-History-API) for ie9 support and earlier.  Because ie.

## Setup routing

### route(callback)

Execute the given `callback` when the URL changes. For example

```javascript
route(function(collection, id, action) {

})
```

If for example the url changes to `customers/987987/edit` then in the above example the arguments would be:


```javascript
collection = 'customers'
id = '987987'
action = 'edit'
```

The url can change in the following ways:

1. A new hash is typed into the location bar
2. When the back/forward buttons are pressed
3. When `route(to)` is called
4. Anchor tag is clicked

### route(filter, callback)

<span class="tag red">&gt;= v2.3</span>

Execute the given `callback` when the URL changes and it match the `filter`. For example:

```javascript
// matches to just `/fruit`
route('/fruit', function(name) {
  console.log('The list of fruits')
})
```

Wildcards(`*`) are allowed in `filter` and you can capture them as arguments:

```javascript
// if the url change to `/fruit/apple`,
// this will match and catch 'apple' as `name`
route('/fruit/*', function(name) {
  console.log('The detail of ' + name)
})

// if the url change to `/blog/2015-09/01`,
// this will match and catch '2015', '09' and '01'
route('/blog/*-*/*', function(year, month, date) {
  console.log('The page of ' + year + '-' + month + '-' date)
})
```

If you want to match the url `/old` and `/old/and/anything`, it could be written with `..`:

```javascript
route('/old..', function() {
  console.log('The pages under /old was moved.')
})
```

It could be useful when the url includes search queries.

```javascript
// if the url change to `/search?keyword=Apple` this will match
route('/search..', function() {
  var q = route.query()
  console.log('Search keyword: ' + q.keyword)
})

// it could be written like this,
// but be aware that `*` can match only alphanumerics and underscore
route('/search?keyword=*', function(keyword) {
  console.log('Search keyword: ' + keyword)
})
```

<span class="tag red">Note:</span> Internally wildcards are converted to such regular expressions:

- `*`: `([^/?#]+?)`
- `..`: `.*`

### route.create()

<span class="tag red">&gt;= v2.3</span>

Returns a new routing context. For example:

```javascript
var subRoute = route.create()
subRoute('/fruit/apple', function() { /* */ })
```

See also [Routing group](#routing-groups) and [Routing priority](#routing-priority) section, for detail.

## Use router

### route(to[, title, shouldReplace])

Changes the browser URL and notifies all the listeners assigned with `route(callback)`. For example:

```javascript
route('customers/267393/edit')
```
From v2.3, you can set the title, too:

```javascript
route('customers/267393/edit', 'Editing customer page')
```

With the third argument, you can replace the current history. It's useful when the app needs redirect to another page.

```javascript
route('not-found', 'Not found', true)
```

Internally...

- without `shouldReplace`, `history.pushState()` will be used.
- with `shouldReplace`, `history.replaceState()` will be used.

### route.start()

Start listening the url changes.

```javascript
route.start()
```

<span class="tag red">&gt;= v2.3</span>

Riot doesn't `start` its router automatically. DON'T FORGET TO START IT BY YOURSELF. This also means that you can choose your favorite router.
(Note: before v2.3 Riot started the router automatically. The behavior was changed)

### route.start(autoExec)

Start listening the url changes and also exec routing on the current url.

```js
route.start(true)
```

This is a shorthand for:

```js
route.start()
route.exec()
```

<span class="tag red">&gt;= v2.3</span>

Riot doesn't `start` its router automatically. DON'T FORGET TO START IT BY YOURSELF. This also means that you can choose your favorite router.
(Note: before v2.3 Riot started the router automatically. The behavior was changed)

### route.stop()

Stop all the routings. It'll removes the listeners and clear also the callbacks.

```javascript
route.stop()
```

You typically use this method together with [route.start](#route-start). Example:

```javascript
route.stop() // clear all the old router callbacks
route.start() // start again
```

### subRoute.stop()

<span class="tag red">&gt;= v2.3</span>

Stop only subRoute's routings. It'll removes the listeners and clear also the callbacks.

```javascript
var subRoute = route.create()
subRoute('/fruit/apple', function() { /* */ })
subRoute.stop()
```

### route.exec()

Study the current browser path "in place" and emit routing without waiting for it to change.

```javascript
route(function() { /* define routing */ })
route.exec()
```

<span class="tag red">Warning:</span> `route.exec(callback)` was deprecated from `v2.3`.

### route.query()

<span class="tag red">&gt;= v2.3</span>

This is an utility function to extract the query from the url. For example:

```javascript
// if the url change to `/search?keyword=Apple&limit=30` this will match
route('/search..', function() {
  var q = route.query()
  console.log('Search keyword: ' + q.keyword)
  console.log('Search limit: ' + q.limit)
})
```

## Customize router

### route.base(base)

Change the base path. If you have the url like this:

`http://riotexample.com/app/fruit/apple`

You could set the base to `/app`, then you will have to take care of only `/fruit/apple`.

```javascript
route.base('/app')
```

The default `base` value is "#". If you'd like to use hashbang, change it to `#!`.

```javascript
route.base('#!')
```

<span class="tag red">Warning</span>

If you remove the `#` from the base, your web server needs to deliver your app no matter what url comes in, because your app, in the browser, is manipulating the url. The web server doesn't know how to handle the URL.



### route.parser(parser[, secondParser])

Changes the default parser to a custom one. Here's one that parses paths like this:

`!/user/activation?token=xyz`

```javascript
route.parser(function(path) {
  var raw = path.slice(2).split('?'),
      uri = raw[0].split('/'),
      qs = raw[1],
      params = {}

  if (qs) {
    qs.split('&').forEach(function(v) {
      var c = v.split('=')
      params[c[0]] = c[1]
    })
  }

  uri.push(params)
  return uri
})
```

And here you'll receive the params when the URL changes:

```javascript
route(function(target, action, params) {

  /*
    target = 'user'
    action = 'activation'
    params = { token: 'xyz' }
  */

})
```

#### Second parser

<span class="tag red">&gt;= v2.3</span>

If you specify `secondParser`, you can change the second parser, too. The second parser is used with url filter:

```javascript
// This is the default parser
function second(path, filter) {
  var re = new RegExp('^' + filter.replace(/\*/g, '([^/?#]+?)').replace(/\.\./, '.*') + '$')
  if (args = path.match(re)) return args.slice(1)
}

route.parser(first, second)
```

If the parser return nothing, the next route matching will be tried.

## Routing groups

Traditional router on server-side is highly centralized, but recently we use routers everywhere on the page. Think about this case:

```html
<first-tag>
  <p>First tag</p>
  <script>
    route('/fruit/*', function(name) {
      /* do something common */
    })
  </script>
</first-tag>

<second-tag>
  <p>Second tag</p>
  <script>
    route('/fruit/apple', function(name) {
      /* do something SPECIAL */
    })
  </script>
</second-tag>
```

Two tags have routings, and looks good? No, this won't work. Because only one routing will emit and we can't know which routing will, too. Then, we have to make separated routing groups for each tag definition. For example:

```html
<first-tag>
  <p>First tag</p>
  <script>
    var subRoute = route.create() // create another routing context
    subRoute('/fruit/*', function(name) {
      /* do something common */
    })
  </script>
</first-tag>

<second-tag>
  <p>Second tag</p>
  <script>
    var subRoute = route.create() // create another routing context
    subRoute('/fruit/apple', function(name) {
      /* do something SPECIAL */
    })
  </script>
</second-tag>
```

## Routing priority

The router will try to match routing from the first. So in the next case, routing-B and -C will never emit.

```javascript
route('/fruit/*', function(name) { /* */ }) // routing-A (1)
route('/fruit/apple', function() { /* */ }) // routing-B (2)
route('/fruit/orange', function() { /* */ }) // routing-C (3)
```

This will work fine:

```javascript
route('/fruit/apple', function() { /* */ }) // routing-B (1)
route('/fruit/orange', function() { /* */ }) // routing-C (2)
route('/fruit/*', function(name) { /* */ }) // routing-A (3)
```

And routings *with filter* has higher priority than routing *without filter*. It means that routing-X is defined first but execute at last in the next example:

```javascript
route(function() { /* */ }) // routing-X (3)
route('/fruit/*', function() { /* */ }) // routing-Y (1)
route('/sweet/*', function() { /* */ }) // routing-Z (2)
```

## Tag-based routing

<span class="tag red">&gt;= v3.1</span>

This feature allows you to **write your routes as declarative tags**:

```html
<app>
  <router>
    <route path="apple"><p>Apple</p></route>
    <route path="banana"><p>Banana</p></route>
    <route path="coffee"><p>Coffee</p></route>
  </router>
</app>
```

To use this feature, you need to load `route+tag.js` instead of `route.js`

```html
<script src="path/to/dist/route+tag.js"></script>
```

Or for ES6:

```javascript
import route from 'riot-route/lib/tag' // note that the path is bit different to cjs one
```

Or for CommonJS:

```javascript
const route = require('riot-route/tag')
```

### Available tags

- `<router>`
  - it can contains multiple routes
  - equivalent to `const r = route.create()` so it creates a sub router
- `<route>`
  - it has `path` attribute
  - `<route path="fruit/apple">` is equivalent to `r('fruit/apple', () => { ... })`
  - when the route has selected, it triggers **route** event on its children and passes some arguments to them (see details below)

### Capturing wildcard arguments

Remember that we could use wildcards `*` in routing. Of cause we can also do the same in *tag-based routing*:

```html
<app>
  <router>
    <route path="fruit/apple"><p>Apple</p></route>
    <route path="fruit/*"><inner-tag /></route>
  </router>
</app>

<inner-tag>
  <p>{ name } is not found</p>
  <script>
    this.on('route', name => this.name = name)
  </script>
</inner-tag>
```

See the example above. If it gets `fruit/pineapple`, the `route` event will fire in `<inner-tag>` and pass one argument `'pineapple'`.

### Real world example

Usually we would call external API to get some data during routing process. It's handy to hook `route` event for such a purpose. For example:

```html
<app>
  <router>
    <route path="user/*"><app-user /></route>
  </router>
</app>

<app-user>
  <p>{ message }!</p>
  <script>
    this.on('route', id => {
      this.message = 'now loading...'
      getUserById(id).then(user => {
        this.update({
          message: `Hello ${ user.name }!`
        })
      })
    })
  </script>
</app-user>
```

### Some notes

- The router automatically starts after first `<router>` tag has been mounted. You don't have to call `router.start(true)` by yourself.
- to change `base` for routing, use `route.base('/path/to/base/')`
