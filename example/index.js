var app    = require('connect')();
var epp    = require('../src');

var proxyConfig = {
  host:'localhost',
  port:'3006',
  timeout:1000,
  router:'/api'
}

var proxy = new epp(proxyConfig);

app.use(proxyConfig.router,proxy.pipe())

app.use('/pending',(req,res,next) => {

})

app.use('/ok',(req,res,next) => {
  res.statusCode = 200;
  res.end('hello world');
})

app.use(function (err,req,res,next) {
  console.log(err.eppCode,err.eppRouter);
})

app.listen(3006);