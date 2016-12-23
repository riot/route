<route>

  <virtual if={ show }><yield /></virtual>

  <script>
    this.show = false
    this.parent.route(opts.path, (...args) => {
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
    })

    function flatten(tags) {
      return Object.keys(tags)
        .map(key => tags[key])
        .reduce((acc, tag) => acc.concat(tag), [])
    }
  </script>

</route>
