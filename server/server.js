var express = require('express');
var session = require('express-session');
var request = require('request');
var fs = require('fs');
var app = express();
var client_info = JSON.parse(fs.readFileSync('client_info', 'utf8')); 

app.use(session({
	secret: 'oauth demo',
	resave: false,
	saveUninitialized: true
}));

app.use('/', express.static(__dirname + '/../client'));

app.get('/oauth', function (req, res) {
	if (req.query.code) {
		req.session.code = req.query.code;
		var options = {
			url: 'https://github.com/login/oauth/access_token?client_id=' + client_info.client_id + '&client_secret=' + client_info.client_secret + '&code=' + req.session.code,
			headers: {
				'Accept': 'application/json'
			}
		};
		request.post(options, function (error, response, body) {
			var token_info = JSON.parse(body);
			if (token_info.access_token) {
				req.session.token = token_info.access_token;
				req.session.save();
				console.log(req.session);
			}
		});
	}
	res.redirect('/');
});

app.get('/client_info', function (req, res) {
	console.log(req.session);
	res.send({
		code: req.session.code,
		token: req.session.token,
		client_id: client_info.client_id 
	});
});

app.listen(80);
