import store from '../../index.js'
import AjaxHandler from '../../util/ajax'
export const CHANGE_ORDER = 'CHANGE_ORDER'
export const CHANGE_MODAL_ORDERLIST = 'CHANGE_MODAL_ORDERLIST'
export const changeOrder = (subModule, keyValuePair) => {
  return {
    type: CHANGE_ORDER,
    subModule,
    keyValuePair
  }
}

export const fetchOrderList = body => {
  const { orderListModal } = store.getState()
  const { loading } = orderListModal
  if (loading) {
    return
  }
  store.dispatch({
    type: CHANGE_MODAL_ORDERLIST,
    value: {
      loading: true
    }
  })
  const resource = '/api/order/list'
  AjaxHandler.fetch(resource, body).then(json => {
    const value = {
      loading: false
    }
    if (json && json.data) {
      value.list = json.data.orders
    }
    store.dispatch({
      type: CHANGE_MODAL_ORDERLIST,
      value
    })
  })
}
