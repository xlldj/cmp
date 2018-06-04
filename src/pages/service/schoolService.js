import AjaxHandler from '../../util/ajax'
const overviewListUrl = '/school/full/list'

const schoolService = {
  //获取学校信息总览
  getOverviewList: body => {
    return AjaxHandler.fetch(overviewListUrl, body)
  }
}
export default schoolService
