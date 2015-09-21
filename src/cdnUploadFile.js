/*
 * @author: zimyuan
 * @last-edit-date: 2015-09-01
 */
var config     = require('../config'),
	path       = require('path'),
	fs         = require('fs'),
	request    = require('request'),
	_util      = require('./util'),
	template   = require('lodash/String').template,
	Eventproxy = require('eventproxy'),
	colors     = require('colors'),
	cdn        = {},
	md5		   = require('md5'),
	headers    = {
		"X-CDN-Authentication": config.cdn_token,
		"Content-Type": "application/octet-stream"
	};

/*
 * print message to console after uploading successful
 * @param {String} localPath: local file path
 * @param {Object} response from server
 */
function uploadSuccessHandler(localPath, body) {
	console.log('-----------------------------------------');
	console.log('')
	console.log(('the file ' + localPath + ' is uploaded success!').green);
	console.log('the cdn path are:');
	console.log((body.cdn_url.split('|')[0]).green);
	console.log((body.cdn_url.split('|')[1]).green);	
	console.log('')
	console.log('-----------------------------------------');	
}

/*
 * upload local file to cdn
 * @param {String} localPath: the relative path of file that need to be upload
 */
cdn.upload = function(localPath, needmd5, callback) {
	var	req, form, msg,
		domain 		= 'http://' + config.cdn_domain + ':' + config.cdn_port,
		uploadPath  = '/uploadserver/uploadfile.jsp',
		uploadParam = '?appname=<%= appname %>&user=<%= user %>&filename=<%= filename %>' + 
					  '&filetype=<%= filetype %>&filepath=/<%= filepath %>/&filesize=<%= filesize %>';
		url = domain + uploadPath + uploadParam,
		basename = path.basename(localPath),
		localFile = config.local_path + basename,
		param = {
			appname : config.cdn_appname,
			user    : config.cdn_user,
			filename: basename.split('.')[0],
			filetype: basename.split('.')[1],
			filepath: config.cdn_path
		},
		ep = new Eventproxy(),
		options = {
			method: "POST",
			headers: headers
		},

	_util.checkLocalPathExist(localFile, function(exists) {
		if (!exists) {
			msg = 'the file ' + localFile + ' is not exist! ';
			console.log(msg.red);
			callback && callback(msg);			
		}
		param.filename = needmd5 ? md5(fs.readFileSync(localFile)) : param.filename;
		ep.emit('file_done');
	});

	// get the size of local file
	ep.on('file_done', function() {
		fs.stat(localFile, function(err, data) {
			if (err) {
				console.log(err);
				callback && callback(err);
				return;
			}
			param.filesize = data.size;
			options.url = template(url)(param);
			ep.emit('url_done');
		});
	});
	
	// send request
	ep.on('url_done', function() {
		req = request(options, function(err, response, body) {
			if (err) {
				console.log(err);
				callback && callback(err);
			} else {
				uploadSuccessHandler(localPath, JSON.parse(body));			
				callback && callback(null);
			}
		});
		form = req.form();
		form.append('file', fs.createReadStream(localFile));		
	});
}

// usage
// cdn.upload('./test.txt', false);

module.exports = cdn;
