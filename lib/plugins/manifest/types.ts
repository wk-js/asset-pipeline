import { TransformedEntry } from "../../types";
import { Manifest } from "./manifest";

declare module "../../pipeline" {
  interface Pipeline {
    // Declare manifest options
    options(id: "manifest"): Manifest
  }
}

export interface ManifestFile {
  saltKey: string
  date: string
  entries: TransformedEntry[]
  aliases: string[]
}