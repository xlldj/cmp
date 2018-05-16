import AjaxHandler from '../../../util/ajax'
import {
  schoolIdController,
  methodController,
  typeController,
  statusController,
  pageController,
  combineControllers,
  closeDetailController
} from '../../../public/dispatcher'
import * as ActionTypes from '../../../actions'
import store from '../../../index.js'
import { fetchFundCheckInfo } from '../action'
import Noti from '../../../util/noti'
const subModule = 'fundCheck'

export const fundCheckDetailPropsController = (state, props, event) => {
  return combineControllers([closeDetailController])(state, props, event)
}

export const fundCheckListPropsController = (state, props, event) => {
  return combineControllers([
    schoolIdController,
    methodController,
    typeController,
    statusController,
    pageController
  ])(state, props, event)
}

/**
 * 处理异常账单
 * @param {*} body
 */
export const settleOrder = body => {
  const resource = '/api/fundsCheck/mistake/settle'
  AjaxHandler.fetch(resource, body).then(json => {
    // 关闭弹窗
    store.dispatch({
      type: ActionTypes.CHANGE_FUND,
      subModule,
      keyValuePair: {
        showHandleModal: false
      }
    })
    if (json && json.data) {
      const data = { id: body.id }
      Noti.hintOk('处理成功', '处理该账单成功')
      store.dispatch(fetchFundCheckInfo(data))
    }
  })
}
