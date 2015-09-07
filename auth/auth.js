(function() {
	'use strict';
	var express = require('express'),
		router = express.Router(),
		bcrypt = require('bcrypt'),
		_ = require('lodash'),
		jsonwebtoken = require('jsonwebtoken'),
		queries = require('../db/queries.json'),
		pg = require('pg-promise')(),
        dbConfig = require('../db.conf.json'),
        conString = 'postgres://' + dbConfig.username + ':' + dbConfig.password + '@localhost/' + dbConfig.db + '',
        db = pg(conString);

	function getUser (email_address) {
		return db.one(queries.users.getByEmailAddress, [email_address]);
	}

	function getWebToken (user) {
		return jsonwebtoken.sign(user, dbConfig.secretKey, {expiresInSeconds: 3600});
	}

	router.use(function timeLog(req, res, next) {
		console.log('Request made at: ', Date.now());
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Content-Type, Auth-Token');
		next();
	});
	router.post('/login', function(req, res) {
		if (req.body.email_address && req.body.password) {
			getUser(req.body.email_address).then(function (user) {
				if (bcrypt.compareSync(req.body.password, user.hashed_password)) {
					res.status(200).json({
						auth_token: getWebToken(_.pick(user, 'user_account_uuid'))
					});
				}
				else {
					res.status(401).json({
						error: 'Wrong email or password'
					});
				}
			}).catch(function (error) {
				res.status(500).json({
					error: 'Internal Server Error'
				});
			});
			
		}
		else {
			res.status(400).json({
				error: 'Missing Email or Password'
			});
		}
	});

	module.exports = router;

})();