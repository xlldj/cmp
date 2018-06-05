// import { default as AjaxHandlerMock } from '../../mock/ajax'
import AjaxHandler from '../../util/ajax'

const relateTaskUrl = '/work/order/relate'
const cancelRelateUrl = '/work/order/deleteRelate'
const csRemindUrl = '/work/order/remind'
const getLocationUrl = '/residence/listBySchool'
const getLocationTreeUrl = '/residence/tree'

const taskService = {
  //关联
  relateTask: body => {
    return AjaxHandler.fetch(relateTaskUrl, body)
  },
  //取消关联
  cancelRelate: body => {
    return AjaxHandler.fetch(cancelRelateUrl, body)
  },
  //催单
  csRemind: body => {
    return AjaxHandler.fetch(csRemindUrl, body)
  },
  //获取楼栋列表
  getLocatonById: body => {
    return AjaxHandler.fetch(getLocationUrl, body)
  },
  //获取楼栋树
  getLocationTree: body => {
    return AjaxHandler.fetch(getLocationTreeUrl, body)
  }
}
export default taskService
