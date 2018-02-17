"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const when_1 = require("when");
const when_2 = __importDefault(require("when"));
const filelist_1 = require("filelist");
const path_1 = require("path");
function isFile(path) {
    try {
        const stat = fs.statSync(path);
        if (!stat.isFile())
            throw 'Not a file';
    }
    catch (e) {
        return false;
    }
    return true;
}
exports.isFile = isFile;
function isDirectory(path) {
    try {
        const stat = fs.statSync(path);
        if (!stat.isDirectory())
            throw 'Not a file';
    }
    catch (e) {
        return false;
    }
    return true;
}
exports.isDirectory = isDirectory;
function exists(path) {
    try {
        fs.statSync(path);
    }
    catch (e) {
        return false;
    }
    return true;
}
exports.exists = exists;
function copy(fromFile, toFile) {
    return when_1.promise(function (resolve, reject) {
        let fileValid = fromFile !== toFile;
        if (!fileValid)
            throw `Cannot copy '${fromFile}' to the same path`;
        fileValid = isFile(fromFile);
        if (!fileValid)
            throw `'${fromFile}' is not a file`;
        ensureDir(path_1.dirname(toFile)).then(function () {
            const rs = fs.createReadStream(fromFile);
            const ws = fs.createWriteStream(toFile);
            ws.on('error', function (error) {
                reject(error);
            });
            rs.on('error', function (error) {
                reject(error);
            });
            rs.on('end', function () {
                resolve(true);
            });
            rs.pipe(ws, { end: true });
        });
    });
}
exports.copy = copy;
function remove(file) {
    return when_1.promise(function (resolve, reject) {
        if (!isFile(file))
            throw 'Cannot be removed. This is not a file.';
        fs.unlink(file, function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(true);
        });
    });
}
exports.remove = remove;
function move(fromFile, toFile) {
    return when_1.reduce([
        function () { return copy(fromFile, toFile); },
        function () { return remove(fromFile); }
    ], function (res, action) {
        return action();
    }, null)
        .then(() => true);
}
exports.move = move;
function rename(fromFile, toFile) {
    return move(fromFile, toFile);
}
exports.rename = rename;
function ensureDir(path) {
    path = path_1.normalize(path);
    if (isDirectory(path))
        return when_2.default(path);
    const dirs = path.split('/');
    return when_1.reduce(dirs, function (res, d) {
        if (d === '.')
            return res;
        res += '/' + d;
        if (!isDirectory(res)) {
            return when_1.promise(function (resolve, reject) {
                fs.mkdir(res, function (err) {
                    if (err && err.code !== 'EEXIST') {
                        reject(err);
                        return;
                    }
                    resolve(res);
                });
            });
        }
        return res;
    }, '.');
}
exports.ensureDir = ensureDir;
function fetch(include, exclude) {
    const FL = new filelist_1.FileList;
    const includes = Array.isArray(include) ? include : [include];
    const excludes = Array.isArray(exclude) ? exclude : exclude ? [exclude] : [];
    includes.forEach((inc) => FL.include(inc));
    excludes.forEach((exc) => FL.exclude(exc));
    const files = FL.toArray().filter(function (file) {
        return isFile(file);
    });
    return files;
}
exports.fetch = fetch;
function fetchDirs(include, exclude) {
    const FL = new filelist_1.FileList;
    const includes = Array.isArray(include) ? include : [include];
    const excludes = Array.isArray(exclude) ? exclude : exclude ? [exclude] : [];
    includes.forEach((inc) => FL.include(inc));
    excludes.forEach((exc) => FL.exclude(exc));
    const files = FL.toArray().filter(function (file) {
        return isDirectory(file);
    });
    return files;
}
exports.fetchDirs = fetchDirs;
function writeFile(content, file) {
    return ensureDir(path_1.dirname(file)).then(function () {
        return when_1.promise(function (resolve, reject) {
            fs.writeFile(file, content, function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(true);
            });
        });
    });
}
exports.writeFile = writeFile;
function readFile(file, options) {
    if (!isFile(file))
        throw 'This is not a file.';
    return when_1.promise(function (resolve, reject) {
        fs.readFile(file, options, function (err, data) {
            if (err) {
                reject(err);
                return;
            }
            resolve(data);
        });
    });
}
exports.readFile = readFile;
function editFile(file, callback) {
    return readFile(file).then(callback).then(function (content) {
        return writeFile(content, file);
    });
}
exports.editFile = editFile;
