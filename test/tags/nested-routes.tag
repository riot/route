<nested-routes>
  <router>
    <route path="">
      <h1> Home </h1>
      <br/>
    </route>
    <route path="child..">
      <child-tag></child-tag>
    </route>
  </router>
</nested-routes>

<child-tag>
  <router>
    <route path="child/child-route1">
      <p>Child route 1</p>
    </route>
    <route path="child/child-route2">
      <p>Child route 2</p>
    </route>
  </router>
</child-tag>
