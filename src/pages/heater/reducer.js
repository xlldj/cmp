import getDefaultSchool from '../../util/defaultSchool'
import * as ActionTypes from './action'
import { merge } from 'lodash'
let selectedSchool = getDefaultSchool()

const initialHeaterState = {
  heaterList: {
    page: 1,
    schoolId: selectedSchool,
    tabIndex: 1, // 1 for unregisterd, 2 for registerd.
    loading: true,
    dataSource: [],
    total: ''
  },
  heaterStatus: {
    tabIndex: 1, // 1 for '实时', 2 for  '设置',
    schoolId: selectedSchool
  },
  liveStatus: {
    heaterTabIndex: 1,
    heaterUnits: [],
    unitData: {
      pipeRuning: true
    }
  }
}
const changeHeater = (state = initialHeaterState, action) => {
  const { type } = action

  if (type === ActionTypes.CHANGE_HEATER) {
    const { subModule, keyValuePair } = action
    return merge({}, state, { [subModule]: keyValuePair })
  }
  return state
}

export default changeHeater
