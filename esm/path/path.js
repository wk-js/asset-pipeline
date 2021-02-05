import * as Path from "path";
import { normalize } from "./utils";
export class PathBuilder {
    constructor(path) {
        this.path = toOsString(path);
    }
    clone() { return new PathBuilder(this.path); }
    os() { return normalize(this.path, "os"); }
    unix() { return normalize(this.path, "unix"); }
    web() { return normalize(this.path, "web"); }
    ext() { return Path.extname(this.path); }
    base() { return Path.basename(this.path); }
    name() { return Path.basename(this.path, this.ext()); }
    dir() { return Path.dirname(this.path); }
    set(path) {
        this.path = toUnixString(path);
        return this;
    }
    isAbsolute() {
        return Path.isAbsolute(this.path);
    }
    join(...parts) {
        const _parts = parts.map(toUnixString);
        return new PathBuilder(Path.join(this.path, ..._parts));
    }
    with(...parts) {
        return this.join(...parts);
    }
    relative(to) {
        const _to = toUnixString(to);
        return new PathBuilder(Path.relative(this.path, _to));
    }
    toString(type = "os") {
        return normalize(this.path, type);
    }
}
export function toUnixString(pattern) {
    if (pattern instanceof PathBuilder) {
        return pattern.unix();
    }
    else {
        return normalize(pattern, "unix");
    }
}
export function toWebString(pattern) {
    if (pattern instanceof PathBuilder) {
        return pattern.web();
    }
    else {
        return normalize(pattern, "web");
    }
}
export function toOsString(pattern) {
    if (pattern instanceof PathBuilder) {
        return pattern.os();
    }
    else {
        return normalize(pattern, "os");
    }
}
export function toPath(pattern) {
    if (pattern instanceof PathBuilder) {
        return pattern;
    }
    else {
        return new PathBuilder(pattern);
    }
}
