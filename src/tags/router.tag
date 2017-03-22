<router>

  <yield />

  <script>
    import route from 'riot-route'
    
    this.route = route.create()
    this.routes = []

    this.select = target => {
      this.routes.forEach(r => r.show = (r === target))
    }

    this.on('mount', () => {
      // To avoid updating route tag before mount, we use setTimeout here
      window.setTimeout(() => route.start(true), 0)
    })
  </script>

</router>
