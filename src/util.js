/*
 * @author: zimyuan
 * @last-edit-date: 2015-09-06
 */
var fs = require('fs'),
	util = {};

util.checkLocalPathExist = function(path, callback) {
	fs.exists(path, function(exists) {
		callback && callback(exists);
	});
}

module.exports = util;
