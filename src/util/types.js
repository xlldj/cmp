export function obj2arr(o) {
  if (typeof o !== 'object' || !o) {
    return []
  }
  let result = []
  for (let key in o) {
    if (o.hasOwnProperty(key)) {
      result.push({
        key: key,
        value: o[key]
      })
    }
  }
  return result
}

export function isNumber(n) {
  return n === +n
}

export function checkAllEmpty(o) {
  for (let key in o) {
    if (o.hasOwnProperty(key)) {
      if (o[key]) {
        return false
      }
    }
  }
  return true
}

export function deleteEmptyKeyInObject(o) {
  // only delete '' or NaN, not delete 0
  for (let key in o) {
    if (o.hasOwnProperty(key)) {
      if (o[key] === 0 || o[key] === false) {
        continue
      }
      if (!o[key]) {
        delete o[key]
      }
    }
  }
}
