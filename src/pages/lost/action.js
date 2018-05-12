import store from '../../index'
// import AjaxHandler from '../../util/ajax'
import AjaxHandler from '../../mock/ajax'
import { moduleActionFactory } from '../../actions/moduleActions.js'
export const CHANGE_LOST = 'CHANGE_LOST'
export const CHANGE_MODAL_LOST = 'CHANGE_MODAL_LOST'

/**
 * 更改reducer@lostModule 的通用action
 * @param {string} subModule      :reducer@lostModule中对应的根状态名
 * @param {Object} keyValuePair   :传入待更改的键值对
 */
export const changeLost = (subModule, keyValuePair) => {
  return dispatch =>
    moduleActionFactory(dispatch, 'LOST', subModule, keyValuePair)
}

export const fetchLostFoundList = body => {
  const { lostModal } = store.getState()
  const { listLoading } = lostModal

  return dispatch => {
    if (listLoading) {
      return
    }
    dispatch({
      type: CHANGE_MODAL_LOST,
      value: {
        listLoading: true
      }
    })
    let resource = '/api/lost/list'
    return AjaxHandler.fetch(resource, body).then(json => {
      let value = {
        listLoading: false
      }
      if (json && json.data) {
        const { total, lostAndFounds, totalNormal, totalHidden } = json.data
        value = {
          ...value,
          ...{
            list: lostAndFounds,
            total,
            totalNormal,
            totalHidden
          }
        }
      }
      dispatch({
        type: CHANGE_MODAL_LOST,
        value: value
      })
    })
  }
}

export const fetchCommentsList = body => {
  const { lostModal } = store.getState()
  const { commentsLoading } = lostModal

  return dispatch => {
    if (commentsLoading) {
      return
    }
    dispatch({
      type: CHANGE_MODAL_LOST,
      value: {
        commentsLoading: true
      }
    })
    let resource = '/api/lost/comments/list'
    return AjaxHandler.fetch(resource, body).then(json => {
      const value = { commentsLoading: false }
      if (json && json.data) {
        const { commentsSize, comments } = json.data
        value.comments = comments
        value.commentsSize = commentsSize
      }
      dispatch({
        type: CHANGE_MODAL_LOST,
        value
      })
    })
  }
}

export const fetchLostInfo = body => {
  const { lostModal } = store.getState()
  const { detailLoading } = lostModal

  return dispatch => {
    if (detailLoading) {
      return
    }
    dispatch({
      type: CHANGE_MODAL_LOST,
      value: {
        detailLoading: true
      }
    })
    let resource = '/api/lost/details'
    return AjaxHandler.fetch(resource, body).then(json => {
      const value = {
        detailLoading: false
      }
      if (json && json.data) {
        value.detail = json.data
      }
      dispatch({
        type: CHANGE_MODAL_LOST,
        value
      })
    })
  }
}
