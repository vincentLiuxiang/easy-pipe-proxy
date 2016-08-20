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

  if (!config.router) {
    console.warn(
      '[warning]:\n \
        We Strongly Recommend That config.router Should Not Be ' + config.router + '. \n \
        Because, when some errors occur in easy-pipe-proxy, the errRouter \n \
        (a property in error object which captured in error middleware) will be ' + config.router + '.\n \
        That means you can\'t distinguish which proxy occurs error.'
    );
  }

  config.timeout = parseInt(config.timeout,10) || DEFAULT_TIMEOUT;

  this.config = config
}

Proxy.prototype.pipe = function () {
  var config = this.config;
  var abortError = false;
  return function (req,res,next) {

    req.headers['X-Proxy-Host'] = req.headers.host;
    req.headers.host = config.host ;

    var option = {
      method: req.method,
      path: req.url,
      host: config.host
    }

    if (config.port) {
      option.port = config.port;
      req.headers.host =  config.host + ':' + config.port;
    }

    option.headers = req.headers;

    var proxy = http.request(option,function (resProxy) {
      res.writeHead(resProxy.statusCode,resProxy.headers);
      resProxy.pipe(res);
    });

    req.pipe(proxy);

    proxy.on('error',function (err) {
      if (!abortError) {
        err.eppCode = EASY_PIPE_PROXY_ERROR;
        err.eppRouter = config.router;
      } else {
        abortError = false;
        err.message = 'Pipe Proxy Timeout In ' + config.timeout + ' msecs';
        err.eppCode = EASY_PIPE_PROXY_TIMEOUT_ERROR;
        err.eppRouter = config.router;
      }
      return next(err);
    })

    proxy.setTimeout(config.timeout, function () {
      abortError = true;
      proxy.abort();
    })
  }
}

module.exports = Proxy