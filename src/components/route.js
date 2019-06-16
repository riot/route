<route>

  <virtual if={ show }><yield /></virtual>

  <script>
    this.show = false
    const showRoute = (...args) => {
      // There's no way to intercept the child tags while mounting.
      // We need to wait the `updated` event to access them via `this.tags`.
      this.one('updated', () => {
        flatten(this.tags).forEach(tag => {
          tag.trigger('route', ...args)
          tag.update()
        })
      })
      this.parent.select(this)
      this.parent.update()
    }
    
    // make sure there is window object and it has route, 
    // and also check route has _ (to make sure window.route is not overridden by someone else)
    const getPathFromBase = !!window && !!window.route && !!window.route._ 
                               ? window.route._.getPathFromBase 
                               : () => '';

    if(opts.path === getPathFromBase()){
      // if this route's path is same as current route and it is a sub route then, 
      // because the route has already changed it's callback(showRoute) will not get executed,
      // which will get added to the callbacks just after this if condition.
      // so to show the route we call the callback(showRoute) manually.
  
      // we can also call showRoute on mount, but in that case, it will trigger in every mount
      // which is not required
  
      // can not call showRoute directly it will cause "Maximum call stack"
      setTimeout(showRoute, 0);
    }

    this.parent.route(opts.path, showRoute)

    function flatten(tags) {
      return Object.keys(tags)
        .map(key => tags[key])
        .reduce((acc, tag) => acc.concat(tag), [])
    }
  </script>

</route>
