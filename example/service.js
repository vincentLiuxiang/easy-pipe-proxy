var app    = require('connect')();
/*
  if A HTTP request from client is 'localhost:3006/api/ok' via any
  method (GET/POST),
  easy-pipe-proxy will auto pipe this request to 'localhost:3007/ok',and then pipe
  the proxy response to client;
*/

app.use('/ok',(req,res,next) => {
  res.statusCode = 200;
  res.end('hello world');
})

/*
  if A HTTP request from client is 'localhost:3006/api/pending' via any
  method (GET/POST),
  easy-pipe-proxy will auto pipe this request to 'localhost:3007/pending',and then pipe
  the proxy response to client;
*/

app.use('/pending',(req,res,next) => {

})

app.listen(3007);