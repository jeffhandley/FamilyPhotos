var fs = require('fs')
var exif = require('exif-renamer')()
var yargs = require('yargs').argv
var path = require('path')
var dateformat = require('dateformat')

var source = yargs.src
var photos = yargs.photos
var videos = yargs.videos
var recursive = !!yargs.recursive

console.log('Source: %s', source)
console.log('Moving photos to %s/yyyy/yyyy-mm/yyyy-mm-dd', photos)
console.log('Moving videos to %s/yyyy/yyyy-mm/yyyy-mm-dd', videos)
console.log('Recursive: ' + recursive)

var fileCallback = function(err, result) {
	if (err) {
		var ext = err.result.original.ext

		if (ext == 'mov') {
			var sourcePath = err.result.original.path

			fs.stat(sourcePath, function(err, stat) {
				var videoPath = path.join(videos, dateformat(stat.birthtime, 'yyyy/yyyy-mm/yyyy-mm-dd/yyyy-mm-dd-HH-MM-ss') + '.mov')
				var videoDirectory = path.dirname(videoPath)

				if (sourcePath != videoPath) {
					fs.mkdir(videos, function(videoDirErr) {
						fs.mkdir(path.join(videos, dateformat(stat.birthtime, 'yyyy')), function (yearDirErr) {
							fs.mkdir(path.join(videos, dateformat(stat.birthtime, 'yyyy/yyyy-mm')), function (monthDirErr) {
								fs.mkdir(path.join(videos, dateformat(stat.birthtime, 'yyyy/yyyy-mm/yyyy-mm-dd')), function (dayDirErr) {
									fs.rename(sourcePath, videoPath, function(renameErr) {
										if (renameErr) {
											console.log('Error moving video to ' + videoPath + ': ' + renameErr)
										}
										else {
											console.log('Video: %s --> %s', sourcePath, videoPath)
										}
									})
								})
							})	
						})					
					})
				}
				else {
					console.log('Already done: %s', videoPath)
				}	
			})
		}
		else if (ext == 'thm' || ext == 'ctg')
		{
			console.log('Deleting %s', err.result.original.path)
			fs.unlink(err.result.original.path, function(unlinkErr) { if (unlinkErr) { console.log('Could not delete %s', err.result.original.path)}})
		}
		else if (err.result.original.path == err.result.processed.path) {
			console.log('Already done: %s', err.result.processed.path)
		}
		else {
			console.log(err)
		}
	}
	else {
		console.log('Photo: %s --> %s', result.original.path, result.processed.path)
	}
}

var dirCallback = function(err, result) {
	if (err) {
		console.log(err)
	}
	else {
		console.log('Done!')
	}
}

fs.stat(source, function(err, stat) {
	if (err) {
		console.log(err)
	}
	else {
		var dest = path.join(photos, '{{datetime "yyyy"}}/{{datetime "yyyy-mm"}}/{{datetime "yyyy-mm-dd"}}')
		var destTemplate = dest + ':{{datetime "yyyy-mm-dd-HH-MM-ss"}}.jpg'

		if (stat.isFile()) {
			exif.rename(source, destTemplate, fileCallback)
		}
		else {
			exif.rename_dir(source, destTemplate, recursive, dirCallback, fileCallback)
		}
	}
})
