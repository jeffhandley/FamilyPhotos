var fs = require('fs')
var path = require('path')
var yargs = require('yargs').argv

var processDir = function(rootPath) {
	fs.readdir(rootPath, function(err, files) {
		files.forEach(function(src) {
			src = path.join(rootPath, src)

			if (src.indexOf('.') == -1) {
				fs.stat(src, function(statErr, stat) {
					if (stat.isFile()) {
						console.log('%s --> %s', src, src + '.jpg')
						fs.renameSync(src, src + '.jpg')
					}
					else if (stat.isDirectory()) {
						console.log('Processing Directory: %s', src)
						processDir(src)
					}
				})
			}
			else {
				console.log('Ignoring: %s', src)
			}
		})
	})
}

processDir(yargs.path)