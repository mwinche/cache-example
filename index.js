#!/usr/bin/env node

var fs = require('fs');
var http = require('http');

var INDEX = './public/index.html',
	FIRST = './public/first.js',
	SECOND = './public/second.js',
	THIRD = './public/third.js';

var files = {
	'/': INDEX,
	'/first.js': FIRST,
	'/second.js': SECOND,
	'/third.js': THIRD
};

var server = http.createServer(function(req, res){
	try{
		var filePath = files[req.url];
		if(!filePath){
			res.statusCode = 404;
			res.end();
		}

		var stats = fs.statSync(filePath);
		var eTag = '' + stats.mtime.getTime();


		switch(filePath){
			case INDEX:
				res.setHeader('cache-control', 'no-cache public');
				res.setHeader('content-type', 'text/html; charset=UTF-8');
				break;


			case FIRST:
				res.setHeader('cache-control', 'max-age=15');
				res.setHeader('content-type', 'text/javascript; charset=UTF-8');
				res.setHeader('etag', eTag);
				break;


			case SECOND:
				res.setHeader('content-type', 'text/javascript; charset=UTF-8');
				res.setHeader('expires', new Date(Date.now() + 15000).toUTCString());
				res.setHeader('last-modified', stats.mtime.toGMTString());
				break;


			case THIRD:
				break;
			default:
				
		}

		res.statusCode = 200;

		if(req.headers['if-none-match'] === eTag && filePath !== INDEX){
			res.statusCode = 304;

			res.end();
		}
		else{
			res.setHeader('content-length', stats.size);
			fs.createReadStream(filePath).pipe(res);
		}

		if(filePath === INDEX){
			console.log('=======New page request========');
		}

		console.log(req.url, res.statusCode);		
	}
	catch(e){
		console.log(e);
	}
});

server.listen(8008);
