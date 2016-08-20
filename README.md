# easy-pipe-proxy

* easy-pipe-proxy is a HTTP transparent proxy middleware, the goal of easy-pipe-proxy is to solve the browser cross-domain request. 
* It is based on high performance of node.js native HTTP pipe


###install
```
npm install easy-pipe-proxy
```

## example

### connect or express
#### proxy layer
#### proxy.js
```
var app    = require('connect')();
var epp    = require('easy-pipe-proxy');

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
  res.statusCode = err.eppCode
  res.end(err.message);
})

app.listen(3006);
```
#### back-end service layer
#### service.js
```
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
```

#### start example
```
node proxy.js
node service.js
```
vist http://localhost:3006/api/ok

In this example, http://localhost:3007/ok and http://localhost:3006/api/ok will get the same result.


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

**proxy header**

* in order to solve some security problems, easy-pipe-proxy will change 
req.headers.host (which comes from client ) to config.host + ':' + config.port

* eg: if we pipe proxy xxx.xxx.xxx.xxx:3006 to xxx.xxx.xxx.xxx:3007 , 
and then we vist http://xxx.xxx.xxx.xxx:3006 in browser.
easy-pipe-proxy receives req.headers.host from client should be *'xxx.xxx.xxx.xxx:3006'* , easy-pipe-proxy will change req.headers.host to *'xxx.xxx.xxx.xxx:3007'* and save *'xxx.xxx.xxx.xxx:3006'* to 'X-Proxy-Host' as a property of req.headers

`code:`

```
	req.headers['X-Proxy-Host'] = req.headers.host;
	req.headers.host = config.host ;
```





