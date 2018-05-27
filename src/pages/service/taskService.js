import AjaxHandler from '../../mock/ajax'
const relateTaskUrl = '/work/order/relate'

const taskService = {
  relateTask: body => {
    return AjaxHandler.fetch(relateTaskUrl, body)
  }
}
export default taskService
