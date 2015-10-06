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
        db = pg(conString),
        Promise = require('promise'),
        yql = require('yql');

	var stockTickers = [
		'AXP','BA','BAC','BEAV','BRCM','CAH','CAT','CBOU','CLWR','COH','CORN','COST','CPK','CSCO','CVS','CVX','DD','DIS','DO','DVA','EMC','EXAR','F','FAST','FCS','FCX','FRBK','FSL','GE','GES','GM','GMCR','GPL','GWW','HD','HL','HOG','HPQ','IBM','INTC','JAG','JNJ','JPM','JRCC','JVA','KO','KR','KRFT','KSU','LMIA','M','JNJ','MCD','MMM','MRK','MRVL','MSFT','MUX','NLY','NRU','NU','OPHC','OPK','OPXA','PCXCQ','PFE','PG','POT','PPC','PSDV','PTSX','QCOM','RADA','RIG','S','SCCO','SCMFO','SDRL','SLW','SMTC','SNDK','SPR','STX','SWC','SWHC','SWY','T','TM','TRV','TSN','UA','UTX','VALE','VMED','VZ','WAG','WAIR','WCBO','WDC','WMT','XOM','HOGS','OVTI'
	];

	router.use(function timeLog(req, res, next) {
		console.log('Request made at: ', Date.now());
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Content-Type, Auth-Token');
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

	function getQueryString (stocks) {
		var queryString = 'SELECT * FROM yahoo.finance.quote WHERE symbol IN (';
			_.each(stocks, function (stock, index) {
				queryString += '"' + stock + '"';
				queryString += index < (stocks.length - 1) ? ',' : '';
			});
			queryString += ')';
		return queryString;
	}

	function getStockFromServer (stocks) {
		var query = new yql(getQueryString(stocks)).setParam('format', 'json');
		
		return new Promise(function (resolve, reject) {
			query.exec(function (error, response){
				if (error) {
					reject(error);
				}
				else {
					resolve(response.query.results.quote);
				}
			});
		});
	}

	router.get('/', function(req, res) {
		try {
			var decoded = jsonWebToken.verify(req.headers['auth-token'], dbConfig.secretKey);
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

	router.post('/', function(req, res) {
		try {
			var decoded = jsonWebToken.verify(req.headers['auth-token'], dbConfig.secretKey);
			getStockFromServer(stockTickers).then(function (stocks) {
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


// {
// "symbol": "AXP",
// "average_daily_volume": "6306490",
// "change": "+0.79",
// "today_low": "76.32",
// "today_high": "77.32",
// "year_low": "71.71",
// "YearHigh": "94.89",
// "MarketCapitalization": "76.84B",
// "LastTradePriceOnly": "76.74",
// "DaysRange": "76.32 - 77.32",
// "Name": "American Express Company Common",
// "Symbol": "AXP",
// "Volume": "3266298",
// "StockExchange": "NYQ"
// }