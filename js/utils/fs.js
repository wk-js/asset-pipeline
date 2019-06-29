"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Fs = __importStar(require("fs"));
const filelist_1 = require("filelist");
const path_1 = require("path");
const promise_1 = require("./promise");
const child_process_1 = require("child_process");
filelist_1.FileList.debug = false;
function isFile(path) {
    try {
        const stat = Fs.statSync(path);
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
        const stat = Fs.statSync(path);
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
        Fs.statSync(path);
    }
    catch (e) {
        return false;
    }
    return true;
}
exports.exists = exists;
function copy(fromFile, toFile) {
    return new Promise(function (resolve, reject) {
        let fileValid = fromFile !== toFile;
        if (!fileValid)
            throw `Cannot copy '${fromFile}' to the same path`;
        fileValid = isFile(fromFile);
        if (!fileValid)
            throw `'${fromFile}' is not a file`;
        ensureDir(path_1.dirname(toFile)).then(function () {
            const rs = Fs.createReadStream(fromFile);
            const ws = Fs.createWriteStream(toFile);
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
function remove(path) {
    if (isDirectory(path))
        return removeDir(path);
    return new Promise((resolve, reject) => {
        if (!isFile(path))
            throw 'Cannot be removed. This is not a file.';
        Fs.unlink(path, function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(true);
        });
    });
}
exports.remove = remove;
function removeDir(dir) {
    return __awaiter(this, void 0, void 0, function* () {
        const files = fetch(path_1.join(dir, '**/*'));
        for (let i = 0; i < files.length; i++) {
            yield remove(files[i]);
        }
        const dirs = fetchDirs(path_1.join(dir, '**/*')).reverse();
        for (let j = 0; j < dirs.length; j++) {
            Fs.rmdirSync(dirs[j]);
        }
        Fs.rmdirSync(dir);
        return true;
    });
}
exports.removeDir = removeDir;
function mkdir(dir) {
    return new Promise(function (resolve, reject) {
        Fs.mkdir(dir, function (err) {
            if (err && err.code !== 'EEXIST') {
                reject(err);
                return;
            }
            resolve(true);
        });
    });
}
exports.mkdir = mkdir;
function move(fromFile, toFile) {
    return __awaiter(this, void 0, void 0, function* () {
        yield copy(fromFile, toFile);
        return remove(fromFile);
    });
}
exports.move = move;
function rename(fromFile, toFile) {
    return move(fromFile, toFile);
}
exports.rename = rename;
function ensureDir(path) {
    return __awaiter(this, void 0, void 0, function* () {
        path = path_1.normalize(path);
        if (isDirectory(path))
            return new Promise((resolve) => resolve(true));
        const dirs = path.split(/\\|\//);
        const initial = path_1.isAbsolute(path) ? dirs.shift() : '.';
        const slash = process.platform == 'win32' ? '\\' : '/';
        let res = initial;
        let d = '';
        for (let i = 0; i < dirs.length; i++) {
            d = dirs[i];
            if (d === '.')
                continue;
            res += slash + d;
            if (!isDirectory(res))
                yield mkdir(res);
        }
    });
}
exports.ensureDir = ensureDir;
function fetch(include, exclude) {
    const FL = new filelist_1.FileList;
    const includes = Array.isArray(include) ? include : [include];
    const excludes = Array.isArray(exclude) ? exclude : exclude ? [exclude] : [];
    includes.forEach((inc) => FL.include(inc));
    excludes.forEach((exc) => FL.exclude(exc));
    let files = [];
    try {
        files = FL.toArray();
    }
    catch (e) { }
    files = files.filter(function (file) {
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
    return __awaiter(this, void 0, void 0, function* () {
        yield ensureDir(path_1.dirname(file));
        return new Promise((resolve, reject) => {
            Fs.writeFile(file, content, function (err) {
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
    return new Promise((resolve, reject) => {
        Fs.readFile(file, options, function (err, data) {
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
    return __awaiter(this, void 0, void 0, function* () {
        const content = yield readFile(file);
        const modified = yield callback(content);
        return writeFile(modified, file);
    });
}
exports.editFile = editFile;
function appendFile(content, file) {
    return new Promise((resolve, reject) => {
        Fs.appendFile(file, content, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(true);
            }
        });
    });
}
exports.appendFile = appendFile;
function isSymbolicLink(path) {
    try {
        const stats = Fs.statSync(path);
        if (!stats.isSymbolicLink())
            throw 'Not a symbolic link';
    }
    catch (e) {
        return false;
    }
    return true;
}
exports.isSymbolicLink = isSymbolicLink;
function symlink(fromPath, toPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!path_1.isAbsolute(fromPath))
            fromPath = path_1.join(process.cwd(), fromPath);
        if (!path_1.isAbsolute(toPath))
            toPath = path_1.join(process.cwd(), toPath);
        if (isSymbolicLink(toPath) || exists(toPath)) {
            throw `Cannot create a symbolic link at ${toPath}`;
        }
        yield ensureDir(path_1.dirname(toPath));
        return promise_1.promise((resolve, reject) => {
            Fs.symlink(fromPath, toPath, function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(true);
            });
        });
    });
}
exports.symlink = symlink;
function symlink2(fromPath, toPath, shell = process.platform == 'win32' ? 'cmd' : 'bash') {
    return __awaiter(this, void 0, void 0, function* () {
        if (exists(toPath))
            throw `Cannot create a symbolic link at ${toPath}`;
        let command = '';
        if (!path_1.isAbsolute(fromPath))
            fromPath = path_1.join(process.cwd(), fromPath);
        if (!path_1.isAbsolute(toPath))
            toPath = path_1.join(process.cwd(), toPath);
        yield ensureDir(path_1.dirname(toPath));
        if (process.platform == 'win32') {
            command = `mklink /D "${toPath}" "${fromPath}"`;
        }
        else {
            command = `ln -s ${fromPath} ${toPath}`;
        }
        return promise_1.promise((resolve, reject) => {
            const cmd = command.split(' ');
            const cli = cmd.shift();
            const ps = child_process_1.spawnSync(cli, cmd, { shell: shell });
            if (ps.error) {
                reject(ps.error);
            }
            else {
                resolve(true);
            }
        });
    });
}
exports.symlink2 = symlink2;
