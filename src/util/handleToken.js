export function setToken(token) {
  sessionStorage.token = token
}

export function getToken() {
  return sessionStorage.token
}
