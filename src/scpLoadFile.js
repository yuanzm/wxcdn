/*
 * @author: zimyuan
 * @last-edit-date: 2015-09-31
 */
var fs 		   = require('fs'), 
	scp        = {},
	path       = require('path'),
	_util 	   = require('./util'),
	Client     = require('scp2').Client,
	config     = require('../config'),
	colors 	   = require('colors'),
	EventProxy = require('eventProxy');
	client     = module.exports.client || new Client({
	    host: config.scp_host,
	    port: config.scp_port,
	    password: config.scp_pass,
	    username: config.scp_user,
	    remotepath: config.scp_remote_path
	}),
	local_path = config.local_path,
	scp_remote_path = config.scp_remote_path;	

/*
 * check whether the dir is exist on server
 * @param {String} remotePath: relative path to the `scp_remote_path`
 * @param {Function} callback: the function need to be called after checking
 */
function checkRemotePathExist(remotePath, callback) {
	var dirName = path.dirname(remotePath), msg, errMsg,
		serverPath = client._options.remotepath + dirName;

	client.sftp(function(err, sftp) {
		if (err) {
			client.close();
			return callback(err);
		} else {
			sftp.stat(serverPath, function(err, attr) {
				errMsg = 'the path "' + dirName + '" is not exist on server';
				msg = (err && err.type == "NO_SUCH_FILE") ? errMsg : err; 
				if (msg) {
					client.close();
					return callback(msg);
				} else {
					callback && callback(null);
				}
			});
		}
	});
}

/*
 * create dir on server
 * @param {String} dirName: the name of dir need to be created
 * @param {Function} callback: callback function 
 */
scp.mkdir = function(dirName, callback) {
	var remoteDir = client._options.remotepath + dirName;

	client.mkdir(remoteDir, function(err) {
		client.close();	
		if (err) {
			callback && callback(err);
		} else {
			callback && callback(null);		
		}
	});
}

/*
 * download file from remote server to local
 * @param {String} localPath: the local path of file
 * @param {String} remotePath: the remote path of file
 * @param {Function} callback: the callback function need to be exec after downloading
 */
scp.get = function(localPath, remotePath, callback) {
	var remotepath = client._options.remotepath + remotePath,
		ep = new EventProxy(),
		msg, msg1;
	
	localPath = local_path + localPath;
	checkRemotePathExist(remotePath, function(err) {
		if (err) {
			console.log(err.red);
			callback && callback(err);
		} else {
			client.download(remotepath, localPath, function(err) {
				client.close();
				if (err) {
					msg1 = 'the file "' + remotePath + '" is not exist on server'; 
					msg = err.type == "NO_SUCH_FILE" ? msg1 : err;
					console.log(msg.red);
					callback && callback(msg);
				} else {
					console.log(('download file "' + remotePath + '" from remote server successful').green);
					callback && callback(null);					
				}
			});
		}
	});
}
/*
 * upload file local to remote server
 * @param {String} localPath: the local path of file
 * @param {String} remotePath: the remote path of file
 * @param {Function} callback: the callback function need to be exec after uploading
 */
scp.send = function(localPath, remotePath, callback) {
	var remotepath = client._options.remotepath + remotePath,
		ep = new EventProxy(),
		msg,
		dirName = path.dirname(remotePath),
		comPath = local_path + localPath,
		serverPath = client._options.remotepath + dirName; 

	_util.checkLocalPathExist(comPath, function(exists) {
		if (!exists) {
			msg = 'local file "' + localPath + '" is not exist';
			console.log(msg.red);
			callback && callback(msg);
			return;
		}
		ep.emit('local_file_check_done');
	});

	ep.on('local_file_check_done', function() {
		checkRemotePathExist(remotePath, function(err) {
			if (err) {
				client.close();
				console.log(err.red);
				callback && callback(err);
				return;
			} else {
				client.upload(comPath, remotepath, function(err) {
					client.close();
					if (err) {
						console.log(err);
						callback && callback(err);
						return;
					} else {
						console.log(('upload file "'+ localPath + '" to remote server successful').green);		
						callback && callback(null);						
					}
				});
			}
		});
	});
}

// usage
// scp.get('./214test.txt', 'testdir/214test1.txt');
// scp.send('./214test.txt', 'testdir/214test1.txt');
// scp.mkdir('testdir');
module.exports.client = client;
module.exports.scp = scp;
