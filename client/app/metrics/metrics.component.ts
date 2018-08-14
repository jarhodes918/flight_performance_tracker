import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { MetricService } from '../services/metric.service';
import { ToastComponent } from '../shared/toast/toast.component';
import { Metrics } from '../shared/models/metrics.model';
import { Months } from '../shared/models/months.model';
import { Airports } from '../shared/models/airports.model';

import * as chart from 'chart.js'
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import * as d3Shape from 'd3-shape';
import * as d3Zoom from 'd3-zoom';
import * as d3Brush from 'd3-brush';
import * as d3TimeFormat from 'd3-time-format';
import * as d3Color from 'd3-color';

import { STATISTICS } from '../shared/data';

@Component({
  selector: 'app-metrics',
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.css']
})

export class MetricsComponent implements OnInit {

  private width: number;
  private height: number;
  private margin = {top: 20, right: 20, bottom: 30, left: 75};

  private x: any;
  private y: any;
  private svg: any;
  private g: any;

  metrics: Metrics[] = [];
  startMonths: Months[] = [];
  endMonths: Months[] = [];
  fromports: Airports[] = [];
  toports: Airports[] = [];

  parameters;

  isLoading = false;
  isEditing = false;

  constructor(private metricService: MetricService,
			  private auth: AuthService,              
              private router: Router,
              private formBuilder: FormBuilder,
              public toast: ToastComponent) { }

  ngOnInit() {

    if (!this.auth.loggedIn) {
        this.router.navigate(['/']);
    }

    this.parameters = "";
    this.getMonths('startMonths');
    
  }

  getMonths(info) {

    this.metricService.getMonths(info + ":" + this.parameters).subscribe(
      data => {
        if (info == 'startMonths') {
          this.startMonths = data;
        }
        else if (info == 'endDate') {    
          this.endMonths = data; 
        }
      } ,
      error => console.log(error),
      () => this.isLoading = false
    );
  }

  getAirports(info) {

    this.metricService.getAirports(info + ":" + this.parameters).subscribe(
      data => {
        if (info == 'origin') {
          this.fromports = data; 
        }
        else if (info == 'destination') {    
          this.toports = data; 
        }
      } ,
      error => console.log(error),
      () => this.isLoading = false
    );
  }

  getMetrics(info) {

    this.parameters = document.getElementById("tdStartDate")["value"];
    this.parameters = this.parameters + ":" + document.getElementById("tdEndDate")["value"];
    this.parameters = this.parameters + ":" + document.getElementById("tdOrigin")["value"];
    this.parameters = this.parameters + ":" + document.getElementById("tdDestination")["value"];
    this.parameters = this.parameters + ":" + document.getElementById("tdAirlines")["value"];

    if (info == 'startDate') {
      this.getMonths('endDate');
      this.getAirports('origin');
    }
    else if (info == 'origin') {
      this.getAirports('destination');
    }

    console.log("Parameters: " + this.parameters);

    if (!this.parameters.includes('Select')) {
        this.metricService.getMetrics(info + ":" + this.parameters).subscribe(
          data => {
            
            this.metrics = data; 

            var chartdata = [];
              
              for (var i = 0; i < this.metrics.length; i++) {
                chartdata.push({carrier: i + " " + this.metrics[i].carrier, a14: this.metrics[i].aFourteen});
              }				
              this.showchart(chartdata);
              this.showchart(chartdata);
              this.showchart(chartdata);
              console.log(data);
              console.log(this.metrics);
              console.log(chartdata);
//              canvas: any;
//              ctx: any;

//              this.canvas = 
          } ,
          error => console.log(error),
          () => this.isLoading = false
        );
    }
  }

  showchart(chartdata) {  
    this.initSvg();
    this.initAxis(chartdata);
    this.drawAxis();
    this.drawBars(chartdata);	
  }  

  private initSvg() {
    this.svg = d3.select("svg");
    this.width = +this.svg.attr("width") - this.margin.left - this.margin.right;
    this.height = +this.svg.attr("height") - this.margin.top - this.margin.bottom;
    this.g = this.svg.append("g").attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
  }

  private initAxis(chartdata) {
    this.x = d3Scale.scaleBand().rangeRound([0, this.width]).padding(0.4);
    this.y = d3Scale.scaleLinear().rangeRound([this.height, 0]);
    this.x.domain(chartdata.map((d) => d.carrier.substring(d.carrier.length-2)));
    this.y.domain([0, d3Array.max(chartdata, (d) => d.a14)]);
  }

  private drawAxis() {
    this.g.append("g")
          .attr("transform", "translate(0," + this.height + ")")
          .call(d3Axis.axisBottom(this.x));
    this.g.append("g")
          .call(d3Axis.axisLeft(this.y))
  }

  private drawBars(chartdata) {
    this.g.selectAll(".bar")
					.remove()
					.exit()    
          .data(chartdata)
          .enter().append("rect")
          .attr("x", (d) => this.x(  d.carrier.substring(d.carrier.length-2)  ) )
          .attr("y", (d) => this.y(d.a14) )
          .attr("width", this.x.bandwidth() )
          .attr("height", (d) => this.height - this.y(d.a14) )
		  .attr("fill", (d) => {if (d.carrier.substring(0,1) % 2 == 1) { return "blue"} else { return "red"};} );

/*    this.g.selectAll(".bar-text")
          .data(chartdata)
          .enter().append("text")
          .attr("x", (d) => this.x(d.ticker) + this.x.bandwidth() / 2)
          .attr("y", (d) => this.y(d.total) )
          .attr("text-anchor", "middle")
		  .text((d,i) => {if (d.ticker.substring(d.ticker.length-1) == "y") { return ""} 
			else {  return Math.round(((chartdata[i].total-chartdata[i-1].total)/chartdata[i-1].total*100) 
			               * Math.pow(10, 1)) / Math.pow(10, 1) + "%"}}); */
  }  
}
