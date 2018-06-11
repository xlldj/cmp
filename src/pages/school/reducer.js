import * as ActionTypes from '../../actions'
import getDefaultSchool from '../../util/defaultSchool'
let selectedSchool = getDefaultSchool()

// state of 'school' Module
const initialSchoolState = {
  schoolList: {
    page: 1,
    schoolId: selectedSchool
  },
  overview: {
    page: 1,
    schoolId: selectedSchool
  }
}
export const schoolModule = (state = initialSchoolState, action) => {
  const { type } = action

  if (type === ActionTypes.CHANGE_SCHOOL) {
    const { subModule, keyValuePair } = action
    let newState = {}
    newState = Object.assign({}, state[subModule], keyValuePair)
    // console.log(keyValuePair);
    return Object.assign({}, state, { [subModule]: newState })
  }
  return state
}

const initialOverviewModal = {
  list: [],
  total: 0,
  listLoading: false
}

export const overviewModal = (state = initialOverviewModal, action) => {
  const { type } = action
  if (type === ActionTypes.CHANGE_OVERVIEW) {
    const { value } = action
    return { ...state, ...value }
  }
  return state
}
