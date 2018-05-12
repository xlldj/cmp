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
import store from '../../../index.js'
import { fetchLostInfo } from '../action'

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
export const defriend = userId => {
  // store.dispatch(fetchLostInfo) // 更新detail的语句
}

/**
 * 删除制定的评论，并更新显示的comments列表
 * @param {*} commentId
 */
export const deleteComment = commentId => {}
