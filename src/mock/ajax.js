import heaterHandler from './heater'
import creditsHandler from './credits'

const AjaxHandler = {
  showingError: false
}

AjaxHandler.ajax = (resource, body, cb, serviceErrorCb, options, errorCb) => {
  /* ----handle the 'api' ----- */
  /* this is because cmp used a node.js server as a mock server at the beginning. And I used '/api' to distinguish it from Java server api */
  if (resource.includes('/api')) {
    resource = resource.replace('/api', '')
  }
  // mock data
  if (resource.indexOf('machine') !== -1) {
    return heaterHandler(resource, body, cb)
  } else if (resource.indexOf('credits') !== -1) {
    return creditsHandler(resource, body, cb)
  }
}
AjaxHandler.fetch = (resource, body, serviceErrorCb, options, errorCb) => {
  /* ----handle the 'api' ----- */
  /* this is because cmp used a node.js server as a mock server at the beginning. And I used '/api' to distinguish it from Java server api */
  if (resource.includes('/api')) {
    resource = resource.replace('/api', '')
  }
  // mock data
  if (resource.indexOf('machine') !== -1) {
    return heaterHandler(resource, body)
  } else if (resource.indexOf('credits') !== -1) {
    return creditsHandler(resource, body)
  }
}
export default AjaxHandler
