import store from '../../index'
import AjaxHandler from '../../util/ajax'
// import AjaxHandler from '../../mock/ajax'
import { moduleActionFactory } from '../../actions/moduleActions.js'
import { deepCopy } from '../../util/copy'
import CONSTANTS from '../../constants'
import { nextTick } from '../../public/ayncs'
const { COMMENT_SIZE_THRESHOLD, LOST_FOUND_STATUS_SHADOWED } = CONSTANTS
export const CHANGE_LOST = 'CHANGE_LOST'
export const CHANGE_MODAL_LOST = 'CHANGE_MODAL_LOST'
export const CHANGE_MODAL_BLACK = 'CHANGE_MODAL_BLACK'
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
    let resource = '/api/lost/commentsList'
    return AjaxHandler.fetch(resource, body).then(json => {
      const value = { commentsLoading: false }
      if (json && json.data) {
        const { comments } = json.data
        comments.forEach(comment => {
          comment.loadingMore = false
          if (comment.repliesCount > COMMENT_SIZE_THRESHOLD) {
            comment.allRepliesLoaded = false
          } else {
            comment.allRepliesLoaded = true
          }
        })
        value.comments = comments
      }
      dispatch({
        type: CHANGE_MODAL_LOST,
        value
      })
    })
  }
}
export const fetchRepliesList = body => {
  const { lostModal } = store.getState()

  return dispatch => {
    // 将对应的comment中的loadingMore改为true
    const comments = deepCopy(lostModal.comments)
    const comment = comments.find(comment => comment.id === body.id)
    if (comment) {
      if (comment.loadingMore) {
        return
      }
      comment.loadingMore = true
    }
    dispatch({
      type: CHANGE_MODAL_LOST,
      value: {
        comments
      }
    })
    let resource = '/api/lost/repliesList'
    return AjaxHandler.fetch(resource, body).then(json => {
      // 将对应的comment中的loadingMore改为false
      const comments = deepCopy(lostModal.comments)
      const comment = comments.find(comment => comment.id === body.id)
      if (comment) {
        comment.loadingMore = false
      }
      const value = {
        comments
      }
      if (json && json.data) {
        if (comment) {
          comment.replies = comment.replies.concat(json.data.replies)
          comment.allRepliesLoaded = true
        }
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
        value.commentsSize = json.data.commentsCount
        const commentsBody = {
          id: json.data.id,
          from: 1,
          commentsSize: json.data.commentsCount,
          repliesSize: COMMENT_SIZE_THRESHOLD
        }
        store.dispatch(fetchCommentsList(commentsBody))
      }
      dispatch({
        type: CHANGE_MODAL_LOST,
        value
      })
    })
  }
}
export const fetchBlackPeopleList = body => {
  const { blackModal } = store.getState()
  const { listLoading } = blackModal
  return dispatch => {
    if (listLoading) {
      return
    }
    dispatch({
      type: CHANGE_MODAL_BLACK,
      value: {
        listLoading: true
      }
    })
    let resource = '/api/lost/blacklist'
    return AjaxHandler.fetch(resource, body).then(json => {
      let value = {
        listLoading: false
      }
      if (json && json.data) {
        const { total, blackListUsers } = json.data
        value = {
          ...value,
          ...{
            list: blackListUsers,
            total
          }
        }
      }
      dispatch({
        type: CHANGE_MODAL_BLACK,
        value: value
      })
    })
  }
}

export const deleteLostInfo = id => {
  const { lostModal, setUserInfo } = store.getState()
  const { detailLoading } = lostModal
  const detail = deepCopy(lostModal.detail)
  const list = deepCopy(lostModal.list)
  detail.status = LOST_FOUND_STATUS_SHADOWED
  if (detailLoading) {
    return
  }
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
    let value = {}
    value.detailLoading = false
    value.detail = detail
    const userName = setUserInfo.name
    list.forEach(lost => {
      if (lost.id === id) {
        lost.status = LOST_FOUND_STATUS_SHADOWED
        lost.hiddenByUserName = userName
        lost.hiddenTime = Date.now()
      }
    })
    value.list = list
    nextTick().then(() => {
      dispatch({
        type: CHANGE_MODAL_LOST,
        value
      })
    })
  }
}
export const deleteComments = id => {
  const { lostModal, setUserInfo } = store.getState()
  const { commentsLoading } = lostModal
  const { name, id: userId } = setUserInfo
  const comments = deepCopy(lostModal.comments)
  const replies = deepCopy(lostModal.replies)
  if (replies) {
    for (let replay in replies) {
      replies[replay].forEach((replayItem, index) => {
        if (replayItem.id === id) {
          replayItem.status = 2
          replayItem.delUserId = userId
          replayItem.delUserNickname = name
        }
      })
    }
  }
  comments.forEach((element, index) => {
    if (element.id === id) {
      element.status = 2
      element.delUserId = userId
      element.delUserNickname = name
      return true
    }
    element.replies.forEach((replay, index) => {
      if (replay.id === id) {
        replay.status = 2
        replay.delUserId = userId
        replay.delUserNickname = name
        return true
      }
    })
  })
  return dispatch => {
    if (commentsLoading) {
      return
    }
    dispatch({
      type: CHANGE_MODAL_LOST,
      value: {
        commentsLoading: true,
        allRepliesLoading: true
      }
    })
    let value = { allRepliesLoading: false }
    value.commentsLoading = false
    value.comments = comments
    value.replies = replies
    dispatch({
      type: CHANGE_MODAL_LOST,
      value
    })
  }
}
export const blackPerson = userId => {
  const { lostModal } = store.getState()
  const { detail, detailLoading } = lostModal
  const comments = deepCopy(lostModal.comments)
  if (detail.userId === userId) {
    detail.userInBlackList = true
  }
  // const { replies } = deepCopy(lostModal.replies)
  comments.forEach((element, index) => {
    if (element.userId === userId) {
      element.userInBlackList = true
    }
    element.replies.forEach((replay, index) => {
      if (replay.userId === userId) {
        replay.userInBlackList = true
      }
    })
  })
  return dispatch => {
    if (detailLoading) {
      return
    }
    dispatch({
      type: CHANGE_MODAL_LOST,
      value: {
        detailLoading: true,
        allRepliesLoading: true
      }
    })
    let value = { allRepliesLoading: false }
    value.detailLoading = false
    value.comments = comments
    value.detail = detail
    dispatch({
      type: CHANGE_MODAL_LOST,
      value
    })
  }
}
