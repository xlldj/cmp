import getDefaultSchool from '../../util/defaultSchool'
import * as ActionTypes from './action'
import { merge, isArray } from 'lodash'
let selectedSchool = getDefaultSchool()

const initialHeaterState = {
  heaterList: {
    page: 1,
    schoolId: selectedSchool,
    tabIndex: 1, // 1 for unregisterd, 2 for registerd.
    loading: false,
    dataSource: [],
    total: ''
  },
  heaterUnits: {
    page: 1,
    schoolId: selectedSchool,
    machineUnitId: 0
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
const heaterModule = (state = initialHeaterState, action) => {
  const { type } = action

  if (type === ActionTypes.CHANGE_HEATER) {
    console.log(
      'heaterModule changed, and loading is: ',
      action.keyValuePair.loading
    )
    const { subModule, keyValuePair } = action
    console.log(state.heaterList, keyValuePair)
    return merge({}, state, { [subModule]: keyValuePair })
  }
  return state
}

export default heaterModule
