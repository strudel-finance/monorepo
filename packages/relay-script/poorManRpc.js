
function httpRequest(request, params) {
  return new Promise(function(resolve, reject) {
    const req = request(params, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        const data = JSON.parse(body);
        resolve(data.result);
      } else {
        console.log('error:', response.statusCode, error);
        reject(response.body);
      }
    });
  });
}

const headers = {
  "content-type": "text/plain;"
};

exports.PoorManRpc = class PoorManRpc {

  constructor(request, user, password, host, port) {
    this.request = request;
    this.user = user;
    this.password = password;
    this.host = host;
    this.port = port;
  }

  getBlock(blockHash) {
    const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getblock","params":["${blockHash}"]}`;
    const options = {
      url: `http://${this.user}:${this.password}@${this.host}:${this.port}/`,
      method: "POST",
      headers: headers,
      body: dataString
    };
    return httpRequest(this.request, options);
  }

  getHeader(blockHash) {
    const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getblockheader","params":["${blockHash}", false]}`;
    const options = {
      url: `http://${this.user}:${this.password}@${this.host}:${this.port}/`,
      method: "POST",
      headers: headers,
      body: dataString
    };
    return httpRequest(this.request, options);
  }

  getBlockHash(blockHeigth) {
    const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getblockhash","params":[${blockHeigth}]}`;
    const options = {
      url: `http://${this.user}:${this.password}@${this.host}:${this.port}/`,
      method: "POST",
      headers: headers,
      body: dataString
    };
    return httpRequest(this.request, options);
  }
  
}
