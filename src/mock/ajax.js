import heaterHandler from './heater'
import creditsHandler from './credits'
import orderStatHandler from './order.js'
import orderConsumptionHandler from './orderConsumption'
import userAuthHandler from './userAuth'
import lostHandler from './lost'
import fundCheckHandler from './fundCheck'

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
    return orderStatHandler(resource, body, cb)
  }
}
const contain = (target, ...arr) => {
  if (arr) {
    for (let i = 0, l = arr.length; i < l; i++) {
      if (target.indexOf(arr[i]) !== -1) {
        return true
      }
    }
  }
  return false
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
  } else if (resource.indexOf('order/consumption/device') !== -1) {
    return orderConsumptionHandler(resource, body)
  } else if (contain(resource, 'user/auth/list', 'user/deauth')) {
    return userAuthHandler(resource, body)
  } else if (
    contain(resource, 'lost/list', 'lost/details', 'lost/comments/list')
  ) {
    return lostHandler(resource, body)
  } else if (
    contain(
      resource,
      'fundsCheck/mistake/list',
      'fundsCheck/mistake/detail',
      'fundsCheck/mistake/settle'
    )
  ) {
    return fundCheckHandler(resource, body)
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
