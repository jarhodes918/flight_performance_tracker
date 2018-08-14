import Stock from '../models/stock';
import BaseCtrl from './base';

import * as mysql from 'mysql'; 



var monthsquery = "select distinct month from staged_data order by month;";
var metricsquery = "SELECT carrier, " +
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
		"WHERE 1 = 1 ";

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

export default class MetricCtrl extends BaseCtrl {
  model = Stock;

  // Get Months
	GetMonths = (req, res) => {

		var userdata = req.params.info;;
		var json;
		var qry;
		
		console.log(userdata.split(":")[0]);
		if (userdata.split(":")[0] == "startMonths") {
			qry = monthsquery;
		}
		else if (userdata.split(":")[0] == "endDate") {
			qry = "select distinct month from staged_data where 1 = 1 ";
			
			if (userdata.split(":")[1] == "All" || userdata.split(":")[1].includes('Select')) {
			}
			else	qry = qry + "AND month >= '" + userdata.split(":")[1] + "' ";

			if (userdata.split(":")[3] == "All" || userdata.split(":")[3].includes('Select')) {
			}
			else	qry = qry + "AND origin = '" + userdata.split(":")[3] + "' ";

			if (userdata.split(":")[4] == "All" || userdata.split(":")[4].includes('Select')) {
			}
			else	qry = qry + "AND destination = '" + userdata.split(":")[4] + "' ";

			if (userdata.split(":")[5] == "All" || userdata.split(":")[5].includes('Select')) {
			}
			else qry = qry + "AND carrier IN ('AA','DL','UA','WN') ";

			qry = qry + "ORDER BY month; ";
		}

		con.query(qry,
			 
				function(err, results, fields) {
					if (err) {return console.error(err);}

					res.status(200).json(JSON.parse(JSON.stringify(results)));

					//console.log(fields); // fields contains extra meta data about results, if available
					return console.error(JSON.parse(JSON.stringify(results))); // results contains rows returned by server
				}
		);
	}

	// Get Airports
	GetAirports = (req, res) => {

		var userdata = req.params.info;;
		var json;
		var qry;
		
		if (userdata.split(":")[0] == "origin") {
			qry = "select distinct origin AS airport_code from staged_data where 1 = 1 ";
			
			if (userdata.split(":")[1] == "All" || userdata.split(":")[1].includes('Select')) {
			}
			else	qry = qry + "AND month >= '" + userdata.split(":")[1] + "' ";

			if (userdata.split(":")[2] == "All" || userdata.split(":")[2].includes('Select')) {
			}
			else	qry = qry + "AND month <= '" + userdata.split(":")[2] + "' ";

			if (userdata.split(":")[4] == "All" || userdata.split(":")[4].includes('Select')) {
			}
			else	qry = qry + "AND destination = '" + userdata.split(":")[4] + "' ";

			if (userdata.split(":")[5] == "All" || userdata.split(":")[5].includes('Select')) {
			}
			else qry = qry + "AND carrier IN ('AA','DL','UA','WN') ";

			qry = qry + "ORDER BY origin; ";
		}
		else if (userdata.split(":")[0] == "destination") {
			qry = "select distinct destination AS airport_code from staged_data where 1 = 1 ";
			
			if (userdata.split(":")[1] == "All" || userdata.split(":")[1].includes('Select')) {
			}
			else	qry = qry + "AND month >= '" + userdata.split(":")[1] + "' ";

			if (userdata.split(":")[2] == "All" || userdata.split(":")[2].includes('Select')) {
			}
			else	qry = qry + "AND month <= '" + userdata.split(":")[2] + "' ";

			if (userdata.split(":")[3] == "All" || userdata.split(":")[3].includes('Select')) {
			}
			else	qry = qry + "AND origin = '" + userdata.split(":")[3] + "' ";

			if (userdata.split(":")[5] == "All" || userdata.split(":")[5].includes('Select')) {
			}
			else qry = qry + "AND carrier IN ('AA','DL','UA','WN') ";

			qry = qry + "ORDER BY destination; ";
		}

		con.query(qry,
			 
				function(err, results, fields) {
					if (err) {return console.error(err);}

					res.status(200).json(JSON.parse(JSON.stringify(results)));

					//console.log(fields); // fields contains extra meta data about results, if available
					return console.error(JSON.parse(JSON.stringify(results))); // results contains rows returned by server
				}
		);
	}

	// Get Metrics
	GetMetrics = (req, res) => {

		var userdata = req.params.info;;
		var qry = metricsquery;
	
				if (userdata.split(":")[1] == "All" || userdata.split(":")[1].includes('Select')) {
				}
				else	qry = qry + "AND month >= '" + userdata.split(":")[1] + "' ";
	
				if (userdata.split(":")[2] == "All" || userdata.split(":")[2].includes('Select')) {
				}
				else	qry = qry + "AND month <= '" + userdata.split(":")[2] + "' ";
	
				if (userdata.split(":")[3] == "All" || userdata.split(":")[3].includes('Select')) {
				}
				else	qry = qry + "AND origin = '" + userdata.split(":")[3] + "' ";
	
				if (userdata.split(":")[4] == "All" || userdata.split(":")[4].includes('Select')) {
				}
				else	qry = qry + "AND destination = '" + userdata.split(":")[4] + "' ";

				if (userdata.split(":")[5] == "All" || userdata.split(":")[5].includes('Select')) {
				}
				else qry = qry + "AND carrier IN ('AA','DL','UA','WN') ";
	
				qry = qry + "GROUP BY carrier ORDER BY aFourteen DESC; "; 
				
	
		con.query(qry,
			 
				function(err, results, fields) {
					if (err) {return console.error(err);}

					res.status(200).json(JSON.parse(JSON.stringify(results)));

					//console.log(fields); // fields contains extra meta data about results, if available
					return console.error(JSON.parse(JSON.stringify(results))); // results contains rows returned by server
				}
		);
	}
}
