var app    = require('connect')();
var epp    = require('../index.js');

var proxyConfig = {
  host:'localhost',
  port:'3007',
  timeout:1000,
  router:'/api'
}

var proxy = new epp(proxyConfig);

/*
  All requests from the client which req.url start withs '/api',will pipe proxy to
  host: localhost, port:3007.
*/

app.use(proxyConfig.router,proxy.pipe())

app.use(function (err,req,res,next) {
  console.log(err.eppCode,err.eppRouter);
})

app.listen(3006);