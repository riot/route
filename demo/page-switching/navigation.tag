<navigation>
  <a each={ opts.records } href="#{ id }">{ title }</a>

  <style scoped>
    :scope {
      display: block;
      border-bottom: 1px solid #666;
      padding: 0 0 1em;
    }
    a {
      display: inline-block;
      padding: 0 .8em;
    }
    a:not(:first-child) {
      border-left: 1px solid #eee;
    }
  </style>
</navigation>
