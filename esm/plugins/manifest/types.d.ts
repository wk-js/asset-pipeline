import { TransformedEntry } from "../../types";
import { Manifest } from "./manifest";
declare module "../../pipeline" {
    interface Pipeline {
        options(id: "manifest", value?: Manifest): Manifest;
    }
}
export interface ManifestFile {
    saltKey: string;
    date: string;
    entries: TransformedEntry[];
    aliases: string[];
}
