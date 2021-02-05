"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toURL = exports.toURLString = exports.URLBuilder = void 0;
const path_1 = require("./path");
class URLBuilder {
    constructor(path, _origin = "") {
        this._origin = _origin;
        this.pathname = new path_1.PathBuilder(path);
    }
    set(url) {
        try {
            const _url = toURLString(url);
            const u = new URL(_url);
            this._origin = u.origin;
            this.setPathname(u.pathname);
        }
        catch (e) {
            this._origin = "";
            this.pathname.set("/");
        }
        return this;
    }
    setOrigin(origin) {
        try {
            const _origin = toURLString(origin);
            const u = new URL(this.pathname.unix(), _origin);
            this._origin = u.origin;
            this.setPathname(u.pathname);
        }
        catch (e) {
            this._origin = "";
        }
        return this;
    }
    setPathname(path) {
        this.pathname.set(path);
        return this;
    }
    isValidURL() {
        try {
            new URL(this.pathname.toString("web"), this._origin);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    clone() { return new URLBuilder(this.pathname.web(), this._origin); }
    join(...parts) {
        return new URLBuilder(this.pathname.join(...parts).web(), this._origin);
    }
    with(...parts) {
        return this.join(...parts);
    }
    relative(to) {
        return new URLBuilder(this.pathname.relative(to).web(), this._origin);
    }
    toString() {
        if (this.isValidURL()) {
            return this.toURL().href;
        }
        return this.pathname.web();
    }
    toURL() {
        return new URL(this.pathname.toString("web"), this._origin);
    }
}
exports.URLBuilder = URLBuilder;
function toURLString(pattern) {
    if (pattern instanceof URLBuilder) {
        return pattern.toString();
    }
    else {
        return path_1.toWebString(pattern);
    }
}
exports.toURLString = toURLString;
function toURL(pattern) {
    if (pattern instanceof URLBuilder) {
        return pattern;
    }
    else {
        return new URLBuilder(pattern);
    }
}
exports.toURL = toURL;
