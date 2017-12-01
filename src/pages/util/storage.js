export function setLog (log) {
  sessionStorage.setItem('logged', 1)
}

export function getLog () {
  return sessionStorage.getItem('logged')
}

export function removeStore () {
  return sessionStorage.removeItem('logged')
}

export function setStore (key, value) {
  sessionStorage.setItem(key, value)
}

export function getStore (key) {
  return sessionStorage.getItem(key)
}

export function setLocal (key, value) {
  localStorage.setItem(key, value)
}

export function getLocal (key, value) {
  return localStorage.getItem(key)
}

export function removeLocal (key, value) {
  localStorage.removeItem(key, value)
}
