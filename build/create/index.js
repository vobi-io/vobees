'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* eslint import/named:0 */

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

var _helpers = require('../utils/helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CreateModule = function () {
  function CreateModule(moduleName) {
    _classCallCheck(this, CreateModule);

    this.moduleName = moduleName.trim();
    var LModule = this.moduleName.charAt(0).toLowerCase() + this.moduleName.slice(1);
    this.LModule = LModule;

    this.workingDirectory = process.cwd();
    this.appDirectory = this.workingDirectory + '/app';
    this.modulesDirectory = this.appDirectory + '/modules';
    this.newModuleDirectory = this.modulesDirectory + '/' + LModule;

    this.create();
  }

  _createClass(CreateModule, [{
    key: 'checkModuleFolder',
    value: function checkModuleFolder() {
      if (!_fs2.default.existsSync(this.appDirectory)) {
        _fs2.default.mkdirSync(this.appDirectory);
      }

      if (!_fs2.default.existsSync(this.modulesDirectory)) {
        _fs2.default.mkdirSync(this.modulesDirectory);
      }

      if (_fs2.default.existsSync(this.newModuleDirectory)) {
        return false;
      }

      return true;
    }
  }, {
    key: 'copyModuleFiles',
    value: function copyModuleFiles() {
      var templatesDirectory = _path2.default.join(__dirname, '../../templates/modules');
      var src = templatesDirectory + '/' + this.LModule;
      var dest = this.modulesDirectory + '/' + this.LModule;

      (0, _helpers.copyDir)(src, dest);
    }
  }, {
    key: 'create',
    value: function create() {
      var result = this.checkModuleFolder();
      if (!result) {
        return console.log(_colors2.default.red('Module ' + this.moduleName + ' already exists!'));
      }

      this.copyModuleFiles();

      return console.log(_colors2.default.green('Module ' + this.moduleName + ' successfully created!'));
    }
  }]);

  return CreateModule;
}();

module.exports = CreateModule;