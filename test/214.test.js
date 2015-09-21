/*
 * @autho: zimyuan
 * @last-edit-date: 2015-09-07
 */
var scp  = require('../src/scpLoadFile').scp,
	exec = require('child_process').exec,
	config = require('../config'),
	should = require('should'),
	path = require('path');

describe('test/214.test.js', function() {
	describe('mkdir', function() {
		it('should create dir "testdir" on server', function(done) {
			scp.mkdir('testdir', function(err) {
				should.not.exist(err);
				done();
			});
		});
	});

	describe('upload', function() {
		// create test file before test
		before(function(done) {
			var localTestFile = config.local_path + '214test.txt';
			var command = 'touch ' + localTestFile + ' && echo hello world > ' + localTestFile;
			var touch = exec(command, {}, function(err, stdout, stderr) {
				console.log('    create file "214test.txt" successful!');
				done();
			});
		});

		it('should upload normal file "214test.txt" successful', function(done) {
			scp.send('214test.txt', 'testdir/214test.txt', function(err) {
				should.not.exist(err);
				done();									
			});
		});

		it('should not upload local file "214test1.txt" when it was not exist', function(done) {
			scp.send('214test1.txt', 'testdir/214test1.txt', function(err) {
				should.exist(err);
				err.should.containEql('is not exist');
				done();			
			});
		});

		it('should not upload file to "testdir1" when it was not exist on server', function(done) {
			scp.send('214test.txt', 'testdir1/214test.txt', function(err) {
				should.exist(err);
				err.should.containEql('is not exist on server');
				done();			
			});
		});

		it('should not upload file to "testdir/testdirchild" when it was not exist on server', function(done) {
			scp.send('214test.txt', 'testdir1/testdirchild/214test.txt', function(err) {
				should.exist(err);
				err.should.containEql('is not exist on server');
				done();			
			});
		});
	});

	describe('down', function() {
		it('should download file "214test.txt" from server to local', function(done) {
			scp.get('214test.txt', 'testdir/214test.txt', function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should not download file "214test1.txt" from server to local when it is not exist on server', function(done) {
			scp.get('214test.txt', 'testdir/214test1.txt', function(err) {
				should.exist(err);
				err.should.containEql('the file');
				err.should.containEql('is not exist on server');
				done();			
			});
		});

		it('should not download file "214test1.txt" from server to local when the path is not exist on server', function(done) {
			scp.get('214test.txt', 'testdir1/214test1.txt', function(err) {
				should.exist(err);
				err.should.containEql('the path');
				err.should.containEql('is not exist on server');
				done();			
			});
		});		

	});
});
