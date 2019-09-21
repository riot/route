(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.route = {}));
}(this, function (exports) { 'use strict';

  /**
   * Cancel token
   * @private
   * @type { Symbol }
   */
  const CANCEL = Symbol();

  /**
   * Helper that can be returned by ruit function to cancel the tasks chain
   * @returns { Symbol } internal private constant
   * @example
   *
   * ruit(
   *   100,
   *   num => Math.random() * num
   *   num => num > 50 ? ruit.cancel() : num
   *   num => num - 2
   * ).then(result => {
   *   console.log(result) // here we will get only number lower than 50
   * })
   *
   */
  ruit.cancel = () => CANCEL;

  /**
   * The same as ruit() but with the arguments inverted from right to left
   * @param   { * } tasks - list of tasks to process sequentially
   * @returns { Promise } a promise containing the result of the whole chain
   * @example
   *
   * const curry = f => a => b => f(a, b)
   * const add = (a, b) => a + b
   *
   * const addOne = curry(add)(1)
   *
   * const squareAsync = (num) => {
   *   return new Promise(r => {
   *     setTimeout(r, 500, num * 2)
   *   })
   * }
   *
   * // a -> a + a -> a * 2
   * // basically from right to left: 1 => 1 + 1 => 2 * 2
   * ruit.compose(squareAsync, addOne, 1).then(result => console.log(result)) // 4
   */
  ruit.compose = (...tasks) => ruit(...tasks.reverse());

  /**
   * Serialize a list of sync and async tasks from left to right
   * @param   { * } tasks - list of tasks to process sequentially
   * @returns { Promise } a promise containing the result of the whole chain
   * @example
   *
   * const curry = f => a => b => f(a, b)
   * const add = (a, b) => a + b
   *
   * const addOne = curry(add)(1)
   *
   * const squareAsync = (num) => {
   *   return new Promise(r => {
   *     setTimeout(r, 500, num * 2)
   *   })
   * }
   *
   * // a -> a + a -> a * 2
   * // basically from left to right: 1 => 1 + 1 => 2 * 2
   * ruit(1, addOne, squareAsync).then(result => console.log(result)) // 4
   */
  function ruit(...tasks) {
    return new Promise((resolve, reject) => {
      return (function run(queue, result) {
        if (!queue.length) return resolve(result)

        const [task, ...rest] = queue;
        const value = typeof task === 'function' ? task(result) : task;
        const done = v => run(rest, v);

        // check against nil values
        if (value != null) {
          if (value === CANCEL) return
          if (value.then) return value.then(done, reject)
        }

        return Promise.resolve(done(value))
      })(tasks)
    })
  }

  // Store the erre the API methods to handle the plugins installation
  const API_METHODS = new Set();
  const UNSUBSCRIBE_SYMBOL = Symbol();
  const UNSUBSCRIBE_METHOD = 'off';
  const CANCEL_METHOD = 'cancel';

  /**
   * Factory function to create the stream generator
   * @private
   * @param {Set} modifiers - stream input modifiers
   * @returns {Generator} the stream generator
   */
  function createStream(modifiers) {
    const stream = (function *stream() {
      while (true) {
        // get the initial stream value
        const input = yield;

        // run the input sequence
        yield ruit(input, ...modifiers);
      }
    })();

    // start the stream
    stream.next();

    return stream
  }

  /**
   * Dispatch a value to several listeners
   * @private
   * @param   {Set} callbacks - callbacks collection
   * @param   {*} value - anything
   * @returns {Set} the callbacks received
   */
  function dispatch(callbacks, value) {
    callbacks.forEach(f => {
      // unsubscribe the callback if erre.unsubscribe() will be returned
      if (f(value) === UNSUBSCRIBE_SYMBOL) callbacks.delete(f);
    });

    return callbacks
  }

  /**
   * Throw a panic error
   * @param {string} message - error message
   * @returns {Error} an error object
   */
  function panic(message) {
    throw new Error(message)
  }

  /**
   * Install an erre plugin adding it to the API
   * @param   {string} name - plugin name
   * @param   {Function} fn - new erre API method
   * @returns {Function} return the erre function
   */
  erre.install = function(name, fn) {
    if (!name || typeof name !== 'string')
      panic('Please provide a name (as string) for your erre plugin');
    if (!fn || typeof fn !== 'function')
      panic('Please provide a function for your erre plugin');

    if (API_METHODS.has(name)) {
      panic(`The ${name} is already part of the erre API, please provide a different name`);
    } else {
      erre[name] = fn;
      API_METHODS.add(name);
    }

    return erre
  };

  // alias for ruit canel to stop a stream chain
  erre.install(CANCEL_METHOD, ruit.cancel);

  // unsubscribe helper
  erre.install(UNSUBSCRIBE_METHOD, () => UNSUBSCRIBE_SYMBOL);

  /**
   * Stream constuction function
   * @param   {...Function} fns - stream modifiers
   * @returns {Object} erre instance
   */
  function erre(...fns) {
    const
      [success, error, end, modifiers] = [new Set(), new Set(), new Set(), new Set(fns)],
      generator = createStream(modifiers),
      stream = Object.create(generator),
      addToCollection = (collection) => (fn) => collection.add(fn) && stream,
      deleteFromCollection = (collection) => (fn) => collection.delete(fn) ? stream
        : panic('Couldn\'t remove handler passed by reference');

    return Object.assign(stream, {
      on: Object.freeze({
        value: addToCollection(success),
        error: addToCollection(error),
        end: addToCollection(end)
      }),
      off: Object.freeze({
        value: deleteFromCollection(success),
        error: deleteFromCollection(error),
        end: deleteFromCollection(end)
      }),
      connect: addToCollection(modifiers),
      push(input) {
        const { value, done } = stream.next(input);

        // dispatch the stream events
        if (!done) {
          value.then(
            res => dispatch(success, res),
            err => dispatch(error, err)
          );
        }

        return stream
      },
      end() {
        // kill the stream
        generator.return();
        // dispatch the end event
        dispatch(end)
        // clean up all the collections
        ;[success, error, end, modifiers].forEach(el => el.clear());

        return stream
      },
      fork() {
        return erre(...modifiers)
      },
      next(input) {
        // get the input and run eventually the promise
        const result = generator.next(input);

        // pause to the next iteration
        generator.next();

        return result
      }
    })
  }

  /**
   * Expose `pathToRegexp`.
   */
  var pathToRegexp_1 = pathToRegexp;
  var parse_1 = parse;
  var compile_1 = compile;
  var tokensToFunction_1 = tokensToFunction;
  var tokensToRegExp_1 = tokensToRegExp;

  /**
   * Default configs.
   */
  var DEFAULT_DELIMITER = '/';

  /**
   * The main path matching regexp utility.
   *
   * @type {RegExp}
   */
  var PATH_REGEXP = new RegExp([
    // Match escaped characters that would otherwise appear in future matches.
    // This allows the user to escape special characters that won't transform.
    '(\\\\.)',
    // Match Express-style parameters and un-named parameters with a prefix
    // and optional suffixes. Matches appear as:
    //
    // ":test(\\d+)?" => ["test", "\d+", undefined, "?"]
    // "(\\d+)"  => [undefined, undefined, "\d+", undefined]
    '(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?'
  ].join('|'), 'g');

  /**
   * Parse a string for the raw tokens.
   *
   * @param  {string}  str
   * @param  {Object=} options
   * @return {!Array}
   */
  function parse (str, options) {
    var tokens = [];
    var key = 0;
    var index = 0;
    var path = '';
    var defaultDelimiter = (options && options.delimiter) || DEFAULT_DELIMITER;
    var whitelist = (options && options.whitelist) || undefined;
    var pathEscaped = false;
    var res;

    while ((res = PATH_REGEXP.exec(str)) !== null) {
      var m = res[0];
      var escaped = res[1];
      var offset = res.index;
      path += str.slice(index, offset);
      index = offset + m.length;

      // Ignore already escaped sequences.
      if (escaped) {
        path += escaped[1];
        pathEscaped = true;
        continue
      }

      var prev = '';
      var name = res[2];
      var capture = res[3];
      var group = res[4];
      var modifier = res[5];

      if (!pathEscaped && path.length) {
        var k = path.length - 1;
        var c = path[k];
        var matches = whitelist ? whitelist.indexOf(c) > -1 : true;

        if (matches) {
          prev = c;
          path = path.slice(0, k);
        }
      }

      // Push the current path onto the tokens.
      if (path) {
        tokens.push(path);
        path = '';
        pathEscaped = false;
      }

      var repeat = modifier === '+' || modifier === '*';
      var optional = modifier === '?' || modifier === '*';
      var pattern = capture || group;
      var delimiter = prev || defaultDelimiter;

      tokens.push({
        name: name || key++,
        prefix: prev,
        delimiter: delimiter,
        optional: optional,
        repeat: repeat,
        pattern: pattern
          ? escapeGroup(pattern)
          : '[^' + escapeString(delimiter === defaultDelimiter ? delimiter : (delimiter + defaultDelimiter)) + ']+?'
      });
    }

    // Push any remaining characters.
    if (path || index < str.length) {
      tokens.push(path + str.substr(index));
    }

    return tokens
  }

  /**
   * Compile a string to a template function for the path.
   *
   * @param  {string}             str
   * @param  {Object=}            options
   * @return {!function(Object=, Object=)}
   */
  function compile (str, options) {
    return tokensToFunction(parse(str, options), options)
  }

  /**
   * Expose a method for transforming tokens into the path function.
   */
  function tokensToFunction (tokens, options) {
    // Compile all the tokens into regexps.
    var matches = new Array(tokens.length);

    // Compile all the patterns before compilation.
    for (var i = 0; i < tokens.length; i++) {
      if (typeof tokens[i] === 'object') {
        matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$', flags(options));
      }
    }

    return function (data, options) {
      var path = '';
      var encode = (options && options.encode) || encodeURIComponent;
      var validate = options ? options.validate !== false : true;

      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];

        if (typeof token === 'string') {
          path += token;
          continue
        }

        var value = data ? data[token.name] : undefined;
        var segment;

        if (Array.isArray(value)) {
          if (!token.repeat) {
            throw new TypeError('Expected "' + token.name + '" to not repeat, but got array')
          }

          if (value.length === 0) {
            if (token.optional) continue

            throw new TypeError('Expected "' + token.name + '" to not be empty')
          }

          for (var j = 0; j < value.length; j++) {
            segment = encode(value[j], token);

            if (validate && !matches[i].test(segment)) {
              throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '"')
            }

            path += (j === 0 ? token.prefix : token.delimiter) + segment;
          }

          continue
        }

        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          segment = encode(String(value), token);

          if (validate && !matches[i].test(segment)) {
            throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but got "' + segment + '"')
          }

          path += token.prefix + segment;
          continue
        }

        if (token.optional) continue

        throw new TypeError('Expected "' + token.name + '" to be ' + (token.repeat ? 'an array' : 'a string'))
      }

      return path
    }
  }

  /**
   * Escape a regular expression string.
   *
   * @param  {string} str
   * @return {string}
   */
  function escapeString (str) {
    return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1')
  }

  /**
   * Escape the capturing group by escaping special characters and meaning.
   *
   * @param  {string} group
   * @return {string}
   */
  function escapeGroup (group) {
    return group.replace(/([=!:$/()])/g, '\\$1')
  }

  /**
   * Get the flags for a regexp from the options.
   *
   * @param  {Object} options
   * @return {string}
   */
  function flags (options) {
    return options && options.sensitive ? '' : 'i'
  }

  /**
   * Pull out keys from a regexp.
   *
   * @param  {!RegExp} path
   * @param  {Array=}  keys
   * @return {!RegExp}
   */
  function regexpToRegexp (path, keys) {
    if (!keys) return path

    // Use a negative lookahead to match only capturing groups.
    var groups = path.source.match(/\((?!\?)/g);

    if (groups) {
      for (var i = 0; i < groups.length; i++) {
        keys.push({
          name: i,
          prefix: null,
          delimiter: null,
          optional: false,
          repeat: false,
          pattern: null
        });
      }
    }

    return path
  }

  /**
   * Transform an array into a regexp.
   *
   * @param  {!Array}  path
   * @param  {Array=}  keys
   * @param  {Object=} options
   * @return {!RegExp}
   */
  function arrayToRegexp (path, keys, options) {
    var parts = [];

    for (var i = 0; i < path.length; i++) {
      parts.push(pathToRegexp(path[i], keys, options).source);
    }

    return new RegExp('(?:' + parts.join('|') + ')', flags(options))
  }

  /**
   * Create a path regexp from string input.
   *
   * @param  {string}  path
   * @param  {Array=}  keys
   * @param  {Object=} options
   * @return {!RegExp}
   */
  function stringToRegexp (path, keys, options) {
    return tokensToRegExp(parse(path, options), keys, options)
  }

  /**
   * Expose a function for taking tokens and returning a RegExp.
   *
   * @param  {!Array}  tokens
   * @param  {Array=}  keys
   * @param  {Object=} options
   * @return {!RegExp}
   */
  function tokensToRegExp (tokens, keys, options) {
    options = options || {};

    var strict = options.strict;
    var start = options.start !== false;
    var end = options.end !== false;
    var delimiter = options.delimiter || DEFAULT_DELIMITER;
    var endsWith = [].concat(options.endsWith || []).map(escapeString).concat('$').join('|');
    var route = start ? '^' : '';

    // Iterate over the tokens and create our regexp string.
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];

      if (typeof token === 'string') {
        route += escapeString(token);
      } else {
        var capture = token.repeat
          ? '(?:' + token.pattern + ')(?:' + escapeString(token.delimiter) + '(?:' + token.pattern + '))*'
          : token.pattern;

        if (keys) keys.push(token);

        if (token.optional) {
          if (!token.prefix) {
            route += '(' + capture + ')?';
          } else {
            route += '(?:' + escapeString(token.prefix) + '(' + capture + '))?';
          }
        } else {
          route += escapeString(token.prefix) + '(' + capture + ')';
        }
      }
    }

    if (end) {
      if (!strict) route += '(?:' + escapeString(delimiter) + ')?';

      route += endsWith === '$' ? '$' : '(?=' + endsWith + ')';
    } else {
      var endToken = tokens[tokens.length - 1];
      var isEndDelimited = typeof endToken === 'string'
        ? endToken[endToken.length - 1] === delimiter
        : endToken === undefined;

      if (!strict) route += '(?:' + escapeString(delimiter) + '(?=' + endsWith + '))?';
      if (!isEndDelimited) route += '(?=' + escapeString(delimiter) + '|' + endsWith + ')';
    }

    return new RegExp(route, flags(options))
  }

  /**
   * Normalize the given path string, returning a regular expression.
   *
   * An empty array can be passed in for the keys, which will hold the
   * placeholder key descriptions. For example, using `/user/:id`, `keys` will
   * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
   *
   * @param  {(string|RegExp|Array)} path
   * @param  {Array=}                keys
   * @param  {Object=}               options
   * @return {!RegExp}
   */
  function pathToRegexp (path, keys, options) {
    if (path instanceof RegExp) {
      return regexpToRegexp(path, keys)
    }

    if (Array.isArray(path)) {
      return arrayToRegexp(/** @type {!Array} */ (path), keys, options)
    }

    return stringToRegexp(/** @type {string} */ (path), keys, options)
  }
  pathToRegexp_1.parse = parse_1;
  pathToRegexp_1.compile = compile_1;
  pathToRegexp_1.tokensToFunction = tokensToFunction_1;
  pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;

  // check whether the window object is defined
  const hasWindow = typeof window !== 'undefined';

  // the url parsing function depends on the platform, on node we rely on the 'url' module
  /* istanbul ignore next */
  const parseURL = (...args) => hasWindow ? new URL(...args) : require('url').parse(...args);

  /**
   * Replace the base path from a path
   * @param   {string} path - router path string
   * @returns {string} path cleaned up without the base
   */
  const replaceBase = path => path.replace(defaults.base, '');

  /**
   * Combine 2 streams connecting the events of dispatcherStream to the receiverStream
   * @param   {Stream} dispatcherStream - main stream dispatching events
   * @param   {Stream} receiverStream - sub stream receiving events from the dispatcher
   * @returns {Stream} receiverStream
   */
  const joinStreams = (dispatcherStream, receiverStream) => {
    dispatcherStream.on.value(receiverStream.push);

    receiverStream.on.end(() => {
      dispatcherStream.off.value(receiverStream.push);
    });

    return receiverStream
  };

  // create the streaming router
  const router = erre(String); // cast the values of this stream always to string

  /* @type {object} general configuration object */
  const defaults = {
    // custom option
    base: '',
    // pathToRegexp options
    sensitive: false,
    strict: false,
    end: true,
    start: true,
    delimiter: '/',
    endsWith: undefined,
    whitelist: undefined
  };

  /**
   * Merge the user options with the defaults
   * @param   {Object} options - custom user options
   * @returns {Object} options object merged with defaults
   */
  const mergeOptions = options => ({...defaults, ...options});

  /**
   * Parse a string path generating an object containing
   * @param   {string} path - target path
   * @param   {RegExp} pathRegExp - path transformed to regexp via pathToRegexp
   * @param   {Object} options - object containing the base path
   * @returns {URL} url object enhanced with the `match` attribute
   */
  const parse$1 = (path, pathRegExp, options) => {
    const {base} = mergeOptions(options);
    const [, ...params] = pathRegExp.exec(path);
    const url = parseURL(path, base);

    // extend the url object adding the matched params
    url.params = params;

    return url
  };

  /**
   * Return true if a path will be matched
   * @param   {string} path - target path
   * @param   {RegExp} pathRegExp - path transformed to regexp via pathToRegexp
   * @returns {boolean} true if the path matches the regexp
   */
  const match = (path, pathRegExp) => pathRegExp.test(path);

  /**
   * Create a fork of the main router stream
   * @param   {string} path - route to match
   * @param   {Object} options - pathToRegexp options object
   * @returns {Stream} new route stream
   */
  function createRoute(path, options) {
    const pathRegExp = pathToRegexp_1(path);
    const matchOrSkip = path => match(path, pathRegExp) ? path : erre.cancel();
    const parseRoute = path => parse$1(path, pathRegExp, options);

    return joinStreams(router, erre(
      replaceBase,
      matchOrSkip,
      parseRoute
    ))
  }

  /**
   * Converts any DOM node/s to a loopable array
   * @param   { HTMLElement|NodeList } els - single html element or a node list
   * @returns { Array } always a loopable object
   */
  function domToArray(els) {
    // can this object be already looped?
    if (!Array.isArray(els)) {
      // is it a node list?
      if (
        /^\[object (HTMLCollection|NodeList|Object)\]$/
          .test(Object.prototype.toString.call(els))
          && typeof els.length === 'number'
      )
        return Array.from(els)
      else
        // if it's a single node
        // it will be returned as "array" with one single entry
        return [els]
    }
    // this object could be looped out of the box
    return els
  }

  /**
   * Split a string into several items separed by spaces
   * @param   { string } l - events list
   * @returns { Array } all the events detected
   * @private
   */
  const split = l => l.split(/\s/);

  /**
   * Set a listener for all the events received separated by spaces
   * @param   { HTMLElement|NodeList|Array } els     - DOM node/s where the listeners will be bound
   * @param   { string }                     evList  - list of events we want to bind or unbind space separated
   * @param   { Function }                   cb      - listeners callback
   * @param   { string }                     method  - either 'addEventListener' or 'removeEventListener'
   * @param   { Object }                     options - event options (capture, once and passive)
   * @returns { undefined }
   * @private
   */
  function manageEvents(els, evList, cb, method, options) {
    els = domToArray(els);

    split(evList).forEach((e) => {
      els.forEach(el => el[method](e, cb, options || false));
    });
  }

  /**
   * Set a listener for all the events received separated by spaces
   * @param   { HTMLElement|Array } els    - DOM node/s where the listeners will be bound
   * @param   { string }            evList - list of events we want to bind space separated
   * @param   { Function }          cb     - listeners callback
   * @param   { Object }            options - event options (capture, once and passive)
   * @returns { HTMLElement|NodeList|Array } DOM node/s and first argument of the function
   */
  function add(els, evList, cb, options) {
    manageEvents(els, evList, cb, 'addEventListener', options);
    return els
  }

  /**
   * Remove all the listeners for the events received separated by spaces
   * @param   { HTMLElement|Array } els     - DOM node/s where the events will be unbind
   * @param   { string }            evList  - list of events we want unbind space separated
   * @param   { Function }          cb      - listeners callback
   * @param   { Object }             options - event options (capture, once and passive)
   * @returns { HTMLElement|NodeList|Array }  DOM node/s and first argument of the function
   */
  function remove(els, evList, cb, options) {
    manageEvents(els, evList, cb, 'removeEventListener', options);
    return els
  }

  /**
   * Normalize the return values, in case of a single value we avoid to return an array
   * @param   { Array } values - list of values we want to return
   * @returns { Array|string|boolean } either the whole list of values or the single one found
   * @private
   */
  const normalize = values => values.length === 1 ? values[0] : values;

  /**
   * Parse all the nodes received to get/remove/check their attributes
   * @param   { HTMLElement|NodeList|Array } els    - DOM node/s to parse
   * @param   { string|Array }               name   - name or list of attributes
   * @param   { string }                     method - method that will be used to parse the attributes
   * @returns { Array|string } result of the parsing in a list or a single value
   * @private
   */
  function parseNodes(els, name, method) {
    const names = typeof name === 'string' ? [name] : name;
    return normalize(domToArray(els).map(el => {
      return normalize(names.map(n => el[method](n)))
    }))
  }

  /**
   * Set any attribute on a single or a list of DOM nodes
   * @param   { HTMLElement|NodeList|Array } els   - DOM node/s to parse
   * @param   { string|Array }               name  - name or list of attributes to detect
   * @returns { boolean|Array } true or false or an array of boolean values
   * @example
   *
   * import { has } from 'bianco.attr'
   *
   * has(img, 'width') // false
   *
   * // or also
   * has(img, ['width', 'height']) // => [false, false]
   *
   * // or also
   * has([img1, img2], ['width', 'height']) // => [[false, false], [false, false]]
   */
  function has(els, name) {
    return parseNodes(els, name, 'hasAttribute')
  }

  const WINDOW_EVENTS = 'popstate hashchange';
  const CLICK_EVENT = 'click';
  const DOWNLOAD_LINK_ATTRIBUTE = 'download';
  const HREF_LINK_ATTRIBUTE = 'href';
  const TARGET_SELF_LINK_ATTRIBUTE = '_self';
  const LINK_TAG_NAME = 'A';
  const HASH = '#';
  const RE_ORIGIN = /^.+?\/\/+[^/]+/;
  const UNDEFINED = 'undefined';

  const win = typeof window !== UNDEFINED && window;
  const doc = typeof document !== UNDEFINED && document;
  const hist = win && history;
  const loc = win && (hist.location || win.location);

  const onWindowEvent = () => router.push(loc.href);
  const getLinkElement = node => node && !isLinkNode(node) ? getLinkElement(node.parentNode) : node;
  const isLinkNode = node => node.nodeName === LINK_TAG_NAME;
  const isCrossOriginLink = path => path.indexOf(loc.href.match(RE_ORIGIN)[0]) === -1;
  const isTargetSelfLink = el => el.target && el.target !== TARGET_SELF_LINK_ATTRIBUTE;
  const isEventForbidden = event => event.which !== 1 // not left click
      || event.metaKey || event.ctrlKey || event.shiftKey // or meta keys
      || event.defaultPrevented; // or default prevented
  const isForbiddenLink = el => !el || !isLinkNode(el) // not A tag
      || has(el, DOWNLOAD_LINK_ATTRIBUTE) // has download attr
      || !has(el, HREF_LINK_ATTRIBUTE) // has no href attr
      || isTargetSelfLink(el.target)
      || isCrossOriginLink(el.href);
  const isHashLink = path => Boolean(path.split(HASH).length);

  /**
   * Callback called anytime something will be clicked on the page
   * @param   {HTMLEvent} event - click event
   * @returns {undefined} void method
   */
  const onClick = event => {
    if (isEventForbidden(event)) return

    const el = getLinkElement(event.target);

    if (isForbiddenLink(el)) return

    router.push(el.href);

    if (!isHashLink(el.href)) {
      hist.pushState(null, el.title || doc.title, el.href);
      event.preventDefault();
    }
  };

  /**
   * Link the rawth router to the DOM events
   * @returns {Function} teardown function
   */
  function initDomListeners() {
    add(win, WINDOW_EVENTS, onWindowEvent);
    add(doc, CLICK_EVENT, onClick);

    return () => {
      remove(win, WINDOW_EVENTS, onWindowEvent);
      remove(doc, CLICK_EVENT, onClick);
    }
  }

  const route = createRoute;
  const router$1 = router;
  const listenDOMEvents = initDomListeners;

  exports.listenDOMEvents = listenDOMEvents;
  exports.route = route;
  exports.router = router$1;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
