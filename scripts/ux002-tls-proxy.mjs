/* An isolated local HTTPS reverse proxy for production-like browser testing.
 * It does not alter app CSP or production deployment configuration.
 * A self-signed localhost certificate is generated only in the GitHub runner. */
import * as fs from 'node:fs';
import * as https from 'node:https';
import * as http from 'node:http';
const cert = fs.readFileSync(process.env.UX002_TLS_CERT);
const key = fs.readFileSync(process.env.UX002_TLS_KEY);
const port = Number(process.env.UX002_TLS_PORT || 3443);
const proxy = https.createServer({cert,key}, (req,res) => {
  const headers = {...req.headers,host:'localhost:3000','x-forwarded-proto':'https'};
  const upstream = http.request({
    hostname:'127.0.0.1', port:3000, path:req.url, method:req.method,headers
  }, response => {
    res.writeHead(response.statusCode || 502,response.headers);
    response.pipe(res);
  });
  upstream.on('error', err => {
    if (!res.headersSent) res.writeHead(502,{'content-type':'text/plain'});
    res.end('Local upstream request failed');
    console.error('UX002_PROXY_UPSTREAM_ERROR', err.message);
  });
  req.pipe(upstream);
});
proxy.listen(port, () => console.log('UX002_HTTPS_PROXY_LISTENING',port));
