# easy-pipe-proxy

* easy-pipe-proxy is a HTTP transparent proxy middleware, the goal of easy-pipe-proxy is to solve the browser cross-domain request. 
* It is based on high performance of node.js native HTTP pipe


###install
```
npm install easy-pipe-proxy
```

### example

##### connect or express
```
var app    = require('connect')();
var epp    = require('easy-pipe-proxy');

var proxyConfig = {
  host:'localhost',
  port:'3006',
  timeout:1000,
  router:'/api'
}

var proxy = new epp(proxyConfig);

/*
	All requests from the client which req.url start withs '/api',will pipe proxy to 
	host: localhost, port:3006. 
*/

app.use(proxyConfig.router,proxy.pipe())

/*
	if A HTTP request from client is 'localhost:3006/api/pending' via any
	method (GET/POST),
	easy-pipe-proxy will auto pipe this request to 'localhost:3006/pending',and then pipe
	the proxy response to client;
*/

app.use('/pending',(req,res,next) => {

})


/*
	if A HTTP request from client is 'localhost:3006/api/ok' via any
	method (GET/POST),
	easy-pipe-proxy will auto pipe this request to 'localhost:3006/ok',and then pipe
	the proxy response to client;
*/

app.use('/ok',(req,res,next) => {
  res.statusCode = 200;
  res.end('hello world');
})

app.use(function (err,req,res,next) {
  console.log(err.eppCode);
})

app.listen(3006);
```
In this example,vist http://localhost:3006/ok and vist http://localhost:3006/api/ok, will get the same result.

**proxyConfig**

* host [string]: The back-end service IP or domian
* port [string/number]: The back-end service port
* timeout [number]: default 2 min. pipe-proxy will abort proxy after timeout (mses),and it will cause a timeout error. 
* router [string]: connect's/express's router, this router controls requests which come from the client will be proxy by easy-pipe-proxy.

**errorCode**

```
if some error occurs in easy-pipe-proxy, 
easy-pipe-proxy will append eppCode (easy-pipe-proxy Code) and eppRouter (easy-pipe-proxy Router) to the error object . 
Connect/express error middleware will capture this error object.  

like:
  vist http://localhost:3006/api/pending
  
  app.use(function (err,req,res,next) {
    console.log(err.eppCode,err.eppRouter);
  })

but if nothing error occurs in easy-pipe-proxy ,the eppCode and eppRouter attribute will be undefined.
  
```
**eppCode**

* 408, proxy timeout
* 500, proxy error

**eppRouter**

* string,eg: '/api'



