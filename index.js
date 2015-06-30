#!/usr/bin/env node

var fs = require('fs');
var http = require('http');
var moment = require('moment');

var server = http.createServer(function(req, res){
	var filePath;

	console.log(req.url);

	switch(req.url){
		case '/':
		case '/index.html':
			res.setHeader('cache-control', 'no-cache public');
			res.setHeader('content-type', 'text/html; charset=UTF-8');
			filePath = './public/index.html';
			break;
		case '/first.js':
			res.setHeader('cache-control', 'max-age=30');
			res.setHeader('content-type', 'text/javascript; charset=UTF-8');
			filePath = './public/first.js';
			break;
		case '/second.js':
			res.setHeader('cache-control', 'private, max-age=3600');
			res.setHeader('content-type', 'text/javascript; charset=UTF-8');
			res.setHeader('expires', new Date(Date.now() + 3456000000).toUTCString());
			filePath = './public/second.js';
			break;
		case '/third.js':
			filePath = './public/third.js';
			break;
		case '/matt.jpg':
			res.setHeader('content-type', 'image/jpg');
			res.setHeader('cache-control', 'private, max-age=3456000000');
			res.setHeader('expires', 'Sun, 17-Jan-2038 19:14:07 GMT');
			filePath = './public/matt.jpg';
			break;
		default:
			res.statusCode = 404;
	}

	if(filePath !== undefined){
		var stats = fs.statSync(filePath);
		var eTag = '' + stats.mtime.getTime();

		res.statusCode = 200;

		if(filePath !== './public/index.html'){
			res.setHeader('last-modified', stats.mtime.toGMTString());
			res.setHeader('etag', eTag);
		}

		if(req.headers['if-none-match'] === eTag && filePath !== './public/index.html'){
			res.statusCode = 304;

			res.end();
		}
		else{
			res.setHeader('content-length', stats.size);
			fs.createReadStream(filePath).pipe(res);
		}
	}
	else{
		res.end();
	}
});

server.listen(8008);
