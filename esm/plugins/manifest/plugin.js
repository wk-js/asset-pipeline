import "./types";
import { Manifest } from "./manifest";
export const ManifestPlugin = {
    name: "manifest",
    setup(pipeline) {
        const manifest = new Manifest(pipeline);
        pipeline.options("manifest", manifest);
        pipeline.events.on("transformed", () => {
            manifest.save();
        });
    },
};
