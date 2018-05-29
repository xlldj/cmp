import { default as AjaxHandlerMock } from '../../mock/ajax'
import AjaxHandler from '../../util/ajax'

const relateTaskUrl = '/work/order/relate'
const cancelRelateUrl = '/work/order/deleteRelate'
const csRemindUrl = '/work/order/remind'
const getLocationUrl = '/device/location'

const taskService = {
  relateTask: body => {
    return AjaxHandler.fetch(relateTaskUrl, body)
  },
  cancelRelate: body => {
    return AjaxHandler.fetch(cancelRelateUrl, body)
  },
  csRemind: body => {
    return AjaxHandler.fetch(csRemindUrl, body)
  },
  getLocatonById: body => {
    return AjaxHandlerMock.fetch(getLocationUrl, body)
  }
}
export default taskService
