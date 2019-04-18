/// <reference types="when" />
import { AssetPipeline } from "./asset-pipeline";
import { TemplateOptions } from "lodash";
export declare class Renderer {
    pipeline: AssetPipeline;
    options: TemplateOptions;
    constructor(pipeline: AssetPipeline);
    edit(): When.Promise<boolean | null>;
    render(): When.Promise<{} | null>;
    private _render;
    private _renderSource;
    private _fetch;
    /**
     * Render
     *
     * @param {String} src
     * @param {Object} options
     * @param {Object} data
     */
    static render(src: string, options: TemplateOptions, data: object): string;
}
