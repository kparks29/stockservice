(function() {
    var pg = require('pg-promise')(),
        dbConfig = require('./db.conf.json'),
        conString = 'postgres://' + dbConfig.username + ':' + dbConfig.password + '@localhost/' + dbConfig.db + '',
        db = pg(conString),
        migrations = require('./db/migrations.json').migrations,
        Promise = require('promise'),
        express = require('express'),
        bodyParser = require('body-parser');

    var app = express(),
        server,
        authRoutes = require('./auth/auth');

    app.use(bodyParser.json());
    app.use('/', authRoutes);

    function launchServer() {
        return app.listen(8081, function () {

        console.log('Stock Service listening on port %s', server.address().port);
        });
    }

    // start server
    server = launchServer();

})();