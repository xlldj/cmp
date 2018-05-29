import AjaxHandler from '../../util/ajax'
const overviewListUrl = '/school/full/list'

const schoolService = {
  getOverviewList: body => {
    return AjaxHandler.fetch(overviewListUrl, body)
  }
}
export default schoolService
