import {
  schoolIdController,
  tabIndexController,
  syncTimeController,
  dayController,
  typeController,
  statusController,
  pageController,
  combineControllers,
  closeDetailController
} from '../../../public/dispatcher'
import AjaxHandler from '../../../util/ajax'

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
    pageController
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
export const defriend = (userId, id, level, callback) => {
  // store.dispatch(fetchLostInfo) // 更新detail的语句
  const body = {
    userId: userId,
    id: id,
    level: level
  }
  let resource = '/api/lost/defriend'
  AjaxHandler.fetch(resource, body).then(json => {
    if (json && json.data) {
      if (callback) {
        callback()
      }
    }
  })
}

/**
 * 删除制定的评论，并更新显示的comments列表
 * @param {*} commentId
 */
export const deleteComment = (commentId, type, callback) => {
  const body = {
    id: commentId,
    type: type ? type : 1
  }
  let resource = '/api/lost/delete'
  AjaxHandler.fetch(resource, body).then(json => {
    if (json && json.data) {
      if (callback) {
        callback()
      }
    }
  })
}
