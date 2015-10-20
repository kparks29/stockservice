(function () {
	'use strict';

	var express = require('express'),
		uuid = require('uuid'),		
		jsonWebToken = require('jsonwebtoken'),
		_ = require('lodash'),
		queries = require('../db/queries.json'),
		router = express.Router(),
		pg = require('pg-promise')(),
        conString = process.env.DATABASE_URL || 'postgres://stockuser:no7!st@localhost/stockservice',
        db = pg(conString),
        Promise = require('promise'),
        yql = require('yql'),
        secretKey = process.env.SECRET_KEY || 'l45ql8y4iik7is45fij5';

	var stockTickers = [
		'AA','AXP','BA','BAC','BEAV','BRCM','CAH','CAT','CBOU','CLWR','COH','CORN','COST','CPK','CSCO','CVS','CVX','DD','DIS','DO','DVA','EMC','EXAR','F','FAST','FCS','FCX','FRBK','FSL','GE','GES','GM','GMCR','GPL','GWW','HD','HL','HOG','HPQ','IBM','INTC','JAG','JNJ','JPM','JRCC','JVA','KO','KR','KRFT','KSU','LMIA','M','JNJ','MCD','MMM','MRK','MRVL','MSFT','MUX','NLY','NRU','NU','OPHC','OPK','OPXA','PCXCQ','PFE','PG','POT','PPC','PSDV','PTSX','QCOM','RADA','RIG','S','SCCO','SCMFO','SDRL','SLW','SMTC','SNDK','SPR','STX','SWC','SWHC','SWY','T','TM','TRV','TSN','UA','UTX','VALE','VMED','VZ','WAG','WAIR','WCBO','WDC','WMT','XOM','HOGS','OVTI'
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

	function getQueryString (stocks) {
		var queryString = 'SELECT * FROM yahoo.finance.quote WHERE symbol IN (';
			_.each(stocks, function (stock, index) {
				queryString += '"' + stock + '"';
				queryString += index < (stocks.length - 1) ? ',' : '';
			});
			queryString += ')';
		return queryString;
	}

	function getStockFromYahoo (stocks) {
		var query = new yql(getQueryString(stocks)).setParam('format', 'json');
		
		return new Promise(function (resolve, reject) {
			query.exec(function (error, response) {
				if (error) {
					reject(error);
				}
				else {
					resolve(response.query.results.quote);
				}
			});
		});
	}

	function getStockByTicker (req, res) {
		console.log(req.query.ticker)
		try {
			var decoded = jsonWebToken.verify(req.headers['auth-token'], secretKey);
			db.any(queries['stock_result'].get, [req.query.ticker]).then(function (stocks) {
				res.status(201).json({
					stock: {
						ticker_symbol: req.query.ticker,
						stats: stocks
					}
				});
			}).catch(function (error) {
				errorHandler(res, 500, error);
			});
		}
		catch(error) {
			errorHandler(res, 401, error);
		}
	}

	function addStock (req, res) {
		try {
			var decoded = jsonWebToken.verify(req.headers['auth-token'], secretKey);
			db.any(queries['stock_result'].add, [req.body.rank, req.body.ticker_symbol, req.body.name, req.body.goal, req.body.value]).then(function (stocks) {
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
	}

	function getStocks (req, res) {
		if (req.query.ticker) {
			return getStockByTicker(req, res);
		}
		try {
			var decoded = jsonWebToken.verify(req.headers['auth-token'], secretKey);
			db.any(queries.stocks.getAll).then(function (stocks) {
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
	}

	function getRawStock (req, res) {
		try {
			var decoded = jsonWebToken.verify(req.headers['auth-token'], secretKey);
			getStockFromYahoo(stockTickers).then(function (stocks) {
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
	}

	function addRawStock(stock) {
		return db.any(queries['raw_stock'].add, [stock.Symbol, stock.AverageDailyVolume, stock.Change, stock.DaysLow, stock.DaysHigh, stock.YearLow, stock.YearHigh, stock.MarketCapitalization, stock.LastTradePriceOnly, stock.DaysRange, stock.Name, stock.Volume, stock.StockExchange]);
	}

	function addRawStocks (req, res) {
		try {
			var decoded = jsonWebToken.verify(req.headers['auth-token'], secretKey);
			getStockFromYahoo(stockTickers).then(function (stocks) {
				return Promise.all(_.map(stocks, addRawStock));
			}).then(function (stocks) {
				res.status(201).send('Stocks added');
			}).catch(function (error) {
				errorHandler(res, 500, error);
			});
		}
		catch(error) {
			errorHandler(res, 401, error);
		}
	}


	router.get('', getStocks);
	router.post('', addStock);
	router.get('/raw', getRawStock);
	router.post('/raw', addRawStocks);

	module.exports = router;

})();