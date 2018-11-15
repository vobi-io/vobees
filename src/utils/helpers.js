import fs from "fs";
import path from "path";

var projectConfig = function() {
	const workingDirectory = process.cwd();

	const configFile = `${workingDirectory}/.vobirc`

	let config = {
		appPath: "src",
		seedPath: "src"
	}

	if(fs.existsSync(configFile)) {
		const projectConfigData = JSON.parse(fs.readFileSync(configFile, 'utf8'));
		console.log(projectConfigData)
		config = Object.assign({}, config, projectConfigData)
	}
	
	return config
};

var mkdir = function(dir) {
	// making directory without exception if exists
	try {
		fs.mkdirSync(dir, 0o755);
	} catch(e) {
		if(e.code != "EEXIST") {
			throw e;
		}
	}
};

var rmdir = function(dir) {
	if (fs.existsSync(dir)) {
		var list = fs.readdirSync(dir);
		for(var i = 0; i < list.length; i++) {
			var filename = path.join(dir, list[i]);
			var stat = fs.statSync(filename);
			
			if(filename == "." || filename == "..") {
				// pass these files
			} else if(stat.isDirectory()) {
				// rmdir recursively
				rmdir(filename);
			} else {
				// rm fiilename
				fs.unlinkSync(filename);
			}
		}
		fs.rmdirSync(dir);
	} else {
		console.warn("warn: " + dir + " not exists");
	}
};

var copyDir = function(src, dest) {
	mkdir(dest);
	var files = fs.readdirSync(src);
	for(var i = 0; i < files.length; i++) {
		var current = fs.lstatSync(path.join(src, files[i]));
		if(current.isDirectory()) {
			copyDir(path.join(src, files[i]), path.join(dest, files[i]));
		} else if(current.isSymbolicLink()) {
			var symlink = fs.readlinkSync(path.join(src, files[i]));
			fs.symlinkSync(symlink, path.join(dest, files[i]));
		} else {
			copy(path.join(src, files[i]), path.join(dest, files[i]));
		}
	}
};

var copy = function(src, dest) {
	var oldFile = fs.createReadStream(src);
	var newFile = fs.createWriteStream(dest);
	oldFile.pipe(newFile);
};

export {
	mkdir,
	rmdir,
	copyDir,
	copy,
	projectConfig
}