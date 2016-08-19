var http = require('http');
/*
  default proxy timeout 2 minute
 */
var DEFAULT_TIMEOUT = 2 * 60 * 1000;
var TIMEOUT_ERROR = 'ECONNRESET';
var EASY_PIPE_PROXY_TIMEOUT_ERROR = 408;
var EASY_PIPE_PROXY_ERROR = 500;

function Proxy (config) {
  if (Object.prototype.toString.call(config) !== '[object Object]') {
    throw new Error('Proxy Must Accept A Json Object As The Only Parameter');
  }

  if (!config.host) {
    throw new Error('host Must Be a String In Proxy config Parameter');
  }

  if (!config.port) {
    throw new Error('port Must Be a Number or a String In Proxy config Parameter');
  }

  if (!config.router || config.router === '/' ) {
    throw new Error('router Can Not Be undefined , \'\' , \'/\' In Proxy config Parameter');
  }

  config.timeout = parseInt(config.timeout,10) || DEFAULT_TIMEOUT;

  this.config = config
}

Proxy.prototype.pipe = function () {
  var _this = this;
  return function (req,res,next) {
    var option = {
      method: req.method,
      headers: req.headers,
      path: req.url,
      host: _this.config.host,
      port: _this.config.port
    }

    var proxy = http.request(option,function (resProxy) {
      res.writeHead(resProxy.statusCode,resProxy.headers);
      resProxy.pipe(res);
    });

    req.pipe(proxy);

    proxy.on('error',function (err) {
      if (err.code !== TIMEOUT_ERROR) {
        err.eppCode = EASY_PIPE_PROXY_ERROR;
        err.eppRouter = _this.config.router;
        return next(err);
      }
    })

    proxy.setTimeout(_this.config.timeout, function () {
      proxy.abort();
    })

    proxy.on('abort',function () {
      var err = new Error('Pipe Proxy Timeout In ' + _this.config.timeout + ' msecs');
      err.eppCode = EASY_PIPE_PROXY_TIMEOUT_ERROR;
      err.eppRouter = _this.config.router;
      return next(err);
    })
  }
}

module.exports = Proxy