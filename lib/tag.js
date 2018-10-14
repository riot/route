import riot from 'riot';
import route from 'riot-route';

riot.tag2('router', '<yield></yield>', '', '', function(opts) {
    var this$1 = this;


    this.route = route.create();
    this.select = function (target) {
      [].concat(this$1.tags.route)
        .forEach(function (r) { return r.show = (r === target); });
    };

    this.on('mount', function () {

      window.setTimeout(function () { return route.start(true); }, 0);
    });

    this.on('unmount', function () {
      this$1.route.stop();
    });
});

riot.tag2('route', '<virtual if="{show}"><yield></yield></virtual>', '', '', function(opts) {
    var this$1 = this;

    this.show = false;
    this.parent.route(opts.path, function () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];


      this$1.one('updated', function () {
        flatten(this$1.tags).forEach(function (tag) {
          tag.trigger.apply(tag, [ 'route' ].concat( args ));
          tag.update();
        });
      });
      this$1.parent.select(this$1);
      this$1.parent.update();
    });

    function flatten(tags) {
      return Object.keys(tags)
        .map(function (key) { return tags[key]; })
        .reduce(function (acc, tag) { return acc.concat(tag); }, [])
    }
});

export default route;
