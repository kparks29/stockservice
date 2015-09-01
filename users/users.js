(function() {
	'use strict';

	var express = require('express'),
		uuid = require('uuid'),
		bcrypt = require('bcrypt'),
		_ = require('lodash'),
		queries = require('../db/queries.json'),
		router = express.Router(),
		pg = require('pg-promise')(),
        dbConfig = require('../db.conf.json'),
        conString = 'postgres://' + dbConfig.username + ':' + dbConfig.password + '@localhost/' + dbConfig.db + '',
        db = pg(conString);

	router.use(function timeLog(req, res, next) {
		console.log('Request made at: ', Date.now());
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Content-Type');
		next();
	});

	function addUser (body) {
		var salt = bcrypt.genSaltSync(),
			hash = bcrypt.hashSync(body.password, salt),
			values = [
				body.email_address,
				hash,
				salt,
				body.first_name,
				body.last_name,
				body.phone_number || null,
				uuid.v1()
			];

		return db.any(queries.users.add, values);
	}

	function checkUser (email_address) {
		return db.any(queries.users.getByEmailAddress, [email_address]);
	}

	function hasRequiredValues (body) {
		console.log(body)
		return !_.any(_.map([
                body.email_address,
                body.password,
                body.first_name,
                body.last_name
            ], _.isEmpty));
	}

	function internalError (error) {
		res.status(500).json({
			error: error
		});
	}

	router.post('/create', function(req, res) {
		var authToken;

		if (hasRequiredValues(req.body)) {
			return checkUser(req.body.email_address).then(function (result) {
				if (_.isEmpty(result)) {
					addUser(req.body).then(function (user) {
						authToken = uuid.v4();
						res.status(201).json({
							headers: res.headers,
							data: {
								auth_token: authToken
							}
						});
					}).catch(internalError);
				}
				else {
					res.status(409).json({
						error: 'User already exists'
					});
				}
			}).catch(internalError);	
		}
		else {
			res.status(400).json({
				error: 'Could not add user, missing fields.'
			});
		}
	});

	module.exports = router;
	
})();