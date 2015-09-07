(function () {
	'use strict';

	var express = require('express'),
		uuid = require('uuid'),		
		jsonWebToken = require('jsonwebtoken'),
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
		res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Content-Type', 'Auth-Token');
		next();
	});

	function errorHandler (res, status, error) {
		return res.status(status).json({
			error: error
		});
	}

	function getStocks () {
		return db.any(queries.stocks.getAll);
	}

	router.get('/', function(req, res) {
		var decoded;
		try {
			decoded = jsonWebToken.verify(req.headers['Auth-Token'], dbConfig.secretKey);
			getStocks().then(function (stocks) {
				res.status(201).json({
					stocks: stocks
				});
			}).catch(function (error) {
				errorHandler(res, 500, error);
			});
		}
		catch(error) {
			errorHandler(res, 401, error);
		}
	});

	module.exports = router;

})();