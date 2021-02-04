import "./types"
import { Pipeline } from "../../pipeline"
import { PipelinePlugin } from "../../types"
import { Manifest } from "./manifest"

export const ManifestPlugin = <PipelinePlugin>{

  name: "manifest",

  setup(pipeline: Pipeline) {
    const manifest = new Manifest(pipeline)
    pipeline.events.on("transformed", () => {
      manifest.save()
    })
    return manifest
  },

}