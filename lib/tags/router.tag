<router>

  <yield />

  <script>
    import route from 'riot-route'

    if (opts.base) route.base(opts.base)
    this.route = route.create()
    this.select = target => {
      [].concat(this.tags.route)
        .forEach(r => r.show = (r === target))
    }

    this.on('mount', () => {
      // To avoid updating route tag before mount, we use setTimeout here
      window.setTimeout(() => route.start(true), 0)
    })
  </script>

</router>
