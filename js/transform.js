"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const template_1 = require("lol/js/string/template");
const object_1 = require("lol/js/object");
const minimatch_1 = __importDefault(require("minimatch"));
const path_2 = require("./utils/path");
const TemplateOptions = {
    open: '#{',
    body: '[a-z@$#-_?!]+',
    close: '}'
};
class Transform {
    constructor(type = "file") {
        this.type = type;
        this.rules = [];
    }
    /**
     * Add as transformation applied to the glob pattern
     */
    add(glob, parameters = {}) {
        glob = path_2.cleanPath(glob);
        const params = parameters = Object.assign({
            glob: glob
        }, parameters);
        params.glob = glob;
        this.rules.push(params);
    }
    /**
     * Shortcut for input/output transformation
     */
    addEntry(input, output, parameters = {}) {
        parameters = Object.assign({
            rename: output,
            keep_path: false
        }, parameters);
        this.add(input, parameters);
    }
    /**
     * Add as transformation applied to the glob pattern
     */
    ignore(glob) {
        glob = path_2.cleanPath(glob);
        const parameters = {
            glob: glob,
            ignore: true
        };
        this.rules.push(parameters);
    }
    /**
     * Clone the rules
     */
    clone(file) {
        for (let i = 0; i < this.rules.length; i++) {
            const glob = this.rules[i];
            file.rules.push(glob);
        }
        return file;
    }
    /**
     * Look for the first matching rule. If not found, a generic rule is returned.
     */
    matchingRule(path) {
        for (let i = 0, ilen = this.rules.length; i < ilen; i++) {
            const rule = this.rules[i];
            if (path === rule.glob || minimatch_1.default(path, rule.glob)) {
                return rule;
            }
        }
        return { glob: path + '/**/*' };
    }
    /**
     * Apply the transformation to the asset and register to the manifest
     */
    resolve(pipeline, asset) {
        // Ignore files registered from directory_pipeline or from previous rules
        const masset = pipeline.manifest.get(asset.input);
        if (masset && masset.resolved)
            return;
        const rule = asset.rule || this.matchingRule(asset.input);
        pipeline.manifest.set(asset);
        this.resolveOutput(pipeline, asset.input, object_1.clone(rule));
    }
    resolveOutput(pipeline, file, rule) {
        let output = file, pathObject;
        // Remove path and keep basename only
        if (typeof rule.keep_path === 'boolean' && !rule.keep_path) {
            output = path_1.basename(output);
        }
        // Add base_dir
        if (typeof rule.base_dir === 'string') {
            output = path_1.join(pipeline.resolve.output(), rule.base_dir, output);
            output = path_1.relative(pipeline.resolve.output(), output);
        }
        // Replace dir path if needed
        pathObject = path_1.parse(output);
        pathObject.dir = pipeline.resolve.path(pathObject.dir);
        output = path_1.format(pathObject);
        let cache = output;
        const hash = pipeline.cache.generateHash(output + pipeline.cache.key);
        let options = {
            rule,
            input: Object.assign({ hash, fullpath: file }, path_1.parse(file)),
            output: Object.assign({ hash, fullpath: output }, path_1.parse(output))
        };
        if (typeof rule.output == 'function') {
            rule.output = output = cache = rule.output(options);
        }
        else if (typeof rule.output === 'string') {
            output = cache = template_1.template2(rule.output, object_1.flat(options), TemplateOptions);
        }
        if (typeof rule.cache == 'function') {
            rule.cache = cache = rule.cache(options);
        }
        else if (typeof rule.cache === 'string') {
            cache = template_1.template2(rule.cache, object_1.flat(options), TemplateOptions);
        }
        else if ((typeof rule.cache == 'boolean' && rule.cache && pipeline.cache.enabled)
            ||
                (typeof rule.cache != 'boolean' && pipeline.cache.enabled)) {
            if (pipeline.cache.type === 'hash') {
                cache = pipeline.cache.hash(output);
            }
            else if (pipeline.cache.type === 'version' && this.type === 'file') {
                cache = pipeline.cache.version(output);
            }
        }
        const asset = pipeline.manifest.get(file);
        asset.input = path_2.cleanPath(asset.input);
        asset.output = path_2.cleanPath(output);
        asset.cache = path_2.cleanPath(cache);
        asset.resolved = true;
        asset.rule = rule;
        asset.tag = typeof rule.tag == 'string' ? rule.tag : 'default';
        pipeline.manifest.set(asset);
    }
}
exports.Transform = Transform;
