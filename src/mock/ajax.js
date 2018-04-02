import heaterHandler from './heater'
import creditsHandler from './credits'
import orderHandler from './order.js'

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
  } else if (resource.indexOf('order/statistic') !== -1) {
    return orderHandler(resource, body, cb)
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

/* for client ajax request */
AjaxHandler.ajaxClient = (resource, body, cb) => {
  const domain = 'http://116.62.236.67:5081'
  // const domain = 'http://10.0.0.4:5081'
  // const domain = 'https://api.xiaolian365.com/c'
  // const domain = 'http://120.78.25.22:2080'
  AjaxHandler.ajax(resource, body, cb, null, { domain: domain })
}

export default AjaxHandler
