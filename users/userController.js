(function() {
	'use strict';
	function users() {

		function test () {
			console.log('test worked');
		}

		return {
			test: test
		};
	}

	module.exports = users();
})();