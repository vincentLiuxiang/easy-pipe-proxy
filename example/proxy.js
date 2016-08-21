var app    = require('connect')();
var epp    = require('../index.js');

var proxyConfig = {
  host:'localhost',
  port:'3007',
  timeout:1000,
  router:'/api'
}

var proxy = new epp(proxyConfig);
//var proxy2 = new epp(proxyConfig2);

/*
  All requests from the client which req.url start withs '/api',will pipe proxy to
  host: localhost, port:3007.
*/

app.use(proxyConfig.router,proxy.pipe())

//app.use(proxyConfig2.router,proxy2.pipe())

app.use(function (err,req,res,next) {

  // err.eppRouter help you distinguish which proxy occur error, and it equals proxyConfig.router
  // if err.eppRouter or err.eppCode is undefined ,
  // it means nothing error occurs in easy-pipe-proxy

  console.log(err.code,err.eppCode,err.eppRouter);
  if (err.eppCode) {
    // error occur in easy-pipe-proxy
    res.statusCode = err.eppCode
    res.end(err.message);
  }

  // other errors
  //...
})

app.listen(3006);