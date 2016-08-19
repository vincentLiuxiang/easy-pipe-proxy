var http = require('http');
/*
  default proxy timeout 2 minute
 */
var DEFAULT_TIMEOUT = 2 * 60 * 1000;
var TIMEOUT_ERROR = 'ECONNRESET';
var EASY_PIPE_PROXY_ERROR = 'EASYPIPEPROXY'

function Proxy (config) {
  if (Object.prototype.toString.call(config) !== '[object Object]') {
    throw new Error('Proxy Must Accept A Json Object As The Only Parameter');
  }

  if (!config.host) {
    throw new Error('host Can Not Be undefined In Proxy config Parameter');
  }

  if (!config.port) {
    throw new Error('port Can Not Be undefined In Proxy config Parameter');
  }

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
        err.eppCode = EASY_PIPE_PROXY_ERROR + '_PIPE';
        return next(err);
      }
    })

    var timeout = parseInt(_this.config.timeout,10) || DEFAULT_TIMEOUT;

    proxy.setTimeout(timeout, function () {
      proxy.abort();
    })

    proxy.on('abort',function () {
      var err = new Error('Pipe Proxy Timeout In ' + timeout + ' msecs');
      err.eppCode = EASY_PIPE_PROXY_ERROR + '_TIMEOUT';
      return next(err);
    })
  }
}

module.exports = Proxy