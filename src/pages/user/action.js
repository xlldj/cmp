import store from '../../index.js'
import AjaxHandler from '../../util/ajax'
export const CHANGE_USER = 'CHANGE_USER'
export const CHANGE_MODAL_USERINFO = 'CHANGE_MODAL_USERINFO'

export const changeUser = (subModule, keyValuePair) => {
  return {
    type: CHANGE_USER,
    subModule,
    keyValuePair
  }
}

export const fetchUserInfo = body => {
  const { userInfoModal } = store.getState()
  const { detailLoading } = userInfoModal
  if (detailLoading) {
    return
  }
  const resource = '/api/user/one'
  AjaxHandler.fetch(resource, body).then(json => {
    const value = {
      detailLoading: false
    }
    if (json && json.data) {
      value.detail = json.data
    }
    store.dispatch({
      type: CHANGE_MODAL_USERINFO,
      value
    })
  })
}
