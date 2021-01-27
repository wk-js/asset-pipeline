import { join } from "path";
import { PipelineManager } from "./pipeline";
import { cleanup, normalize, PathBuilder } from "./path";
export class Resolver {
    constructor(pid) {
        this.pid = pid;
        this.root = {
            name: ".",
            path: ".",
            files: [],
            subdirectories: {}
        };
    }
    get pipeline() {
        return PipelineManager.get(this.pid);
    }
    /**
     * Look for outputPath
     */
    resolve(inputPath) {
        if (!this.pipeline)
            return inputPath;
        const { manifest } = this.pipeline;
        inputPath = normalize(inputPath, "web");
        const extra = inputPath.match(/\#|\?/);
        let suffix = '';
        if (extra) {
            suffix = extra[0] + inputPath.split(extra[0])[1];
            inputPath = inputPath.split(extra[0])[0];
        }
        let output = inputPath;
        const asset = manifest.getAsset(inputPath);
        if (asset) {
            output = asset.output;
        }
        output = normalize(output, "web");
        output = output + suffix;
        return output;
    }
    /**
     * Refresh output tree
     */
    refreshTree() {
        if (!this.pipeline)
            return;
        const { manifest } = this.pipeline;
        const tree = {
            name: ".",
            path: ".",
            files: [],
            subdirectories: {}
        };
        const assets = manifest.export("asset");
        let currDir = tree;
        let path = tree.path;
        for (const asset of assets) {
            const output = asset.output;
            const dirs = output.split("/").map(dir => dir.length === 0 ? "." : dir);
            const file = asset.type === "file" ? dirs.pop() : undefined;
            currDir = tree;
            path = tree.path;
            for (const dir of dirs) {
                if (currDir.name === dir)
                    continue;
                path = normalize(join(path, dir), "unix");
                if (!currDir.subdirectories[dir]) {
                    currDir.subdirectories[dir] = {
                        name: dir,
                        path,
                        files: [],
                        subdirectories: {}
                    };
                }
                currDir = currDir.subdirectories[dir];
            }
            if (file) {
                currDir.files.push(file);
            }
        }
        this.root = tree;
    }
    /**
     * Convert inputPath to outputPath and return its directory tree
     */
    getTree(inputPath) {
        const outputPath = this.resolve(inputPath);
        const dirs = normalize(outputPath, "web").split('/');
        let tree = this.root;
        for (let i = 0, ilen = dirs.length; i < ilen; i++) {
            if (tree.subdirectories[dirs[i]]) {
                tree = tree.subdirectories[dirs[i]];
            }
        }
        return tree;
    }
    /**
     * Get path
     */
    getPath(inputPath, options) {
        if (!this.pipeline)
            return inputPath;
        const host = this.pipeline.host;
        const output = this._getPath(inputPath, options);
        return host.pathname.join(output.os()).web();
    }
    /**
     * Get path
     */
    _getPath(inputPath, options) {
        if (!inputPath)
            throw new Error("[asset-pipeline] path cannot be empty");
        if (!this.pipeline)
            return new PathBuilder(inputPath);
        const opts = Object.assign({
            from: ".",
            cleanup: false,
        }, options || {});
        // Cleanup path and get the output path
        const outputPath = this.resolve(inputPath);
        // Cleanup from path and get the output tree
        const fromTree = this.getTree(opts.from);
        // Get output relative to from
        let output = new PathBuilder(fromTree.path);
        output = output.join(outputPath);
        if (opts.cleanup) {
            output = new PathBuilder(cleanup(output.os()));
        }
        return output;
    }
    /**
     * Get url
     */
    getUrl(inputPath, options) {
        if (!this.pipeline)
            return inputPath;
        const inputPathB = this._getPath(inputPath, options);
        return this.pipeline.host.join(inputPathB.web()).toString();
    }
    /**
     * Preview output tree
     */
    view() {
        if (!this.pipeline)
            return "";
        function ptree(tree, tab) {
            let print = '';
            Object.keys(tree.subdirectories).forEach(function (dir) {
                print += tab + dir + '\n';
                print += ptree(tree.subdirectories[dir], tab + "  ") + '\n';
            });
            print += tab + tree.files.join(`\n${tab}`);
            return print;
        }
        const output = this.pipeline.cwd.join(this.pipeline.output.os()).web();
        return output + '\n' + ptree(this.root, "  ").replace(/\n\s+\n/g, '\n');
    }
}
