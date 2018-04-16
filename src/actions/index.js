import { heartBeat, stopBeat } from '../tasks/heartBeat'
import AjaxHandler from '../util/ajax'
import { buildAuthenData } from '../util/authenDataHandle'
import { getStore, setStore, removeStore } from '../util/storage'

import { SET_BUILDING_LIST, fetchBuildings } from './building'

import { CHANGE_DEVICE, changeDevice, fetchDeviceList } from './device'
import {
  CHANGE_HEATER,
  changeHeater,
  fetchHeaterList
} from '../pages/heater/action'
import { CHANGE_ORDER, changeOrder } from '../pages/order/action'
import {
  CHANGE_DOORFORBID,
  changeDoorForbid,
  fetchDoorForbidList,
  fetchDetailRecordList
} from '../pages/doorForbid/action'

export const SET_USERINFO = 'SET_USERINFO'
export const setUserInfo = value => {
  return {
    type: SET_USERINFO,
    value
  }
}

export const SET_AUTHENDATA = 'SET_AUTHENDATA'
export const setAuthenData = value => {
  return {
    type: SET_AUTHENDATA,
    value
  }
}

// change status of customer to online
export const changeOnline = () => {
  return dispatch => {
    let resource = '/employee/cs/online'
    const body = null
    const cb = json => {
      if (json.data.result) {
        let data = {
          csOnline: true
        }
        // set data into store
        dispatch({
          type: 'SET_USERINFO',
          value: data
        })
        setStore('online', 1)
        // each time change online, start heart beat.
        heartBeat()
      }
    }
    return AjaxHandler.ajax(resource, body, cb)
  }
}

export const changeOffline = (forceOffline, stillHasTaskCallback) => {
  return dispatch => {
    let resource = '/employee/cs/offline'
    const body = {
      force: forceOffline
    }
    const cb = json => {
      if (json.data) {
        let data = {}
        if (forceOffline || json.data.amount === 0) {
          data.csOnline = false

          // set data into store
          dispatch({
            type: 'SET_USERINFO',
            value: data
          })
          removeStore('online')
          stopBeat()
        } else {
          if (stillHasTaskCallback) {
            stillHasTaskCallback()
          }
        }
      }
    }
    return AjaxHandler.ajax(resource, body, cb)
  }
}
// fetch privilege/list
export const fetchPrivileges = () => {
  return dispatch => {
    let resource = '/privilege/list'
    const body = null
    const cb = json => {
      let fullPrivileges = json.data.privileges
      // set full privileges data
      let full = buildAuthenData(fullPrivileges)
      let data = {
        full: full,
        originalPrivileges: fullPrivileges,
        authenSet: true
      }
      // set data into store
      dispatch({
        type: 'SET_AUTHENDATA',
        value: data
      })
      // store info into sessionStorage so it will remain when refresh
      // sessionStorage/authenInfo should always exist here, because it's set when login
      let authenInfo = JSON.parse(getStore('authenInfo'))
      if (authenInfo) {
        let auth = Object.assign({}, authenInfo, { full: full })
        console.log(auth)
        setStore('authenInfo', JSON.stringify(auth))
      }
    }
    return AjaxHandler.ajax(resource, body, cb)
  }
}

export const SET_GIFTS = 'SET_GIFTS'
export const setGifts = value => {
  return {
    type: SET_GIFTS,
    value
  }
}
// fetch privilege/list
export const fetchGifts = () => {
  return dispatch => {
    let resource = '/api/gift/list'
    const body = {
      page: 1,
      size: 100
    }
    const cb = json => {
      if (json.data) {
        let value = {
          gifts: json.data.gifts,
          giftSet: true
        }
        dispatch({
          type: 'SET_GIFTS',
          value: value
        })
      }
    }
    return AjaxHandler.ajax(resource, body, cb)
  }
}

export const SET_TAG_LIST = 'SET_TAG_LIST'
export const setTagList = value => {
  return {
    type: SET_TAG_LIST,
    value
  }
}

export const SET_ROLE_LIST = 'SET_ROLE_LIST'
export const setRoleList = value => {
  return {
    type: SET_ROLE_LIST,
    value
  }
}

export const SET_SCHOOL_LIST = 'SET_SCHOOL_LIST'
export const setSchoolList = value => {
  return {
    type: SET_SCHOOL_LIST,
    value
  }
}

export const CHANGE_SCHOOL = 'CHANGE_SCHOOL'
export const changeSchool = (subModule, keyValuePair) => {
  return {
    type: CHANGE_SCHOOL,
    subModule,
    keyValuePair
  }
}

export const CHANGE_FUND = 'CHANGE_FUND'
export const changeFund = (subModule, keyValuePair) => {
  return {
    type: CHANGE_FUND,
    subModule,
    keyValuePair
  }
}

export const CHANGE_GIFT = 'CHANGE_GIFT'
export const changeGift = (subModule, keyValuePair) => {
  return {
    type: CHANGE_GIFT,
    subModule,
    keyValuePair
  }
}

export const CHANGE_LOST = 'CHANGE_LOST'
export const changeLost = (subModule, keyValuePair) => {
  return {
    type: CHANGE_LOST,
    subModule,
    keyValuePair
  }
}

export const CHANGE_USER = 'CHANGE_USER'
export const changeUser = (subModule, keyValuePair) => {
  return {
    type: CHANGE_USER,
    subModule,
    keyValuePair
  }
}

export const CHANGE_TASK = 'CHANGE_TASK'
export const changeTask = (subModule, keyValuePair) => {
  return {
    type: CHANGE_TASK,
    subModule,
    keyValuePair
  }
}

export const CHANGE_EMPLOYEE = 'CHANGE_EMPLOYEE'
export const changeEmployee = (subModule, keyValuePair) => {
  return {
    type: CHANGE_EMPLOYEE,
    subModule,
    keyValuePair
  }
}

export const CHANGE_NOTIFY = 'CHANGE_NOTIFY'
export const changeNotify = (subModule, keyValuePair) => {
  return {
    type: CHANGE_NOTIFY,
    subModule,
    keyValuePair
  }
}

export const CHANGE_VERSION = 'CHANGE_VERSION'
export const changeVersion = (subModule, keyValuePair) => {
  return {
    type: CHANGE_VERSION,
    subModule,
    keyValuePair
  }
}

export const CHANGE_STAT = 'CHANGE_STAT'
export const changeStat = (subModule, keyValuePair) => {
  return {
    type: CHANGE_STAT,
    subModule,
    keyValuePair
  }
}

export {
  CHANGE_DEVICE,
  changeDevice,
  fetchDeviceList,
  CHANGE_HEATER,
  changeHeater,
  fetchHeaterList,
  CHANGE_ORDER,
  changeOrder,
  CHANGE_DOORFORBID,
  changeDoorForbid,
  fetchDoorForbidList,
  fetchDetailRecordList,
  SET_BUILDING_LIST,
  fetchBuildings
}
