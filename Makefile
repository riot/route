# Command line paths
KARMA     = ./node_modules/karma/bin/karma
ISTANBUL  = ./node_modules/karma-coverage/node_modules/.bin/istanbul
ESLINT    = ./node_modules/eslint/bin/eslint.js
MOCHA     = ./node_modules/mocha/bin/_mocha
UGLIFY    = ./node_modules/uglify-js/bin/uglifyjs
COVERALLS = ./node_modules/coveralls/bin/coveralls.js
CHOKIDAR  = ./node_modules/.bin/chokidar

# Replacer
REPLACER1 = "/var observable = require('riot-observable')/d"
REPLACER2 = "/module.exports = route/d"
REPLACER3 = "s/observable(/riot.observable(/g"

# Riot adapter
R_START_FRAG = ";(function(riot) {\n"
R_END_FRAG   = "riot.route = route\n})(riot)"

# AMD adapter
A_START_FRAG = ";define(function(require, exports, module) {\n 'use strict' \n"
A_END_FRAG   = "});"

# ES6
ES6_START_FRAG   = "import observable from 'riot-observable'"
ES6_END_FRAG   = "export default route"

# Standalone adapter
S_START_FRAG = ";(function() {\n 'use strict'\n /* istanbul ignore next */\n"
S_END_FRAG   = "window.route = route\n})();"

build:
	# Riot
	@ echo $(R_START_FRAG) > dist/riot.route.js
	@ cat lib/index.js | sed $(REPLACER1) | sed $(REPLACER2) | sed $(REPLACER3) >> dist/riot.route.js
	@ echo $(R_END_FRAG) >> dist/riot.route.js
	# AMD
	@ echo $(A_START_FRAG) > dist/amd.route.js
	@ cat lib/index.js >> dist/amd.route.js
	@ echo $(A_END_FRAG) >> dist/amd.route.js
	@ $(UGLIFY) dist/amd.route.js --comments --mangle -o dist/amd.route.min.js
	# Standalone
	@ echo $(S_START_FRAG) > dist/route.js
	@ cat node_modules/riot-observable/lib/index.js >> dist/route.js
	@ cat lib/index.js | sed $(REPLACER1) | sed $(REPLACER2) >> dist/route.js
	@ echo $(S_END_FRAG) >> dist/route.js
	@ $(UGLIFY) dist/route.js --comments --mangle -o dist/route.min.js
	# ES6
	@ echo $(ES6_START_FRAG) > dist/es6.route.js
	@ cat lib/index.js | sed $(REPLACER1) | sed $(REPLACER2) >> dist/es6.route.js
	@ echo $(ES6_END_FRAG) >> dist/es6.route.js

watch:
	@ $(CHOKIDAR) lib/* lib/**/* -c 'make build'

test: eslint test-karma test-server

test-browsers:
	@ BROWSERSTACK=1 $(KARMA) start test/karma.conf.js

eslint:
	# check code style
	@ $(ESLINT) -c ./.eslintrc lib

test-karma:
	@ $(KARMA) start test/karma.conf.js

test-server:
	@ $(MOCHA) test/specs/server.specs.js

test-coveralls:
	@ RIOT_COV=1 cat ./coverage/lcov.info ./coverage/report-lcov/lcov.info | $(COVERALLS)


.PHONY: build test eslint test-karma test-server test-coveralls
