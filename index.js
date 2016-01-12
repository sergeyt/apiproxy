"use strict";
const request = require('request');
const urljoin = require('urljoin');
const _ = require('lodash');

// TODO disable logging of text/event-stream

const ignoreResponseHeaders = ['set-cookie', 'content-length'];
const ignoreHeaders = ['host', 'cookie'];
const heartbeat = ':heartbeat signal';

function makeRequestOptions(req, url, serverPort) {
	const result = Object.assign(
		{ url, headers: {} },
		_.pick(req, 'method', 'query', 'timeout', 'maxRedirects')
	);

	_.each(req.headers, (val, key) => {
		if (_.contains(ignoreHeaders, key) === false) {
			result.headers[key] = val;
		}
	});

	const port = '' + (req.secure ? 443 : serverPort);

	if (req.hostname) {
		result.headers['x-forwarded-host'] = req.hostname + ':' + port;
	}
	if (req.ip) {
		result.headers['x-forwarded-for'] = req.ip;
	}

	result.headers['x-forwarded-proto'] = req.secure ? 'https' : 'http';
	result.headers['x-forwarded-port'] = port;

	return result;
}

module.exports = function makeProxy(options) {
	let base = options.base;
	if (!base && options.port) {
		base = `http://localhost:${options.port}`;
	}
	return (req, res) => {
		const url = urljoin(base, req.url);
		// console.log('request:', JSON.stringify(
		// 	_.pick(req, 'hostname', 'port', 'method', 'url', 'headers'),
		// 	null, 2
		// ));
		const requestOptions = makeRequestOptions(req, url, options.serverPort);
		requestOptions.host = req.host;
		const apiRequest = req.pipe(request(requestOptions));

		apiRequest.on('error', err => {
			console.log('error: ', err);
			res.end();
		});

		apiRequest.on('end', () => {
			res.end();
		});

		function streamData() {
			apiRequest.on('data', data => {
				const s = data.toString().trim();
				if (s) {
					if (s.indexOf(heartbeat) < 0) {
						console.log('%s', s);
					}
					res.write(s + '\n\n');
				} else {
					res.write(heartbeat + '\n\n');
				}
				res.flush();
			});
		}

		apiRequest.on('response', response => {
			const headers = response.headers;
			// console.log('response headers:', JSON.stringify(headers, null, 2));
			_.each(headers, (val, key) => {
				if (_.contains(ignoreResponseHeaders, key) === false) {
					res.set(key, val);
				}
			});
			const isEventStream = headers['content-type'] === 'text/event-stream';
			if (isEventStream) {
				streamData();
			} else {
				apiRequest.pipe(res);
			}
		});
	};
};
