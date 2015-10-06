(function() {
    'use strict';

    var pg = require('pg-promise')(),
        dbConfig = require('../db.conf.json'),
        conString = process.env.DATABASE_URL || 'postgres://' + dbConfig.username + ':' + dbConfig.password + '@localhost/' + dbConfig.db + '',
        db = pg(conString),
        migrations = require('./migrations.json').migrations,
        Promise = require('promise');

    function errorHandler(error) {
        console.log('ERROR', error)
    }

    // migrate db
    db.tx(function(){
        var promises = [];

        for (var i=0; i<migrations.length; i++) {
            promises.push(this.none(migrations[i]));
        }

        return Promise.all(promises).then(function() {
            console.log('Migrations Complete');
        });
    }).then(function(){
        // close the connection to db
        pg.end();
    }, errorHandler);

})();