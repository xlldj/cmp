import {
  schoolIdController,
  tabIndexController,
  syncTimeController,
  dayController,
  typeController,
  selectKeyController,
  statusController,
  pageController,
  combineControllers,
  orderController,
  closeDetailController
} from '../../../public/dispatcher'
import AjaxHandler from '../../../util/ajax'
import Noti from '../../../util/noti'
import CONSTANTS from '../../../constants'
import store from '../../../index'
import { deleteLostInfo, deleteComments, blackPerson } from '../action'
const { LOST_REPLY, LOST_COMMENT } = CONSTANTS
export const stateController = (prevState, value) => {
  return { ...prevState, ...value }
}

export const lostFoundDetailPropsController = (state, props, event) => {
  return combineControllers([closeDetailController])(state, props, event)
}

export const lostFoundListPropsController = (state, props, event) => {
  return combineControllers([
    syncTimeController,
    typeController,
    dayController,
    statusController,
    pageController,
    orderController,
    selectKeyController
  ])(state, props, event)
}

export const lostFoundContainerPropsController = (state, props, event) => {
  return combineControllers([schoolIdController, tabIndexController])(
    state,
    props,
    event
  )
}

/**
 * 将该用户拉黑，并更新显示的detail和comment。
 * @param {*} userId
 */
export const defriend = (userId, id, level, commentParentId) => {
  const body = {
    userId: userId,
    id: id,
    level: level
  }
  let resource = '/api/lost/defriend'
  AjaxHandler.fetch(resource, body).then(json => {
    if (json && json.data) {
      Noti.hintOk('拉黑成功')
      const { lostModal } = store.getState()
      const { comments } = lostModal
      if (comments && comments.length > 0) {
        store.dispatch(blackPerson(userId))
      }
    }
  })
}

/**
 * 删除评论或者失物招领信息，并在本地更新显示的comments列表
 * @param {*} commentId
 */
export const deleteCommentOrLostinfo = (id, type) => {
  const body = {
    id,
    type: type ? type : 1
  }
  let resource = '/api/lost/delete'

  AjaxHandler.fetch(resource, body).then(json => {
    if (json && json.data) {
      if (type === LOST_REPLY || type === LOST_COMMENT) {
        Noti.hintOk('操作成功', '删除成功')
        store.dispatch(deleteComments(id))
      } else {
        Noti.hintOk('操作成功', '屏蔽成功')
        store.dispatch(deleteLostInfo(id))
      }
    }
  })
}
