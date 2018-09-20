"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.copy = exports.copyDir = exports.rmdir = exports.mkdir = undefined;

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mkdir = function mkdir(dir) {
	// making directory without exception if exists
	try {
		_fs2.default.mkdirSync(dir, 493);
	} catch (e) {
		if (e.code != "EEXIST") {
			throw e;
		}
	}
};

var rmdir = function rmdir(dir) {
	if (_path2.default.existsSync(dir)) {
		var list = _fs2.default.readdirSync(dir);
		for (var i = 0; i < list.length; i++) {
			var filename = _path2.default.join(dir, list[i]);
			var stat = _fs2.default.statSync(filename);

			if (filename == "." || filename == "..") {
				// pass these files
			} else if (stat.isDirectory()) {
				// rmdir recursively
				rmdir(filename);
			} else {
				// rm fiilename
				_fs2.default.unlinkSync(filename);
			}
		}
		_fs2.default.rmdirSync(dir);
	} else {
		console.warn("warn: " + dir + " not exists");
	}
};

var copyDir = function copyDir(src, dest) {
	mkdir(dest);
	var files = _fs2.default.readdirSync(src);
	for (var i = 0; i < files.length; i++) {
		var current = _fs2.default.lstatSync(_path2.default.join(src, files[i]));
		if (current.isDirectory()) {
			copyDir(_path2.default.join(src, files[i]), _path2.default.join(dest, files[i]));
		} else if (current.isSymbolicLink()) {
			var symlink = _fs2.default.readlinkSync(_path2.default.join(src, files[i]));
			_fs2.default.symlinkSync(symlink, _path2.default.join(dest, files[i]));
		} else {
			copy(_path2.default.join(src, files[i]), _path2.default.join(dest, files[i]));
		}
	}
};

var copy = function copy(src, dest) {
	var oldFile = _fs2.default.createReadStream(src);
	var newFile = _fs2.default.createWriteStream(dest);
	oldFile.pipe(newFile);
};

exports.mkdir = mkdir;
exports.rmdir = rmdir;
exports.copyDir = copyDir;
exports.copy = copy;