let registry = new Map()
export default {
  add: obj => {
    let objid = obj._objid
    if (objid !== null && objid !== undefined) {
      return registry.set(objid, obj)
    }
  },
  remove: obj => {
    if (typeof obj === 'object') {
      return registry.delete(obj._objid)
    } else {
      return registry.delete(obj)
    }
  },
  get: objid => {
    return registry.get(objid)
  },
  has: objid => {
    return registry.has(objid)
  },
}
