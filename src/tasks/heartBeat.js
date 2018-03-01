// This is for heart beat of online status.
// Send to server every 'HEARTBEATTIMEOUT'
import AjaxHandler from '../util/ajax'
import CONSTANTS from '../constants'
const { HEARTBEATTIMEOUT } = CONSTANTS
let ti = null
const sendCheck2Server = () => {
  let resource = '/employee/cs/online/heart/beat'
  const cb = () => {}
  AjaxHandler.ajax(resource, null, cb)
  ti = setTimeout(sendCheck2Server, HEARTBEATTIMEOUT)
}
// ti for sending heart check to server. For online status remain.
export const heartBeat = () => {
  console.log('beat')
  if (ti) {
    clearTimeout(ti)
  }
  sendCheck2Server()
}

export const stopBeat = () => {
  console.log('stop')
  if (ti) {
    clearTimeout(ti)
    ti = null
  }
}