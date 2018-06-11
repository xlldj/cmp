import getDefaultSchool from '../../util/defaultSchool'
import * as ActionTypes from '../../actions'
const selectedSchool = getDefaultSchool()
const initialDeviceState = {
  deviceList: {
    page: 1,
    schoolId: selectedSchool,
    deviceType: 'all',
    selectKey: '',
    loading: true,
    dataSource: [],
    total: ''
  },
  components: {
    page: 1,
    dataSource: [],
    total: 0,
    loading: false
  },
  prepay: {
    page: 1,
    schoolId: selectedSchool
  },
  timeset: {
    schoolId: selectedSchool,
    page: 1
  },
  suppliers: {
    page: 1
  },
  rateSet: {
    schoolId: selectedSchool,
    page: 1
  },
  repair: {
    page: 1,
    deviceType: 'all',
    schoolId: selectedSchool,
    status: 'all'
  },
  rateLimit: {
    schoolId: selectedSchool,
    page: 1
  }
}
export const deviceModule = (state = initialDeviceState, action) => {
  const { type } = action

  if (type === ActionTypes.CHANGE_DEVICE) {
    const { subModule, keyValuePair } = action
    const newSubState = {}
    newSubState[subModule] = { ...state[subModule], ...keyValuePair }
    return { ...state, ...newSubState }
    // return merge({}, state, { [subModule]: keyValuePair })
  }
  return state
}

const initialRepairListModal = {
  loading: false,
  list: []
}
export const repairListModal = (state = initialRepairListModal, action) => {
  const { type } = action
  if (type === ActionTypes.CHANGE_MODAL_REPAIRLIST) {
    const { value } = action
    return { ...state, ...value }
  }
  return state
}

const initialDeviceInfo = {
  loading: false,
  detail: {}
}
export const deviceInfoModal = (state = initialDeviceInfo, action) => {
  const { type } = action
  if (type === ActionTypes.CHANGE_MODAL_DEVICEINFO) {
    const { value } = action
    return { ...state, ...value }
  }
  return state
}
