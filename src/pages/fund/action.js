import store from '../../index'
// import AjaxHandler from '../../util/ajax'
import AjaxHandler from '../../mock/ajax'
import { moduleActionFactory } from '../../actions/moduleActions.js'

export const CHANGE_FUND = 'CHANGE_FUND'
export const CHANGE_MODAL_FUNDCHECK = 'CHANGE_MODAL_FUNDCHECK'
const modalName = 'fundCheckModal'

/**
 * 更改reducer@fundModule 的通用action
 * @param {*} subModule
 * @param {*} keyValuePair
 */
export const changeFund = (subModule, keyValuePair) => {
  return dispatch =>
    moduleActionFactory(dispatch, 'FUND', subModule, keyValuePair)
}

/**
 * 获取资金对账列表
 * @param {*} body : 请求体
 */
export const fetchFundCheckList = body => {
  const { listLoading } = store.getState()[modalName]

  return dispatch => {
    if (listLoading) {
      return
    }
    dispatch({
      type: CHANGE_MODAL_FUNDCHECK,
      value: {
        listLoading: true
      }
    })
    let resource = '/api/fundsCheck/mistake/list'
    return AjaxHandler.fetch(resource, body).then(json => {
      let value = {
        listLoading: false
      }
      if (json && json.data) {
        const { total, fundsCheckMistakeRespDTOS } = json.data
        value = {
          ...value,
          ...{
            list: fundsCheckMistakeRespDTOS,
            total
          }
        }
      }
      dispatch({
        type: CHANGE_MODAL_FUNDCHECK,
        value: value
      })
    })
  }
}

/**
 * 请求对账详情
 * @param {*} body
 */
export const fetchFundCheckInfo = body => {
  const { detailLoading } = store.getState()[modalName]

  return dispatch => {
    if (detailLoading) {
      return
    }
    dispatch({
      type: CHANGE_MODAL_FUNDCHECK,
      value: {
        detailLoading: true
      }
    })
    let resource = '/api/fundsCheck/mistake/detail'
    return AjaxHandler.fetch(resource, body).then(json => {
      const value = {
        detailLoading: false
      }
      if (json && json.data) {
        value.detail = json.data
      }
      dispatch({
        type: CHANGE_MODAL_FUNDCHECK,
        value
      })
    })
  }
}
