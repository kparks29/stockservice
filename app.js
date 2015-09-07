(function() {
    var express = require('express'),
        bodyParser = require('body-parser');

    var app = express(),
        server,
        authRoutes = require('./auth/auth'),
        userRoutes = require('./users/users'),
        stockRoutes = require('./stocks/stocks');

    app.use(bodyParser.json());
    app.use('/', authRoutes);
    app.use('/users', userRoutes);
    app.use('/stocks', stockRoutes);

    function launchServer() {
        return app.listen(8081, function () {
            console.log('Stock Service listening on port %s', server.address().port);
        });
    }

    // start server
    server = launchServer();

})();