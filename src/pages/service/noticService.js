// import AjaxHandler from '../../util/ajax'
import AjaxHandler from '../../mock/ajax'
const addPushUrl = '/push/create'
const updatePushUrl = '/push/update'
const cancelPushUrl = '/push/cancel'
const delPushUrl = '/push/delete'
const rePushUrl = '/push/repush'
const noticService = {
  /**
   * 添加消息推送
   */
  addPush: body => {
    return AjaxHandler.fetch(addPushUrl, body)
  },
  /**
   * 更新推送
   */
  upDatePush: body => {
    return AjaxHandler.fetch(updatePushUrl, body)
  },
  /**
   * 取消推送
   */
  cancelPush: body => {
    return AjaxHandler.fetch(cancelPushUrl, body)
  },
  /**
   * 删除推送
   */
  delPush: body => {
    return AjaxHandler.fetch(delPushUrl, body)
  },
  /**
   * 重新推送
   */
  rePush: body => {
    return AjaxHandler.fetch(rePushUrl, body)
  }
}
export default noticService
