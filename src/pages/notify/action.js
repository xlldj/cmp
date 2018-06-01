import { moduleActionFactory } from '../../actions/moduleActions.js'
import store from '../../index'
// import AjaxHandler from '../../mock/ajax'
import AjaxHandler from '../../util/ajax'
const modalName = 'beingsModal'
export const CHANGE_NOTIFY = 'CHANGE_NOTIFY'

export const changeNotify = (subModule, keyValuePair) => {
  return dispatch =>
    moduleActionFactory(dispatch, 'NOTIFY', subModule, keyValuePair)
}
export const changeBeings = value => {
  const { detail } = store.getState()[modalName]
  if (value) {
    let newDetail = { ...detail, ...value }
    return dispatch => {
      dispatch({
        type: CHANGE_MODAL_BEING,
        value: {
          detail: newDetail
        }
      })
    }
  }
}
export const CHANGE_MODAL_BEING = 'CHANGE_BEING'

/**
 * 获取消息推送列表
 * @param {*} body : 请求体
 */
export const fetchBeingPushList = body => {
  const { listLoading } = store.getState()[modalName]

  return dispatch => {
    if (listLoading) {
      return
    }
    dispatch({
      type: CHANGE_MODAL_BEING,
      value: {
        listLoading: true
      }
    })
    let resource = '/api/push/list'
    return AjaxHandler.fetch(resource, body).then(json => {
      let value = {
        listLoading: false
      }
      if (json && json.data) {
        const { total, pushList } = json.data
        value = {
          ...value,
          ...{
            list: pushList,
            total
          }
        }
      }
      dispatch({
        type: CHANGE_MODAL_BEING,
        value: value
      })
    })
  }
}
/**
 * 获取消息推送详情 （已经废弃）
 */
export const fetchBeingInfo = body => {
  const { detailLoading } = store.getState()[modalName]
  return dispatch => {
    if (detailLoading) {
      return
    }
    dispatch({
      type: CHANGE_MODAL_BEING,
      value: {
        detailLoading: true
      }
    })
    let resource = 'beings/info'
    return AjaxHandler.fetch(resource, body).then(json => {
      let value = {
        detailLoading: false
      }
      if (json && json.data) {
        const { detail } = json.data
        value = {
          ...value,
          ...{
            detail: detail
          }
        }
      }
      dispatch({
        type: CHANGE_MODAL_BEING,
        value: value
      })
    })
  }
}
