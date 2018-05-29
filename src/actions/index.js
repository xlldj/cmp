import { heartBeat } from '../tasks/heartBeat'
import AjaxHandler from '../util/ajax'
import { setStore } from '../util/storage'
import {
  changeOffline,
  fetchPrivileges,
  fetchTaskList,
  fetchTaskDetail,
  changeTask,
  CHANGE_TASK,
  CHANGE_MODAL_TASK,
  CHANGE_MODAL_TASKDETAIL,
  CHANGE_QUICK_LIST,
  fetchQuickList,
  CHANGE_QUICK_TYPE_LIST,
  fetchQuickTypeList
} from '../pages/task/action.js'

import { SET_BUILDING_LIST, fetchBuildings } from './building'
import {
  CHANGE_USER,
  changeUser,
  CHANGE_MODAL_USERINFO,
  fetchUserInfo
} from '../pages/user/action'
import { moduleActionFactory } from './moduleActions'

import {
  CHANGE_DEVICE,
  changeDevice,
  fetchDeviceList,
  fetchRepairList,
  CHANGE_MODAL_REPAIRLIST,
  fetchDeviceInfo,
  CHANGE_MODAL_DEVICEINFO
} from '../pages/device/action'
import {
  CHANGE_HEATER,
  changeHeater,
  fetchHeaterList
} from '../pages/heater/action'
import {
  CHANGE_ORDER,
  changeOrder,
  CHANGE_MODAL_ORDERLIST,
  fetchOrderList
} from '../pages/order/action'
import {
  CHANGE_DOORFORBID,
  changeDoorForbid,
  fetchDoorForbidList,
  fetchDetailRecordList
} from '../pages/doorForbid/action'
import {
  CHANGE_FUND,
  changeFund,
  CHANGE_MODAL_FUNDCHECK,
  fetchFundCheckList,
  fetchFundCheckInfo,
  CHANGE_MODAL_FUNDLIST,
  fetchFundList
} from '../pages/fund/action.js'

import {
  CHANGE_LOST,
  CHANGE_MODAL_LOST,
  CHANGE_MODAL_BLACK,
  CHANGE_MODAL_ENABLECOMMENT,
  fetchBlackPeopleList,
  fetchLostFoundList,
  changeLost
} from '../pages/lost/action'

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

export const CHANGE_GIFT = 'CHANGE_GIFT'
export const changeGift = (subModule, keyValuePair) => {
  return {
    type: CHANGE_GIFT,
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
  CHANGE_MODAL_REPAIRLIST,
  changeDevice,
  fetchDeviceList,
  fetchRepairList,
  CHANGE_MODAL_DEVICEINFO,
  fetchDeviceInfo,
  CHANGE_FUND,
  changeFund,
  fetchFundCheckList,
  fetchFundCheckInfo,
  CHANGE_MODAL_FUNDCHECK,
  CHANGE_MODAL_FUNDLIST,
  fetchFundList,
  CHANGE_HEATER,
  changeHeater,
  fetchHeaterList,
  CHANGE_ORDER,
  changeOrder,
  fetchOrderList,
  CHANGE_MODAL_ORDERLIST,
  CHANGE_DOORFORBID,
  changeDoorForbid,
  fetchDoorForbidList,
  fetchDetailRecordList,
  fetchBlackPeopleList,
  SET_BUILDING_LIST,
  fetchBuildings,
  CHANGE_USER,
  changeUser,
  CHANGE_MODAL_USERINFO,
  fetchUserInfo,
  moduleActionFactory,
  changeLost,
  CHANGE_LOST,
  CHANGE_MODAL_BLACK,
  CHANGE_MODAL_LOST,
  CHANGE_MODAL_ENABLECOMMENT,
  fetchLostFoundList,
  changeOffline,
  fetchPrivileges,
  fetchTaskList,
  fetchTaskDetail,
  changeTask,
  CHANGE_TASK,
  CHANGE_MODAL_TASK,
  CHANGE_MODAL_TASKDETAIL,
  CHANGE_QUICK_LIST,
  fetchQuickList,
  CHANGE_QUICK_TYPE_LIST,
  fetchQuickTypeList
}
