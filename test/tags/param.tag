<param>
  <router>
    <route path="*"><param-sub /></route>
  </router>
</param>

<param-sub>
  <p>{ name || '(undefined)' }</p>
  <script>
    this.on('route', function(name) { this.name = name })
  </script>
</param-sub>
