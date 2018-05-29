import { stopBeat } from '../../tasks/heartBeat'
import AjaxHandler from '../../util/ajax'
import { buildAuthenData } from '../../util/authenDataHandle'
import { getStore, setStore, removeStore } from '../../util/storage'
import { taskService } from '../service/index'
import store from '../../index.js'
import { deepCopy } from '../../util/copy'
import Noti from '../../util/noti'
export const CHANGE_MODAL_TASK = 'CHANGE_MODAL_TASK'
export const CHANGE_MODAL_TASKDETAIL = 'CHANGE_MODAL_TASKDETAIL'

export const fetchTaskDetail = body => {
  const { taskDetailModal } = store.getState()
  const { detailLoading } = taskDetailModal
  return dispatch => {
    if (detailLoading) {
      return
    }
    dispatch({
      type: CHANGE_MODAL_TASKDETAIL,
      value: {
        detailLoading: true
      }
    })
    let resource = '/api/work/order/one'
    return AjaxHandler.fetch(resource, body).then(json => {
      const value = {
        detailLoading: false
      }
      if (json && json.data) {
        value.detail = json.data
        // store.dispatch(fetchCommentsList(commentsBody))
      }
      dispatch({
        type: CHANGE_MODAL_TASKDETAIL,
        value
      })
    })
  }
}
/**
 * 关联工单
 * @param {*} body
 */
export const relateTask = body => {
  return dispatch => {
    taskService.relateTask(body).then(json => {
      if (json.data) {
        const { taskDetailModal } = store.getState()
        const detail = deepCopy(taskDetailModal.detail)
        detail.related = true
        store.dispatch({
          type: CHANGE_MODAL_TASKDETAIL,
          value: {
            detail: detail
          }
        })
      }
    })
  }
}
/**
 * 取消关联
 * @param {*} body
 */
export const cancelRelate = body => {
  return dispatch => {
    taskService.cancelRelate(body).then(json => {
      if (json.data) {
        const { taskDetailModal } = store.getState()
        const detail = deepCopy(taskDetailModal.detail)
        detail.related = false
        store.dispatch({
          type: CHANGE_MODAL_TASKDETAIL,
          value: {
            detail: detail
          }
        })
      }
    })
  }
}
/**
 * 催单
 * @param {} body
 */
export const csRemind = body => {
  return dispatch => {
    taskService.csRemind(body).then(json => {
      if (json.data) {
        Noti.hintOk('操作成功', '催单成功')
        const { taskDetailModal } = store.getState()
        const detail = deepCopy(taskDetailModal.detail)
        detail.csRemindAble = false
        store.dispatch({
          type: CHANGE_MODAL_TASKDETAIL,
          value: {
            detail: detail
          }
        })
      }
    })
  }
}
// fetch task/list
export const fetchTaskList = body => {
  const { taskModal } = store.getState()
  const { listLoading } = taskModal
  return dispatch => {
    if (listLoading) {
      return
    }
    dispatch({
      type: CHANGE_MODAL_TASK,
      value: {
        listLoading: true
      }
    })
    let resource = '/api/work/order/list'
    return AjaxHandler.fetch(resource, body).then(json => {
      let value = {
        listLoading: false
      }
      if (json && json.data) {
        const { total, workOrders } = json.data
        value = {
          ...value,
          ...{
            list: workOrders,
            total
          }
        }
      }
      dispatch({
        type: CHANGE_MODAL_TASK,
        value: value
      })
    })
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

export const CHANGE_TASK = 'CHANGE_TASK'
export const changeTask = (subModule, keyValuePair) => {
  return {
    type: CHANGE_TASK,
    subModule,
    keyValuePair
  }
}
