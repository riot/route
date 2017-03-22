<route-param>
  <router>
    <inner-route-param/>
  </router>
</route-param>

<inner-route-param>
  <route path="*" router={this.parent}>
    <route-param-sub/>
  </route>
</inner-route-param>

<route-param-sub>
  <p>{ name || '(undefined)' }</p>
  <script>
    this.on('route', function(name) { this.name = name })
  </script>
</route-param-sub>
