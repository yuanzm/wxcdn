/*
 * @autho: zimyuan
 * @last-edit-date: 2015-09-07
 */
var cdn    = require('../src/cdnUploadFile'),
	exec   = require('child_process').exec,
	should = require('should'),
	config = require('../config'),
	path   = require('path');

describe('test/cdn.test.js', function() {	
	describe('upload', function() {
		before(function(done) {
			var localTestFile = config.local_path + 'cdntest.txt';
			var command = 'touch ' + localTestFile + ' && echo hello world > ' + localTestFile;
			var touch = exec(command, {}, function(err, stdout, stderr) {
				console.log('    create file "cdntest.txt" successful!');
				done();
			});
		});
		it('should upload normal file "cdntest.txt" successful', function(done) {
			cdn.upload('cdntest.txt', false, function(err) {
				should.not.exist(err);
				done();			
			});
		});

		it('should not upload local file when it is not exist', function() {
			cdn.upload('cdntest1.txt', false, function(err) {
				should.exist(err);
				err.should.containEql('the file');
				err.should.containEql('is not exist');
				done();			
			});			
		});

		it('should upload md5 file "cdntest.txt" successful', function(done) {
			cdn.upload('cdntest.txt', true, function(err) {
				should.not.exist(err);
				done();			
			});
		});

		it('should not upload md5 file when it is not exist', function() {
			cdn.upload('cdntest1.txt', true, function(err) {
				err.should.containEql('the file');
				err.should.containEql('is not exist');
				done();			
			});			
		});
	});
});
