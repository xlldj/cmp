// check two objects if has same values of keys in arr.
export function checkObject(o1, o2, arr) {
  // debugger
  if (o1 === o2) {
    return true
  }
  if (
    o1 === null ||
    o2 === null ||
    typeof o1 !== 'object' ||
    typeof o2 !== 'object' ||
    !Array.isArray(arr)
  ) {
    return false
  }
  let result = true
  try {
    for (let i = 0; i < arr.length; i++) {
      // debugger
      let key = arr[i]
      if (!o1.hasOwnProperty(key) || !o2.hasOwnProperty(key)) {
        return false
      }
      let typeof1 = typeof o1[key],
        typeof2 = typeof o2[key]
      if (typeof1 !== typeof2) {
        return false
      }
      if (typeof1 === 'object') {
        if (JSON.stringify(o1[key]) !== JSON.stringify(o2[key])) {
          return false
        }
      } else if (o1[key] !== o2[key]) {
        return false
      }
    }
    return result
  } catch (e) {
    console.log(e)
    return false
  }
}
