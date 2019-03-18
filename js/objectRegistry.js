let registry = new Map();
module.exports = {
    add: (obj) => {
        return registry.set(obj._objid, obj);
    },
    remove: (obj) => {
        if (typeof obj === "object") {
            return registry.delete(obj._objid);
        } else {
            return registry.delete(obj);
        }
    },
    get: (objid) => {
        return registry.get(objid);
    },
    has: (objid) => {
        return registry.has(objid);
    }
};
