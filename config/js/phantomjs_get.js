/*
* GET method
* system.args[0] == get.js
* system.args[1] == url
* system.args[2] == chraset
* system.args[3] == userAgent
* system.args[4] == referer
* system.args[5] == cookie
* system.args[6] == delay
* system.args[7] == timeout
* 
*/
"use strict";
var system = require('system');
var page = require('webpage').create();
if (system.args.length != 7) {
    console.log('Usage: get.js <URL> <charset> <userAgent> <referer> <cookie> <delay> <timeout>');
    phantom.exit(1);
}

var url = system.args[1];
var charset = system.args[2] || 'UTF=8';
var userAgent = system.args[3] || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36';
var referer = system.args[4] || '';
var cookie = system.args[5] || '';
var delay = system.args[6] || 100; //in secs
var timeout = system.args[7] || 3; //in second
var headers = {};
var code = 200;

page.onResourceRequested = function (requestData, networkRequest) {
    // console.log('requested: ' + requestData.url);
    networkRequest.setHeader('Cookie', cookie);
    networkRequest.setHeader('Referer', referer);
};
page.onResourceReceived = function (response) {
    // console.log('received: ' + JSON.stringify(response, undefined, 4));
    if (response.url == url) {
        for (var i = 0; i < response.headers.length; i++) {
            headers[response.headers[i]['name']] = response.headers[i]['value'];
        }
        code = parseInt(response.status, 10);
    }
};
phantom.outputEncoding = charset;
page.settings.userAgent = userAgent;
page.settings.javascriptEnabled = true;
page.settings.loadImages = false;
page.settings.resourceTimeout = timeout * 1000;

var t = Date.now();
page.open(url, function (status) {
    if (status !== 'success') {
        console.log('Unable to access network');
        phantom.exit(1);
        return;
    }
    t = Date.now() - t;
    // console.log('Loading time ' + t + ' msec');
    var cookie = page.evaluate(function (s) {
        return document.cookie;
    });
    // console.log("Cookie:", cookie);
    setTimeout(function () {
        var resp = {
            'Header': headers,
            'Code': code,
            'Cookie': cookie,
            'Body': page.content
        };
        console.log(JSON.stringify(resp));
        phantom.exit();
    }, parseInt(delay, 10));
});