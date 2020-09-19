(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('./components/route-hoc.riot'), require('./components/router-hoc.riot')) :
    typeof define === 'function' && define.amd ? define(['exports', './components/route-hoc.riot', './components/router-hoc.riot'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.route = {}, global.routeHoc_riot, global.routerHoc_riot));
}(this, (function (exports, routeHoc_riot, routerHoc_riot) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var routeHoc_riot__default = /*#__PURE__*/_interopDefaultLegacy(routeHoc_riot);
    var routerHoc_riot__default = /*#__PURE__*/_interopDefaultLegacy(routerHoc_riot);

    /**
     * Tokenize input string.
     */
    function lexer(str) {
      var tokens = [];
      var i = 0;

      while (i < str.length) {
        var char = str[i];

        if (char === "*" || char === "+" || char === "?") {
          tokens.push({
            type: "MODIFIER",
            index: i,
            value: str[i++]
          });
          continue;
        }

        if (char === "\\") {
          tokens.push({
            type: "ESCAPED_CHAR",
            index: i++,
            value: str[i++]
          });
          continue;
        }

        if (char === "{") {
          tokens.push({
            type: "OPEN",
            index: i,
            value: str[i++]
          });
          continue;
        }

        if (char === "}") {
          tokens.push({
            type: "CLOSE",
            index: i,
            value: str[i++]
          });
          continue;
        }

        if (char === ":") {
          var name = "";
          var j = i + 1;

          while (j < str.length) {
            var code = str.charCodeAt(j);

            if ( // `0-9`
            code >= 48 && code <= 57 || // `A-Z`
            code >= 65 && code <= 90 || // `a-z`
            code >= 97 && code <= 122 || // `_`
            code === 95) {
              name += str[j++];
              continue;
            }

            break;
          }

          if (!name) throw new TypeError("Missing parameter name at " + i);
          tokens.push({
            type: "NAME",
            index: i,
            value: name
          });
          i = j;
          continue;
        }

        if (char === "(") {
          var count = 1;
          var pattern = "";
          var j = i + 1;

          if (str[j] === "?") {
            throw new TypeError("Pattern cannot start with \"?\" at " + j);
          }

          while (j < str.length) {
            if (str[j] === "\\") {
              pattern += str[j++] + str[j++];
              continue;
            }

            if (str[j] === ")") {
              count--;

              if (count === 0) {
                j++;
                break;
              }
            } else if (str[j] === "(") {
              count++;

              if (str[j + 1] !== "?") {
                throw new TypeError("Capturing groups are not allowed at " + j);
              }
            }

            pattern += str[j++];
          }

          if (count) throw new TypeError("Unbalanced pattern at " + i);
          if (!pattern) throw new TypeError("Missing pattern at " + i);
          tokens.push({
            type: "PATTERN",
            index: i,
            value: pattern
          });
          i = j;
          continue;
        }

        tokens.push({
          type: "CHAR",
          index: i,
          value: str[i++]
        });
      }

      tokens.push({
        type: "END",
        index: i,
        value: ""
      });
      return tokens;
    }
    /**
     * Parse a string for the raw tokens.
     */


    function parse(str, options) {
      if (options === void 0) {
        options = {};
      }

      var tokens = lexer(str);
      var _a = options.prefixes,
          prefixes = _a === void 0 ? "./" : _a;
      var defaultPattern = "[^" + escapeString(options.delimiter || "/#?") + "]+?";
      var result = [];
      var key = 0;
      var i = 0;
      var path = "";

      var tryConsume = function tryConsume(type) {
        if (i < tokens.length && tokens[i].type === type) return tokens[i++].value;
      };

      var mustConsume = function mustConsume(type) {
        var value = tryConsume(type);
        if (value !== undefined) return value;
        var _a = tokens[i],
            nextType = _a.type,
            index = _a.index;
        throw new TypeError("Unexpected " + nextType + " at " + index + ", expected " + type);
      };

      var consumeText = function consumeText() {
        var result = "";
        var value; // tslint:disable-next-line

        while (value = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
          result += value;
        }

        return result;
      };

      while (i < tokens.length) {
        var char = tryConsume("CHAR");
        var name = tryConsume("NAME");
        var pattern = tryConsume("PATTERN");

        if (name || pattern) {
          var prefix = char || "";

          if (prefixes.indexOf(prefix) === -1) {
            path += prefix;
            prefix = "";
          }

          if (path) {
            result.push(path);
            path = "";
          }

          result.push({
            name: name || key++,
            prefix: prefix,
            suffix: "",
            pattern: pattern || defaultPattern,
            modifier: tryConsume("MODIFIER") || ""
          });
          continue;
        }

        var value = char || tryConsume("ESCAPED_CHAR");

        if (value) {
          path += value;
          continue;
        }

        if (path) {
          result.push(path);
          path = "";
        }

        var open = tryConsume("OPEN");

        if (open) {
          var prefix = consumeText();
          var name_1 = tryConsume("NAME") || "";
          var pattern_1 = tryConsume("PATTERN") || "";
          var suffix = consumeText();
          mustConsume("CLOSE");
          result.push({
            name: name_1 || (pattern_1 ? key++ : ""),
            pattern: name_1 && !pattern_1 ? defaultPattern : pattern_1,
            prefix: prefix,
            suffix: suffix,
            modifier: tryConsume("MODIFIER") || ""
          });
          continue;
        }

        mustConsume("END");
      }

      return result;
    }
    /**
     * Compile a string to a template function for the path.
     */

    function compile(str, options) {
      return tokensToFunction(parse(str, options), options);
    }
    /**
     * Expose a method for transforming tokens into the path function.
     */

    function tokensToFunction(tokens, options) {
      if (options === void 0) {
        options = {};
      }

      var reFlags = flags(options);
      var _a = options.encode,
          encode = _a === void 0 ? function (x) {
        return x;
      } : _a,
          _b = options.validate,
          validate = _b === void 0 ? true : _b; // Compile all the tokens into regexps.

      var matches = tokens.map(function (token) {
        if (typeof token === "object") {
          return new RegExp("^(?:" + token.pattern + ")$", reFlags);
        }
      });
      return function (data) {
        var path = "";

        for (var i = 0; i < tokens.length; i++) {
          var token = tokens[i];

          if (typeof token === "string") {
            path += token;
            continue;
          }

          var value = data ? data[token.name] : undefined;
          var optional = token.modifier === "?" || token.modifier === "*";
          var repeat = token.modifier === "*" || token.modifier === "+";

          if (Array.isArray(value)) {
            if (!repeat) {
              throw new TypeError("Expected \"" + token.name + "\" to not repeat, but got an array");
            }

            if (value.length === 0) {
              if (optional) continue;
              throw new TypeError("Expected \"" + token.name + "\" to not be empty");
            }

            for (var j = 0; j < value.length; j++) {
              var segment = encode(value[j], token);

              if (validate && !matches[i].test(segment)) {
                throw new TypeError("Expected all \"" + token.name + "\" to match \"" + token.pattern + "\", but got \"" + segment + "\"");
              }

              path += token.prefix + segment + token.suffix;
            }

            continue;
          }

          if (typeof value === "string" || typeof value === "number") {
            var segment = encode(String(value), token);

            if (validate && !matches[i].test(segment)) {
              throw new TypeError("Expected \"" + token.name + "\" to match \"" + token.pattern + "\", but got \"" + segment + "\"");
            }

            path += token.prefix + segment + token.suffix;
            continue;
          }

          if (optional) continue;
          var typeOfMessage = repeat ? "an array" : "a string";
          throw new TypeError("Expected \"" + token.name + "\" to be " + typeOfMessage);
        }

        return path;
      };
    }
    /**
     * Escape a regular expression string.
     */

    function escapeString(str) {
      return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
    }
    /**
     * Get the flags for a regexp from the options.
     */


    function flags(options) {
      return options && options.sensitive ? "" : "i";
    }
    /**
     * Pull out keys from a regexp.
     */


    function regexpToRegexp(path, keys) {
      if (!keys) return path; // Use a negative lookahead to match only capturing groups.

      var groups = path.source.match(/\((?!\?)/g);

      if (groups) {
        for (var i = 0; i < groups.length; i++) {
          keys.push({
            name: i,
            prefix: "",
            suffix: "",
            modifier: "",
            pattern: ""
          });
        }
      }

      return path;
    }
    /**
     * Transform an array into a regexp.
     */


    function arrayToRegexp(paths, keys, options) {
      var parts = paths.map(function (path) {
        return pathToRegexp(path, keys, options).source;
      });
      return new RegExp("(?:" + parts.join("|") + ")", flags(options));
    }
    /**
     * Create a path regexp from string input.
     */


    function stringToRegexp(path, keys, options) {
      return tokensToRegexp(parse(path, options), keys, options);
    }
    /**
     * Expose a function for taking tokens and returning a RegExp.
     */


    function tokensToRegexp(tokens, keys, options) {
      if (options === void 0) {
        options = {};
      }

      var _a = options.strict,
          strict = _a === void 0 ? false : _a,
          _b = options.start,
          start = _b === void 0 ? true : _b,
          _c = options.end,
          end = _c === void 0 ? true : _c,
          _d = options.encode,
          encode = _d === void 0 ? function (x) {
        return x;
      } : _d;
      var endsWith = "[" + escapeString(options.endsWith || "") + "]|$";
      var delimiter = "[" + escapeString(options.delimiter || "/#?") + "]";
      var route = start ? "^" : ""; // Iterate over the tokens and create our regexp string.

      for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
        var token = tokens_1[_i];

        if (typeof token === "string") {
          route += escapeString(encode(token));
        } else {
          var prefix = escapeString(encode(token.prefix));
          var suffix = escapeString(encode(token.suffix));

          if (token.pattern) {
            if (keys) keys.push(token);

            if (prefix || suffix) {
              if (token.modifier === "+" || token.modifier === "*") {
                var mod = token.modifier === "*" ? "?" : "";
                route += "(?:" + prefix + "((?:" + token.pattern + ")(?:" + suffix + prefix + "(?:" + token.pattern + "))*)" + suffix + ")" + mod;
              } else {
                route += "(?:" + prefix + "(" + token.pattern + ")" + suffix + ")" + token.modifier;
              }
            } else {
              route += "(" + token.pattern + ")" + token.modifier;
            }
          } else {
            route += "(?:" + prefix + suffix + ")" + token.modifier;
          }
        }
      }

      if (end) {
        if (!strict) route += delimiter + "?";
        route += !options.endsWith ? "$" : "(?=" + endsWith + ")";
      } else {
        var endToken = tokens[tokens.length - 1];
        var isEndDelimited = typeof endToken === "string" ? delimiter.indexOf(endToken[endToken.length - 1]) > -1 : // tslint:disable-next-line
        endToken === undefined;

        if (!strict) {
          route += "(?:" + delimiter + "(?=" + endsWith + "))?";
        }

        if (!isEndDelimited) {
          route += "(?=" + delimiter + "|" + endsWith + ")";
        }
      }

      return new RegExp(route, flags(options));
    }
    /**
     * Normalize the given path string, returning a regular expression.
     *
     * An empty array can be passed in for the keys, which will hold the
     * placeholder key descriptions. For example, using `/user/:id`, `keys` will
     * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
     */

    function pathToRegexp(path, keys, options) {
      if (path instanceof RegExp) return regexpToRegexp(path, keys);
      if (Array.isArray(path)) return arrayToRegexp(path, keys, options);
      return stringToRegexp(path, keys, options);
    }

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


    ruit.compose = function () {
      for (var _len = arguments.length, tasks = new Array(_len), _key = 0; _key < _len; _key++) {
        tasks[_key] = arguments[_key];
      }

      return ruit(...tasks.reverse());
    };
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


    function ruit() {
      for (var _len2 = arguments.length, tasks = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        tasks[_key2] = arguments[_key2];
      }

      return new Promise((resolve, reject) => {
        return function run(queue, result) {
          if (!queue.length) return resolve(result);
          const [task, ...rest] = queue;
          const value = typeof task === 'function' ? task(result) : task;

          const done = v => run(rest, v); // check against nil values


          if (value != null) {
            if (value === CANCEL) return;
            if (value.then) return value.then(done, reject);
          }

          return Promise.resolve(done(value));
        }(tasks);
      });
    }

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
      const stream = function* stream() {
        while (true) {
          // get the initial stream value
          const input = yield; // run the input sequence

          yield ruit(input, ...modifiers);
        }
      }(); // start the stream


      stream.next();
      return stream;
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
      return callbacks;
    }
    /**
     * Throw a panic error
     * @param {string} message - error message
     * @returns {Error} an error object
     */


    function panic(message) {
      throw new Error(message);
    }
    /**
     * Install an erre plugin adding it to the API
     * @param   {string} name - plugin name
     * @param   {Function} fn - new erre API method
     * @returns {Function} return the erre function
     */


    erre.install = function (name, fn) {
      if (!name || typeof name !== 'string') panic('Please provide a name (as string) for your erre plugin');
      if (!fn || typeof fn !== 'function') panic('Please provide a function for your erre plugin');

      if (API_METHODS.has(name)) {
        panic(`The ${name} is already part of the erre API, please provide a different name`);
      } else {
        erre[name] = fn;
        API_METHODS.add(name);
      }

      return erre;
    }; // alias for ruit canel to stop a stream chain


    erre.install(CANCEL_METHOD, ruit.cancel); // unsubscribe helper

    erre.install(UNSUBSCRIBE_METHOD, () => UNSUBSCRIBE_SYMBOL);
    /**
     * Stream constuction function
     * @param   {...Function} fns - stream modifiers
     * @returns {Object} erre instance
     */

    function erre() {
      for (var _len = arguments.length, fns = new Array(_len), _key = 0; _key < _len; _key++) {
        fns[_key] = arguments[_key];
      }

      const [success, error, end, modifiers] = [new Set(), new Set(), new Set(), new Set(fns)],
            generator = createStream(modifiers),
            stream = Object.create(generator),
            addToCollection = collection => fn => collection.add(fn) && stream,
            deleteFromCollection = collection => fn => collection.delete(fn) ? stream : panic('Couldn\'t remove handler passed by reference');

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
          const {
            value,
            done
          } = stream.next(input); // dispatch the stream events

          if (!done) {
            value.then(res => dispatch(success, res), err => dispatch(error, err));
          }

          return stream;
        },

        end() {
          // kill the stream
          generator.return(); // dispatch the end event

          dispatch(end) // clean up all the collections
          ;
          [success, error, end, modifiers].forEach(el => el.clear());
          return stream;
        },

        fork() {
          return erre(...modifiers);
        },

        next(input) {
          // get the input and run eventually the promise
          const result = generator.next(input); // pause to the next iteration

          generator.next();
          return result;
        }

      });
    }

    const isNode = typeof process !== 'undefined';

    const isString = str => typeof str === 'string'; // the url parsing function depends on the platform, on node we rely on the 'url' module

    /* istanbul ignore next */


    const parseURL = function parseURL() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return isNode ? require('url').parse(...args) : new URL(...args);
    };
    /**
     * Replace the base path from a path
     * @param   {string} path - router path string
     * @returns {string} path cleaned up without the base
     */


    const replaceBase = path => path.replace(defaults.base, '');
    /**
     * Try to match the current path or skip it
     * @param   {RegEx} pathRegExp - target path transformed by pathToRegexp
     * @returns {string|Symbol} if the path match we return it otherwise we cancel the stream
     */


    const matchOrSkip = pathRegExp => path => match(path, pathRegExp) ? path : erre.cancel();
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
      return receiverStream;
    };
    /**
     * Error handling function
     * @param   {Error} error - error to catch
     * @returns {void}
     */


    const panic$1 = error => {
      if (defaults.silentErrors) return;
      throw new Error(error);
    }; // make sure that the router will always receive strings params


    const filterStrings = str => isString(str) ? str : erre.cancel(); // create the streaming router

    const router = erre(filterStrings).on.error(panic$1); // cast the values of this stream always to string

    /* @type {object} general configuration object */

    const defaults = {
      // custom option
      base: '',
      silentErrors: false,
      // pathToRegexp options
      sensitive: false,
      strict: false,
      end: true,
      start: true,
      delimiter: '/#?',
      encode: undefined,
      endsWith: undefined,
      prefixes: './'
    };
    /**
     * Merge the user options with the defaults
     * @param   {Object} options - custom user options
     * @returns {Object} options object merged with defaults
     */

    const mergeOptions = options => Object.assign({}, defaults, options);
    /* {@link https://github.com/pillarjs/path-to-regexp#usage} */

    const toRegexp = (path, keys, options) => pathToRegexp(path, keys, mergeOptions(options));
    /**
     * Convert a router entry to a real path computing the url parameters
     * @param   {string} path - router path string
     * @param   {Object} params - named matched parameters
     * @param   {Object} options - pathToRegexp options object
     * @returns {string} computed url string
     */

    const toPath = (path, params, options) => compile(path, mergeOptions(options))(params);
    /**
     * Parse a string path generating an object containing
     * @param   {string} path - target path
     * @param   {RegExp} pathRegExp - path transformed to regexp via pathToRegexp
     * @param   {Object} options - object containing the base path
     * @returns {URL} url object enhanced with the `match` attribute
     */

    const toURL = function toURL(path, pathRegExp, options) {
      if (options === void 0) {
        options = {};
      }

      const {
        base
      } = mergeOptions(options);
      const [, ...params] = pathRegExp.exec(path);
      const url = parseURL(path, base); // extend the url object adding the matched params

      url.params = params.reduce((acc, param, index) => {
        const key = options.keys && options.keys[index];
        if (key) acc[key.name] = param;
        return acc;
      }, {});
      return url;
    };
    /**
     * Return true if a path will be matched
     * @param   {string} path - target path
     * @param   {RegExp} pathRegExp - path transformed to regexp via pathToRegexp
     * @returns {boolean} true if the path matches the regexp
     */

    const match = (path, pathRegExp) => pathRegExp.test(path);
    /**
     * Factory function to create an sequence of functions to pass to erre.js
     * This function will be used in the erre stream
     * @param   {RegExp} pathRegExp - path transformed to regexp via pathToRegexp
     * @param   {Object} options - pathToRegexp options object
     * @returns {Array} a functions array that will be used as stream pipe for erre.js
     */

    const createURLStreamPipe = (pathRegExp, options) => [replaceBase, matchOrSkip(pathRegExp), path => toURL(path, pathRegExp, options)];
    /**
     * Create a fork of the main router stream
     * @param   {string} path - route to match
     * @param   {Object} options - pathToRegexp options object
     * @returns {Stream} new route stream
     */

    function createRoute(path, options) {
      const keys = [];
      const pathRegExp = pathToRegexp(path, keys, options);
      const URLStream = erre(...createURLStreamPipe(pathRegExp, Object.assign({}, options, {
        keys
      })));
      return joinStreams(router, URLStream).on.error(panic$1);
    }

    const getCurrentRoute = (currentRoute => {
      // listen the route changes events to store the current route
      router.on.value(r => currentRoute = r);
      return () => {
        return currentRoute;
      };
    })(null);

    const WINDOW_EVENTS = 'popstate';
    const CLICK_EVENT = 'click';
    const DOWNLOAD_LINK_ATTRIBUTE = 'download';
    const HREF_LINK_ATTRIBUTE = 'href';
    const TARGET_SELF_LINK_ATTRIBUTE = '_self';
    const LINK_TAG_NAME = 'A';
    const HASH = '#';
    const SLASH = '/';
    const RE_ORIGIN = /^.+?\/\/+[^/]+/;

    /**
     * Converts any DOM node/s to a loopable array
     * @param   { HTMLElement|NodeList } els - single html element or a node list
     * @returns { Array } always a loopable object
     */
    function domToArray(els) {
      // can this object be already looped?
      if (!Array.isArray(els)) {
        // is it a node list?
        if (/^\[object (HTMLCollection|NodeList|Object)\]$/.test(Object.prototype.toString.call(els)) && typeof els.length === 'number') return Array.from(els);else // if it's a single node
          // it will be returned as "array" with one single entry
          return [els];
      } // this object could be looped out of the box


      return els;
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
      split(evList).forEach(e => {
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
      return els;
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
      return els;
    }

    const getWindow = () => typeof window === 'undefined' ? null : window;
    const getDocument = () => typeof document === 'undefined' ? null : document;
    const getHistory = () => typeof history === 'undefined' ? null : history;
    const getLocation = () => {
      const win = getWindow();
      return win ? win.location : {};
    };

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
        return normalize(names.map(n => el[method](n)));
      }));
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
      return parseNodes(els, name, 'hasAttribute');
    }

    const onWindowEvent = () => router.push(normalizePath(String(getLocation().href)));

    const onRouterPush = path => {
      const url = path.includes(defaults.base) ? path : defaults.base + path;
      const loc = getLocation();
      const hist = getHistory();
      const doc = getDocument(); // update the browser history only if it's necessary

      if (hist && url !== loc.href) {
        hist.pushState(null, doc.title, url);
      }
    };

    const getLinkElement = node => node && !isLinkNode(node) ? getLinkElement(node.parentNode) : node;

    const isLinkNode = node => node.nodeName === LINK_TAG_NAME;

    const isCrossOriginLink = path => path.indexOf(getLocation().href.match(RE_ORIGIN)[0]) === -1;

    const isTargetSelfLink = el => el.target && el.target !== TARGET_SELF_LINK_ATTRIBUTE;

    const isEventForbidden = event => event.which && event.which !== 1 || // not left click
    event.metaKey || event.ctrlKey || event.shiftKey // or meta keys
    || event.defaultPrevented; // or default prevented


    const isForbiddenLink = el => !el || !isLinkNode(el) // not A tag
    || has(el, DOWNLOAD_LINK_ATTRIBUTE) // has download attr
    || !has(el, HREF_LINK_ATTRIBUTE) // has no href attr
    || isTargetSelfLink(el) || isCrossOriginLink(el.href);

    const isHashLink = path => path.split(HASH).length > 1;

    const normalizePath = path => path.replace(defaults.base, '');

    const isInBase = path => !defaults.base || path.includes(defaults.base);
    /**
     * Callback called anytime something will be clicked on the page
     * @param   {HTMLEvent} event - click event
     * @returns {undefined} void method
     */


    const onClick = event => {
      if (isEventForbidden(event)) return;
      const el = getLinkElement(event.target);
      if (isForbiddenLink(el) || isHashLink(el.href) || !isInBase(el.href)) return;
      const path = normalizePath(el.href);
      router.push(path);
      event.preventDefault();
    };
    /**
     * Link the rawth router to the DOM events
     * @param { HTMLElement } container - DOM node where the links are located
     * @returns {Function} teardown function
     */


    function initDomListeners(container) {
      const win = getWindow();
      const root = container || getDocument();

      if (win) {
        add(win, WINDOW_EVENTS, onWindowEvent);
        add(root, CLICK_EVENT, onClick);
      }

      router.on.value(onRouterPush);
      return () => {
        if (win) {
          remove(win, WINDOW_EVENTS, onWindowEvent);
          remove(root, CLICK_EVENT, onClick);
        }

        router.off.value(onRouterPush);
      };
    }

    const normalizeInitialSlash = str => str[0] === SLASH ? str : `${SLASH}${str}`;
    const removeTrailingSlash = str => str[str.length - 1] === SLASH ? str.substr(0, str.length - 1) : str;
    const normalizeBase = base => {
      const win = getWindow();
      const loc = win.location;
      const root = loc ? `${loc.protocol}//${loc.host}` : '';
      const {
        pathname
      } = loc ? loc : {};

      switch (true) {
        // pure root url + pathname
        case Boolean(base) === false:
          return removeTrailingSlash(`${root}${pathname || ''}`);
        // full path base

        case /(www|http(s)?:)/.test(base):
          return base;
        // hash navigation

        case base[0] === HASH:
          return `${root}${pathname && pathname !== SLASH ? pathname : ''}${base}`;
        // root url with trailing slash

        case base === SLASH:
          return removeTrailingSlash(root);
        // custom pathname

        default:
          return removeTrailingSlash(`${root}${normalizeInitialSlash(base)}`);
      }
    };
    function setBase(base) {
      defaults.base = normalizeBase(base);
    }

    Object.defineProperty(exports, 'Route', {
        enumerable: true,
        get: function () {
            return routeHoc_riot__default['default'];
        }
    });
    Object.defineProperty(exports, 'Router', {
        enumerable: true,
        get: function () {
            return routerHoc_riot__default['default'];
        }
    });
    exports.createURLStreamPipe = createURLStreamPipe;
    exports.filterStrings = filterStrings;
    exports.getCurrentRoute = getCurrentRoute;
    exports.initDomListeners = initDomListeners;
    exports.match = match;
    exports.route = createRoute;
    exports.router = router;
    exports.setBase = setBase;
    exports.toPath = toPath;
    exports.toRegexp = toRegexp;
    exports.toURL = toURL;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
