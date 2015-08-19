# Command line paths
KARMA = ./node_modules/karma/bin/karma
ISTANBUL = ./node_modules/karma-coverage/node_modules/.bin/istanbul
ESLINT = ./node_modules/eslint/bin/eslint.js
MOCHA = ./node_modules/mocha/bin/_mocha
UGLIFY = ./node_modules/uglify-js/bin/uglifyjs
COVERALLS = ./node_modules/coveralls/bin/coveralls.js
CHOKIDAR = ./node_modules/.bin/chokidar

# Riot adapter
RIOT_START_FRAG = ';(function(riot) { if (!window) return;\n' #TODO: remove `if` after server-side supported
RIOT_END_FRAG = 'riot.route = route })(riot)'
SED_MATCHER1 = "s/var observable = require('riot-observable')//"
SED_MATCHER2 = "s/module.exports = route//"

build:
	@ cat lib/wrap/start.frag lib/index.js lib/wrap/end.frag > dist/route.js
	@ $(UGLIFY) dist/route.js --comments --mangle -o dist/route.min.js
	@ echo $(RIOT_START_FRAG) > dist/riot.route.js
	@ cat lib/index.js | sed $(SED_MATCHER1) | sed $(SED_MATCHER2) >> dist/riot.route.js
	@ echo $(RIOT_END_FRAG) >> dist/riot.route.js

watch:
	@ $(CHOKIDAR) lib/* lib/**/* -c 'make build'

test: eslint test-karma

eslint:
	# check code style
	@ $(ESLINT) -c ./.eslintrc lib

test-karma:
	@ $(KARMA) start test/karma.conf.js

test-coveralls:
	@ RIOT_COV=1 cat ./coverage/lcov.info ./coverage/report-lcov/lcov.info | $(COVERALLS)


.PHONY: build test eslint test-karma test-coveralls
