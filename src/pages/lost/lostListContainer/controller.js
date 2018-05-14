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
import Noti from '../../../util/noti'
import store from '../../../index'
import {
  fetchLostInfo,
  fetchCommentsList,
  deleteLostInfo,
  deleteComments,
  blackPerson
} from '../action'
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
export const defriend = (userId, id, level, commentParentId) => {
  const body = {
    userId: userId,
    id: id,
    level: level
  }
  store.dispatch(blackPerson(id, commentParentId))
  // let resource = '/api/lost/defriend'
  // AjaxHandler.fetch(resource, body).then(json => {
  //   if (json && json.data) {
  //     Noti.hintOk('拉黑成功')
  //     const lostInfoBody = {
  //       id: commentParentId
  //     }
  //     const lostComments = {
  //       id: commentParentId,
  //       from: 1,
  //       repliesSize: 2,
  //       commentsSize: 10
  //     }
  //     fetchLostInfo(lostInfoBody)
  //     store.dispatch(fetchLostInfo(lostInfoBody)) // 更新detail的语句
  //     store.dispatch(fetchCommentsList(lostComments))
  //   }
  // })
}

/**
 * 删除制定的评论，并更新显示的comments列表
 * @param {*} commentId
 */
export const deleteComment = (commentId, type, commentParentId) => {
  const body = {
    id: commentId,
    type: type ? type : 1
  }
  let resource = '/api/lost/delete'
  if (commentId === commentParentId) {
    store.dispatch(deleteLostInfo())
  } else {
    store.dispatch(deleteComments(commentId))
  }
  // AjaxHandler.fetch(resource, body).then(json => {
  //   if (json && json.data) {
  //     Noti.hintOk('删除成功')
  //     if (commentId === commentParentId) {
  //       store.dispatch(deleteLostInfo())
  //     }
  //     // const lostInfoBody = {
  //     //   id: commentParentId
  //     // }
  //     // const lostComments = {
  //     //   id: commentParentId,
  //     //   from: 1,
  //     //   repliesSize: 2,
  //     //   commentsSize: 10
  //     // }
  //     // store.dispatch(fetchLostInfo(lostInfoBody)) // 更新detail的语句
  //     // store.dispatch(fetchCommentsList(lostComments))
  //   }
  // })
}
