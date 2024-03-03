//create a web server
var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var comments = require('./comments');

var server = http.createServer(function (request, response) {
    if (request.url == '/post' && request.method.toLowerCase() == 'post') {
        var body = '';
        request.setEncoding('utf-8');
        request.on('data', function (chunk) {
            body += chunk;
        });
        request.on('end', function () {
            comments.add(JSON.parse(body));
            response.writeHead(200, { 'Content-Type': 'text/plain' });
            response.end('post ok');
        });
    } else if (request.url == '/comments' && request.method.toLowerCase() == 'get') {
        var query = require('url').parse(request.url, true).query;
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.write(JSON.stringify(comments.get()));
        response.end();
    } else {
        var filename = path.join(__dirname, 'public', request.url);
        var stat;
        try {
            stat = fs.statSync(filename);
        } catch (e) {
            response.writeHead(404, { 'Content-Type': 'text/plain' });
            response.write('404 Not Found\n');
            response.end();
            return;
        }
        if (stat.isFile()) {
            var type = mime.lookup(filename);
            response.writeHead(200, { 'Content-Type': type });
            fs.createReadStream(filename).pipe(response);
        } else {
            response.writeHead(404, { 'Content-Type': 'text/plain' });
            response.write('404 Not Found\n');
            response.end();
        }
    }
});
server.listen(8000);
console.log('Server is running at http://localhost:8000/');