"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const filelist_1 = require("filelist");
const utils_1 = require("wkt/js/api/file/utils");
function fetchDirs(include, exclude) {
    const FL = new filelist_1.FileList;
    const includes = Array.isArray(include) ? include : [include];
    const excludes = Array.isArray(exclude) ? exclude : exclude ? [exclude] : [];
    includes.forEach((inc) => FL.include(inc));
    excludes.forEach((exc) => FL.exclude(exc));
    const files = FL.toArray().filter(function (file) {
        return utils_1.isDirectory(file);
    });
    return files;
}
exports.fetchDirs = fetchDirs;
