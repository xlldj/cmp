import store from '../../index.js'
import AjaxHandler from '../../util/ajax'

export const CHANGE_FUND = 'CHANGE_FUND'
export const CHANGE_MODAL_FUNDCHECK = 'CHANGE_MODAL_FUNDCHECK'
const modalName = 'fundCheckModal'

export const CHANGE_MODAL_FUNDLIST = 'CHANGE_MODAL_FUNDLIST'
export const changeFund = (subModule, keyValuePair) => {
  return {
    type: CHANGE_FUND,
    subModule,
    keyValuePair
  }
}

export const fetchFundList = body => {
  const { fundListModal } = store.getState()
  const { loading } = fundListModal
  if (loading) {
    return
  }
  store.dispatch({
    type: CHANGE_MODAL_FUNDLIST,
    value: {
      loading: true
    }
  })
  const resource = '/api/funds/list'
  AjaxHandler.fetch(resource, body).then(json => {
    const value = {
      loading: false
    }
    if (json && json.data) {
      value.list = json.data.funds
    }
    store.dispatch({
      type: CHANGE_MODAL_FUNDLIST,
      value
    })
  })
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
