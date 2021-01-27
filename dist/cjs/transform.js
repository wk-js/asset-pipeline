"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transform = void 0;
const path_1 = require("path");
const template_1 = require("lol/js/string/template");
const object_1 = require("lol/js/object");
const minimatch_1 = __importDefault(require("minimatch"));
const path_2 = require("./path");
const TemplateOptions = {
    open: '#{',
    body: '[a-z@$#-_?!]+',
    close: '}'
};
/**
 * Look for the first matching rule. If not found, a generic rule is returned.
 */
function matchRule(path, rules) {
    for (let i = 0, ilen = rules.length; i < ilen; i++) {
        const rule = rules[i];
        if (path === rule.glob || minimatch_1.default(path, rule.glob)) {
            return rule;
        }
    }
    return { glob: path };
}
function resolveDir(pipeline, output) {
    const pathObject = path_1.parse(output);
    let dir = pathObject.dir;
    let d = [];
    dir = path_2.normalize(dir, "unix");
    const ds = dir.split('/').filter(part => !!part);
    for (let i = 0; i < ds.length; i++) {
        d.push(ds[i]);
        const dd = d.join('/');
        const asset = pipeline.manifest.getAsset(dd);
        if (!asset)
            continue;
        const ddd = asset.output;
        if (dd != ddd) {
            d = ddd.split('/');
        }
    }
    pathObject.dir = d.join('/');
    return path_1.format(pathObject);
}
function _tranformOutput(pipeline, asset, rule) {
    let output = asset.input;
    // Replace dir path if needed
    output = resolveDir(pipeline, output);
    // Remove path and keep basename only
    if (typeof rule.keepPath === 'boolean' && !rule.keepPath) {
        output = asset.type === "file" ? path_1.basename(output) : ".";
    }
    // Add base_dir
    if (typeof rule.baseDir === 'string') {
        const base_dir = pipeline.output.join(rule.baseDir, output);
        output = pipeline.output.relative(base_dir.os()).os();
    }
    const hash = pipeline.cache.generateHash(output + pipeline.cache.saltKey);
    let options = {
        rule,
        input: Object.assign({ hash, fullpath: asset.input }, path_1.parse(asset.input)),
        output: Object.assign({ hash, fullpath: output }, path_1.parse(output))
    };
    rule.output = output = _rename(output, rule.output, options);
    options.output = Object.assign({ hash, fullpath: output }, path_1.parse(output));
    if (pipeline.cache.enabled) {
        if (typeof rule.cache === "object") {
            rule.cache.hash = "hash" in rule.cache ? rule.cache.hash : options.output.hash;
            rule.cache = output = _rename(output, rule.cache, options);
        }
        else if (typeof rule.cache === "function" || typeof rule.cache === "string") {
            rule.cache = output = _rename(output, rule.cache, options);
        }
        else if ((typeof rule.cache === "boolean" && rule.cache) || rule.cache === undefined) {
            rule.cache = output = pipeline.cache.hash(output, hash);
            rule.cache = output = path_2.normalize(output, "web");
        }
    }
    asset.input = path_2.normalize(asset.input, "web");
    asset.output = path_2.normalize(output, "web");
    asset.resolved = true;
    asset.tag = typeof rule.tag == 'string' ? rule.tag : 'default';
    asset.rule = rule;
    return asset;
}
function _rename(output, rename, options) {
    switch (typeof rename) {
        case "function": {
            output = rename(options);
            break;
        }
        case "string": {
            output = template_1.template2(rename, object_1.flat(options), TemplateOptions);
            break;
        }
        case "object": {
            const parsed = Object.assign({}, options.output, rename);
            if ("hash" in rename && rename.hash) {
                parsed.name = `${parsed.name}-${rename.hash}`;
            }
            if ("ext" in rename || "name" in rename) {
                parsed.base = `${parsed.name}${parsed.ext}`;
            }
            for (const key of Object.keys(parsed)) {
                parsed[key] = template_1.template2(parsed[key], object_1.flat(options), TemplateOptions);
            }
            output = path_1.format(object_1.omit(parsed, "hash", "fullpath"));
            break;
        }
    }
    return path_2.normalize(output, "web");
}
/**
 * Apply output/cache transformation to the asset input
 */
function transform(pipeline, asset, rules) {
    // Ignore files registered from directory_pipeline or from previous rules
    const masset = pipeline.manifest.getAsset(asset.input);
    if (masset && masset.resolved)
        return asset;
    const rule = asset.rule || matchRule(asset.input, rules);
    asset.rule = rule;
    return _tranformOutput(pipeline, asset, object_1.clone(rule));
}
exports.transform = transform;
