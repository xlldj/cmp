export function obj2arr (o) {
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
