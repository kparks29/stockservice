(function() {
	'use strict';
	var express = require('express'),
		router = express.Router(),
		bcrypt = require('bcrypt'),
		_ = require('lodash'),
		jsonwebtoken = require('jsonwebtoken'),
		queries = require('../db/queries.json'),
		pg = require('pg-promise')(),
        conString = process.env.DATABASE_URL || 'postgres://stockuser:no7!st@localhost/stockservice',
        db = pg(conString);

	function getUser (email_address) {
		return db.one(queries.users.getByEmailAddress, [email_address]);
	}

	function getWebToken (user) {
		return jsonwebtoken.sign(user, process.env.SECRET_KEY || 'l45ql8y4iik7is45fij5', {expiresInSeconds: 360000});
	}

	router.use(function timeLog(req, res, next) {
		console.log('Request made at: ', Date.now());
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Content-Type, Auth-Token');
		next();
	});

	function login (req, res) {
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
					error: 'Internal Server Error: ' + error
				});
			});
			
		}
		else {
			res.status(400).json({
				error: 'Missing Email or Password'
			});
		}
	}


	router.post('/login', login);

	module.exports = router;

})();