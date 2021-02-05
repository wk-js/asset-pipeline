"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManifestPlugin = void 0;
require("./types");
const manifest_1 = require("./manifest");
exports.ManifestPlugin = {
    name: "manifest",
    setup(pipeline) {
        const manifest = new manifest_1.Manifest(pipeline);
        pipeline.options("manifest", manifest);
        pipeline.events.on("transformed", () => {
            manifest.save();
        });
    },
};
