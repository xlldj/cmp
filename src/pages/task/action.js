import { stopBeat } from '../../tasks/heartBeat'
import AjaxHandler from '../../util/ajax'
// import AjaxHandler from '../../mock/ajax'
import { buildAuthenData } from '../../util/authenDataHandle'
import { getStore, setStore, removeStore } from '../../util/storage'
import { taskService } from '../service/index'
import store from '../../index.js'
import { deepCopy } from '../../util/copy'
import Noti from '../../util/noti'
import {} from './taskList/controller'
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
export const relateTask = (body, callback) => {
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
        if (callback) {
          callback()
        }
      }
    })
  }
}
/**
 * 取消关联
 * @param {*} body
 */
export const cancelRelate = (body, callback) => {
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
        if (callback) {
          callback()
        }
      }
    })
  }
}
/**
 * 催单
 * @param {} body
 */
export const csRemind = (body, callback) => {
  return dispatch => {
    taskService.csRemind(body).then(json => {
      if (json && json.data && json.data.result) {
        Noti.hintOk('操作成功', '催单成功')
        const { taskDetailModal } = store.getState()
        const detail = deepCopy(taskDetailModal.detail)
        const body = {
          id: detail.id
        }
        store.dispatch(fetchTaskDetail(body))
      } else if (json && json.data && json.data.failReason) {
        Noti.hintLock('操作失败', json.data.failReason)
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

//获取快捷消息列表
export const CHANGE_QUICK_LIST = 'CHANGE_QUICK_LIST'
export const fetchQuickList = body => {
  const { quickModal } = store.getState()
  const { listLoading } = quickModal
  return dispatch => {
    if (listLoading) {
      return
    }
    dispatch({
      type: CHANGE_QUICK_LIST,
      value: {
        listLoading: true
      }
    })
    let resource = '/work/order/quickMsg/list'
    return AjaxHandler.fetch(resource, body).then(json => {
      const value = { listLoading: false }
      if (json && json.data) {
        value.list = json.data.msgs
        value.total = json.data.total
      }
      dispatch({
        type: CHANGE_QUICK_LIST,
        value
      })
    })
  }
}
//获取快捷消息类型列表
export const CHANGE_QUICK_TYPE_LIST = 'CHANGE_QUICK_TYPE'
export const fetchQuickTypeList = body => {
  const { quickTypeModal } = store.getState()
  const { listLoading } = quickTypeModal
  return dispatch => {
    if (listLoading) {
      return
    }
    dispatch({
      type: CHANGE_QUICK_TYPE_LIST,
      value: {
        listLoading: true
      }
    })
    let resource = '/work/order/quickMsg/type/list'
    return AjaxHandler.fetch(resource, body).then(json => {
      const value = { listLoading: false }
      if (json && json.data) {
        value.list = json.data.msgTypes
        value.total = json.data.total
      }
      dispatch({
        type: CHANGE_QUICK_TYPE_LIST,
        value
      })
    })
  }
}
