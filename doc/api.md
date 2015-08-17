---
title: Router
layout: default
class: apidoc
---

{% include api-tabs.html %}


The Riot Router is the most minimal router implementation you can find. It only listens to changes on the URL hash (the part after the `#` character) since that's what most applications do. If you really care about full URL changes you must pick from the large list of other router implementations on the wild.

The Riot router is best in routing schemes in which the route's hierarchical parts, after the "#", are separated with the "/" character. In that case Riot gives you direct access to these parts.


### <a name="route"></a> riot.route(callback)

Execute the given `callback` when the URL hash changes. For example

``` js
riot.route(function(collection, id, action) {

})
```

If for example the hash changes to `#customers/987987/edit` then in the above example the arguments would be:


``` js
collection = 'customers'
id = '987987'
action = 'edit'
```

The hash can change in the following ways:

1. A new hash is typed into the location bar
2. When the back/forward buttons are pressed
3. When `riot.route(to)` is called

### <a name="route-start"></a> riot.route.start()

Start listening the window hash changes and it's automatically called when riot gets loaded. You typically use this method together with [route.stop](#route-stop). Example:

``` js
riot.route.stop() // clear all the old riot.route callbacks
riot.route.start() // start again
```

### <a name="route-stop"></a> riot.route.stop()

Remove the hashchange listeners clearing also the [route.route](#route) callbacks.

``` javascript
riot.route.stop()
```

Stopping the default router allow the use of a different router on your appliaction.

### <a name="route-to"></a> riot.route(to)

Changes the browser URL and notifies all the listeners assigned with `riot.route(callback)`. For example:

``` javascript
riot.route('customers/267393/edit')
```

### <a name="route-exec"></a> riot.route.exec(callback)

Study the current hash "in place" using given `callback` without waiting for it to change. For example

``` js
riot.route.exec(function(collection, id, action) {

})
```

### <a name="route-parser"></a> riot.route.parser(parser)

Changes the default parser to a custom one. Here's one that parses paths like this:

`!/user/activation?token=xyz`

``` js
riot.route.parser(function(path) {
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

``` js
riot.route(function(target, action, params) {

  /*
    target = 'user'
    action = 'activation'
    params = { token: 'xyz' }
  */

})
```
