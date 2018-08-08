import Stock from '../models/stock';
import BaseCtrl from './base';

import * as mysql from 'mysql'; 

var con = mysql.createConnection({
  host: '',
  user: '',
	password: '',
	database : '',
//	insecureAuth : true,
//  port: 3306
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

export default class StockCtrl extends BaseCtrl {
  model = Stock;
	
	// Get metrics
	GetMetrics = (req, res) => {

		var userdata = req.params.info;;
		var json;

		con.query(

			"SELECT carrier, " +
			
			"SUM(scheduled) scheduled, " +
			"ROUND(SUM(ontime_arrivals)/SUM(scheduled)*100,1) aFourteen, " +
			"ROUND(SUM(scheduled-cancelled)/SUM(scheduled)*100,1) cf, " +
			"ROUND(SUM(ontime_departures)/SUM(scheduled)*100,1) dZero, " +
			"ROUND(SUM(ontime_blocks)/SUM(blocks)*100,1) bZero, " +
			"SUM(cancelled) cancelled, " +
			"ROUND(SUM(carrier_cancels)/SUM(cancelled)*100,1) carrierCancel, " +
			"ROUND(SUM(weather_cancels)/SUM(cancelled)*100,1) weatherCancel, " +
			"ROUND(SUM(nas_cancels)/SUM(cancelled)*100,1) nasCancel, " +
			"ROUND(SUM(security_cancels)/SUM(cancelled)*100,1) securityCancel, " +
			"SUM(arrival_delay_count) lateArrivals, " +
			"ROUND(SUM(arrival_delay_minutes-weather_delays-nas_delays-security_delays-lae_delays)/SUM(arrival_delay_minutes)*100,1) carrierDelay, " +
			"ROUND(SUM(weather_delays)/SUM(arrival_delay_minutes)*100,1) weatherDelay, " +
			"ROUND(SUM(nas_delays)/SUM(arrival_delay_minutes)*100,1) nasDelay, " +
			"ROUND(SUM(security_delays)/SUM(arrival_delay_minutes)*100,1) securityDelay, " +
			"ROUND(SUM(lae_delays)/SUM(arrival_delay_minutes)*100,1) laeDelay  " +

			"FROM staged_data " +
			"WHERE month IN ('2018-01') " +
			"AND destination IN ('JFK') " +
			"GROUP BY carrier " +
			"ORDER BY aFourteen DESC;", 
			
			
				function(err, results, fields) {
					if (err) {return console.error(err);}

					res.status(200).json(JSON.parse(JSON.stringify(results)));

					//console.log(fields); // fields contains extra meta data about results, if available
					return console.error(JSON.parse(JSON.stringify(results))); // results contains rows returned by server
				}
		);
	}

	// Get close quote
	GetlatestPrice = (req, res) => {

		var ticker = req.params.ticker;
		var json;
		var endpoint = 'https://api.iextrading.com/1.0/stock/' + ticker + '/quote';
		var request = require("request");

		request.get(endpoint, (error, response, body) => 
			{
				if (body == "Unknown symbol") {
					res.status(200).json({ 'latestPrice': 'Invalid ticker'})
					return console.error("Invalid ticker: " + ticker);
				} 

				json = JSON.parse(body); 
				res.status(200).json({ 'latestPrice': json.latestPrice});
			}
		);
	}
  
	// Get Stocks By User
	GetStocksByUser = (req, res) => {
		this.model.find({ creator: req.params.user }, (err, docs) => 
			{
				if (err) {return console.error(err);}
				res.status(200).json(docs);
				console.error(docs); // results contains rows returned by server
			}
		);
	}	
	
  // Get id of one stock by user
  GetStockByUser = (req, res) => {
    this.model.findOne({ creator: req.params.userstock.split("-")[0], name: req.params.userstock.split("-")[1] }, (err, item) => {
      if (err) { return console.error(err); }
		return res.status(200).json(item);
    });
  }

  DeleteStockByUser = (req, res) => {
    this.model.remove({ creator: req.params.userstock.split("-")[0], name: req.params.userstock.split("-")[1] }, (err) => {
      if (err) { return console.error(err); }
      res.sendStatus(200);
    });
  }

}
