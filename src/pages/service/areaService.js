// import AjaxHandler from '../../mock/ajax'
import AjaxHandler from '../../util/ajax'
const ubindBuildingsUrl = '/area/unbind/building/list'
const getAreaDataUrl = '/area/list'
const checkAreaUrl = '/area/check'
const submitAreaUrl = '/area/save'
const areaService = {
  getUnbindBuildings: body => {
    return AjaxHandler.fetch(ubindBuildingsUrl, body)
  },
  getAreaData: body => {
    return AjaxHandler.fetch(getAreaDataUrl, body)
  },
  checkArea: body => {
    return AjaxHandler.fetch(checkAreaUrl, body)
  },
  submitArea: body => {
    return AjaxHandler.fetch(submitAreaUrl, body)
  }
}
export default areaService
