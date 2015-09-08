(function() {
	'use strict';

	var uuid = require('uuid'),
		pg = require('pg-promise')(),
	    dbConfig = require('../db.conf.json'),
	    conString = 'postgres://' + dbConfig.username + ':' + dbConfig.password + '@localhost/' + dbConfig.db + '',
	    db = pg(conString),
	    seedData = require('./seed.json'),
	    Promise = require('promise'),
	    bcrypt = require('bcrypt'),
	    _ = require('lodash');

	function errorHandler(error) {
		console.log('ERROR', error);
		pg.end();
	}

	db.tx(function(){
		var self = this,
			promises = [];
		// clear out users and stocks
		promises.push(self.any(seedData.clearUsers, []));
		promises.push(self.any(seedData.clearStocks, []));
		// load in users
		_.each(seedData.users, function (userQuery) {
			var salt = bcrypt.genSaltSync(),
				hash = bcrypt.hashSync('test', salt);
			promises.push(self.any(userQuery, [hash, salt, uuid.v4()]));
		});
		// load in stocks
		_.each(seedData.stocks, function (stockQuery) {
			promises.push(self.any(stockQuery, [uuid.v4()]));
		});
		// run once all promises are complete
		return Promise.all(promises);
	}).then(function() {
		console.log('Seed DB Complete');
		pg.end();
	}, errorHandler);

})();