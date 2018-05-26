import store from '../../index.js'
import AjaxHandler from '../../util/ajax'
export const CHANGE_MODAL_FUNDLIST = 'CHANGE_MODAL_FUNDLIST'

export const CHANGE_FUND = 'CHANGE_FUND'
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
