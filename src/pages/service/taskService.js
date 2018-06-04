// import { default as AjaxHandlerMock } from '../../mock/ajax'
import AjaxHandler from '../../util/ajax'

const relateTaskUrl = '/work/order/relate'
const cancelRelateUrl = '/work/order/deleteRelate'
const csRemindUrl = '/work/order/remind'
const getLocationUrl = '/residence/listBySchool'
const getLocationTreeUrl = '/residence/tree'

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
    return AjaxHandler.fetch(getLocationUrl, body)
  },
  getLocationTree: body => {
    return AjaxHandler.fetch(getLocationTreeUrl, body)
  }
}
export default taskService
