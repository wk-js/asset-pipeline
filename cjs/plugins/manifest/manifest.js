"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Manifest = void 0;
const fs_1 = require("fs");
const fs_2 = require("lol/js/node/fs");
const path_1 = require("../../path/path");
class Manifest {
    constructor(pipeline) {
        this.pipeline = pipeline;
        this.saveOnDisk = true;
        this.path = new path_1.PathBuilder("tmp/manifest.json");
        this.file = {
            saltKey: "none",
            date: new Date().toISOString(),
            entries: [],
            aliases: []
        };
    }
    set(content) {
        this.file = content;
        this.pipeline.rules.saltKey = this.file.saltKey;
        this.pipeline.files.entries = this.file.entries.map(item => item[0]);
        this.pipeline.resolver.paths = this.file.entries;
        this.pipeline.resolver.aliases = this.file.aliases.map(alias => new path_1.PathBuilder(alias));
    }
    /**
     * Check if manifest file is created
     */
    exists() {
        return this.saveOnDisk && fs_2.isFile(this.path.unix());
    }
    /**
     * Save manifest file
     */
    save() {
        this.file.saltKey = this.pipeline.rules.saltKey;
        this.file.date = new Date().toISOString();
        this.file.entries = this.pipeline.resolver['paths'];
        if (this.saveOnDisk) {
            fs_1.writeFileSync(this.path.unix(), JSON.stringify(this.file, null, 2));
        }
    }
    /**
     * Read manifest file
     */
    read() {
        const path = this.path.unix();
        if (this.saveOnDisk && fs_2.isFile(path)) {
            const content = fs_1.readFileSync(path);
            const file = JSON.parse(content.toString('utf-8'));
            this.set(file);
        }
    }
    /**
     * Remove manifest file
     */
    delete() {
        const path = this.path.unix();
        if (fs_2.isFile(path)) {
            fs_2.removeSync(path);
        }
    }
}
exports.Manifest = Manifest;
