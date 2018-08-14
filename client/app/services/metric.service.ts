import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Metrics } from '../shared/models/metrics.model';
import { Months } from '../shared/models/months.model';
import { Airports } from '../shared/models/airports.model';

@Injectable()
export class MetricService {

  constructor(private http: HttpClient) { }

  getMonths(info): Observable<Months[]> {
    return this.http.get<Months[]>('/api/months/' + info);
  }

  getAirports(info): Observable<Airports[]> {
    return this.http.get<Airports[]>('/api/airports/' + info);
  }
 
  getMetrics(info): Observable<Metrics[]> {
    return this.http.get<Metrics[]>('/api/metrics/' + info);
  }

}
