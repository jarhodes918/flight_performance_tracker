import * as express from 'express';

import MetricCtrl from './controllers/metric';
import UserCtrl from './controllers/user';
import User from './models/user';
 
export default function setRoutes(app) {

  const router = express.Router();

  const metricCtrl = new MetricCtrl();
  const userCtrl = new UserCtrl();
  
  // Data
  router.route('/months/:info').get(metricCtrl.GetMonths);
  router.route('/airports/:info').get(metricCtrl.GetAirports);
  router.route('/metrics/:info').get(metricCtrl.GetMetrics);


  // Users
  router.route('/login').post(userCtrl.login);
  router.route('/users').get(userCtrl.getAll);
  router.route('/users/count').get(userCtrl.count);
  router.route('/user').post(userCtrl.insert);
  router.route('/user/:id').get(userCtrl.get);
  router.route('/user/:id').put(userCtrl.update);
  router.route('/user/:id').delete(userCtrl.delete);

  // Set parameter
  //app.param('user',domainCtrl.DomainByUser);

  // Set parameter
  //app.param('userdomain',credentialCtrl.CredentialsByDomainUser);
  
  // Apply the routes to our application with the prefix /api
  app.use('/api', router);

}
