'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GenerateModule = function () {
  function GenerateModule(moduleName) {
    _classCallCheck(this, GenerateModule);

    this.moduleName = moduleName.trim();

    var LModule = this.moduleName.charAt(0).toLowerCase() + this.moduleName.slice(1);

    this.workingDirectory = process.cwd();
    this.appDirectory = this.workingDirectory + '/app';
    this.modulesDirectory = this.appDirectory + '/modules';
    this.newModuleDirectory = this.modulesDirectory + '/' + LModule;

    this.generate();
  }

  _createClass(GenerateModule, [{
    key: 'createModuleFolder',
    value: function createModuleFolder() {
      if (!_fs2.default.existsSync(this.appDirectory)) {
        _fs2.default.mkdirSync(this.appDirectory);
      }

      if (!_fs2.default.existsSync(this.modulesDirectory)) {
        _fs2.default.mkdirSync(this.modulesDirectory);
      }

      if (!_fs2.default.existsSync(this.newModuleDirectory)) {
        _fs2.default.mkdirSync(this.newModuleDirectory);
      } else {
        return false;
      }

      return true;
    }
  }, {
    key: 'copyFile',
    value: function copyFile(template, filename) {
      var templatesDirectory = _path2.default.join(__dirname, '../../templates/module');

      var filePath = this.newModuleDirectory + '/' + filename;
      var templatePath = templatesDirectory + '/' + template;

      var UModule = this.moduleName.charAt(0).toUpperCase() + this.moduleName.slice(1);
      var LModule = this.moduleName.charAt(0).toLowerCase() + this.moduleName.slice(1);

      var contents = _fs2.default.readFileSync(templatePath, 'utf8');
      contents = contents.split('[UModule]').join(UModule);
      contents = contents.split('[LModule]').join(LModule);

      _fs2.default.writeFileSync(filePath, contents);

      return filePath;
    }
  }, {
    key: 'generateFile',
    value: function generateFile(template, filename, retainFileName) {
      var destFileName = retainFileName ? filename : '' + this.moduleName + filename;
      this.copyFile(template, destFileName);
    }
  }, {
    key: 'createModuleFiles',
    value: function createModuleFiles() {
      this.generateFile('controller', 'Controller.js');
      this.generateFile('model', 'Model.js');
      this.generateFile('repository', 'Repository.js');
      this.generateFile('router', 'Route.v1.js');
      this.generateFile('index', 'index.js', true);
    }
  }, {
    key: 'generate',
    value: function generate() {
      var result = this.createModuleFolder();
      if (!result) {
        return console.log(_colors2.default.red('Module ' + this.moduleName + ' already exists!'));
      }

      this.createModuleFiles();

      return console.log(_colors2.default.green('Module ' + this.moduleName + ' successfully created!'));
    }
  }]);

  return GenerateModule;
}();

module.exports = GenerateModule;