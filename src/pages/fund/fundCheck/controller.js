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
import store from '../../../index.js'
import { fetchFundCheckInfo } from '../action'

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
  AjaxHandler.ajax(resource, body).then(json => {
    if (json && json.data) {
      const data = { id: body.id }
      store.dispatch(() => fetchFundCheckInfo(data))
    }
  })
}
