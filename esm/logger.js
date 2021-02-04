let _verbose = false;
export function verbose(enable) {
    if (typeof enable === "boolean") {
        _verbose = enable;
    }
    return _verbose;
}
export function info(...args) {
    if (_verbose)
        console.log("[asset-pipeline]", ...args);
}
