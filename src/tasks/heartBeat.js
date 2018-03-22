// This is for heart beat of online status.
// Send to server every 'HEARTBEATTIMEOUT'
import { removeStore } from '../util/storage'
import AjaxHandler from '../util/ajax'
import CONSTANTS from '../constants'
const { HEARTBEATTIMEOUT } = CONSTANTS
let ti = null
let dispatchContext = null
const sendCheck2Server = () => {
  let resource = '/employee/cs/online/heart/beat'
  const cb = json => {
    if (json.data) {
      let { result } = json.data
      if (result === false) {
        // stop heart beat, change state to offline.
        stopBeat()
        removeStore('online')
        dispatchContext &&
          dispatchContext({
            type: 'SET_USERINFO',
            value: {
              csOnline: false
            }
          })
      }
    }
  }
  AjaxHandler.ajax(resource, null, cb)
  ti = setTimeout(sendCheck2Server, HEARTBEATTIMEOUT)
}
// ti for sending heart check to server. For online status remain.
export const heartBeat = dispatch => {
  console.log('beat')
  if (ti) {
    clearTimeout(ti)
  }
  dispatchContext = dispatch
  sendCheck2Server()
}

export const stopBeat = () => {
  console.log('stop')
  if (ti) {
    clearTimeout(ti)
    ti = null
  }
}
