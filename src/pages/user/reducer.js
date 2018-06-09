import getDefaultSchool from '../../util/defaultSchool'
import * as ActionTypes from '../../actions'

let selectedSchool = getDefaultSchool()

// 用户管理
const initialUserState = {
  userList: {
    tabIndex: 1,
    schoolId: selectedSchool,

    list_selectKey: '',
    list_userTransfer: 'all',
    list_page: 1,

    foxconn_auth: 'all',
    foxconn_selectKey: '',
    foxconn_page: 1,

    analyze_day: 1, // 默认为1， 今天
    analyze_startTime: '',
    analyze_endTime: '',
    analyze_deviceType: 1, // 默认为热水器，1
    analyze_selectKey: '',
    analyze_page: 1,
    buildingIds: 'all',
    areaIds: 'all',
    floorIds: 'all'
  }
}
const userModule = (state = initialUserState, action) => {
  const { type } = action

  if (type === ActionTypes.CHANGE_USER) {
    const { subModule, keyValuePair } = action
    const newSubState = {}
    newSubState[subModule] = { ...state[subModule], ...keyValuePair }
    return { ...state, ...newSubState }
  }
  return state
}

export default userModule
