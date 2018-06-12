import {
  combineControllers,
  tabIndexController,
  typeController,
  pageController
} from '../../../public/dispatcher'
import store from '../../../index'
import CONSTANTS from '../../../constants'
import { fetchQuickTypeList, fetchQuickList } from '../action'
import AjaxHandler from '../../../util/ajax'
// import AjaxHandler from '../../../mock/ajax'
import Noti from '../../../util/noti'
const { PAGINATION: SIZE } = CONSTANTS
export const quickMsgPropsController = (state, props, event) => {
  return combineControllers([
    tabIndexController,
    pageController,
    typeController
  ])(state, props, event)
}
/**
 * 删除消息类型
 * @param {id:quickTypeId} body
 */
export const deleteQuickType = body => {
  const resource = '/work/order/quickMsg/type/delete'
  const { taskModule } = store.getState()
  const { quickType } = taskModule
  const { page } = { quickType }
  AjaxHandler.fetch(resource, body).then(json => {
    if (json.data) {
      if (!json.data.failReason) {
        Noti.hintOk('操作成功', '删除成功')
        const body = {
          page: page,
          size: SIZE
        }
        store.dispatch(fetchQuickTypeList(body))
      } else {
        Noti.hintLock('操作失败', json.data.failReason)
      }
    }
  })
}
//添加编辑消息类型
export const saveQuickType = (body, callback) => {
  const resource = '/work/order/quickMsg/type/save'
  const { taskModule } = store.getState()
  const { quickType } = taskModule
  const { page } = { quickType }
  AjaxHandler.fetch(resource, body).then(json => {
    if (json.data) {
      if (!json.data.failReason) {
        Noti.hintOk('操作成功', '编辑成功')
        if (callback) {
          callback()
        }
        const body = {
          page: page,
          size: SIZE
        }
        store.dispatch(fetchQuickTypeList(body))
      } else {
        Noti.hintLock('操作失败', json.data.failReason)
      }
    }
  })
}
/**
 * 删除快捷消息
 * @param {id:id} body
 */
export const deleteQuickMsg = body => {
  const resource = '/work/order/quickMsg/delete'
  const { taskModule } = store.getState()
  const { quickMsgList } = taskModule
  const { page, type } = { quickMsgList }
  AjaxHandler.fetch(resource, body).then(json => {
    if (json.data) {
      if (!json.data.failReason) {
        Noti.hintOk('操作成功', '删除成功')
        const body = {
          page: page,
          msgType: type,
          size: SIZE
        }
        store.dispatch(fetchQuickList(body))
      } else {
        Noti.hintLock('操作失败', json.data.failReason)
      }
    }
  })
}
/**
 *添加编辑消息
 * @param {id} body
 * @param {关闭弹出框} callback
 */
export const saveQuickMsg = (body, callback) => {
  const resource = '/work/order/quickMsg/save'
  const { taskModule } = store.getState()
  const { quickMsgList } = taskModule
  const { page, type } = { quickMsgList }
  AjaxHandler.fetch(resource, body).then(json => {
    if (json.data) {
      if (!json.data.failReason) {
        Noti.hintOk('操作成功', '编辑成功')
        if (callback) {
          callback()
        }
        const body = {
          page: page,
          msgType: type,
          size: SIZE
        }
        store.dispatch(fetchQuickList(body))
      } else {
        Noti.hintLock('操作失败', json.data.failReason)
      }
    }
  })
}
