export const deepCopy = o => {
  return JSON.parse(JSON.stringify(o))
}
export const removeArray = (src, cb) => {
  let counter = src.length - 1
  while (true) {
    let result = cb(src[counter])

    if (result) {
      src.splice(counter, 1)

      counter = src.length - 1
    } else {
      counter--
    }

    if (counter < 0) {
      break
    }
  }
}
