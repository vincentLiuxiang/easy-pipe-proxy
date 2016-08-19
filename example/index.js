var app    = require('connect')();
var epp    = require('../src');

var proxyConfig = {
  host:'localhost',
  port:'3006',
  timeout:1000
}

var proxy = new epp(proxyConfig);

app.use('/api',proxy.pipe())

app.use('/pending',(req,res,next) => {
  res.statusCode = 200;
  res.end('hello world');
})

app.use(function (err,req,res,next) {
  console.log(err);
})

app.listen(3006);