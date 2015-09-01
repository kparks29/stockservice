(function() {
	'use strict';
	var express = require('express'),
		router = express.Router();

	// router.use(function timeLog(req, res, next) {
	// 	console.log('Request made at: ', Date.now());
	// 	res.header('Access-Control-Allow-Origin', '*');
	// 	res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
	// 	res.header('Access-Control-Allow-Headers', 'Content-Type');
	// 	next();
	// });
	router.post('/login', function(req, res) {
		if (req.body.email && req.body.password) {
			res.json({
				headers: res.headers,
				data: {
					authToken: 'test'
				}
			});
		}
		else {
			res.status(401).json({
				error: 'Wrong email or password'
			});
		}
	});

	module.exports = router;

})();