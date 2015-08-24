(function() {
	'use strict';
	var express = require('express'),
		router = express.Router();

	router.use(function timeLog(req, res, next) {
		console.log('Request made at: ', Date.now());
		next();
	});
	router.post('/login', function(req, res) {
		if (req.body.username && req.body.password) {
			res.json({
				headers: res.headers,
				data: {
					authToken: 'test'
				}
			});
		}
		else {
			res.status(401).json({
				error: 'Wrong username or password'
			});
		}
	});

	module.exports = router;

})();