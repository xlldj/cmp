import AjaxHandler from '../../mock/ajax'

const ubindBuildingsUrl = '/area/unbind/building/list'
const getAreaDataUrl = '/area/list'
const areaService = {
  getUnbindBuildings: body => {
    return AjaxHandler.fetch(ubindBuildingsUrl, body)
  },
  getAreaData: body => {
    return AjaxHandler.fetch(getAreaDataUrl, body)
  }
}
export default areaService
