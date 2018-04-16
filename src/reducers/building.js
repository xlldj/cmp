import * as ActionTypes from '../actions'

const initialBuildings = {
  // map schoolId to buildings
  buildingsOfSchoolId: {}
}
const buildingsSet = (state = initialBuildings, action) => {
  const { type } = action
  if (type === ActionTypes.SET_BUILDING_LIST) {
    const value = action.value
    const newBuildings = { ...state.buildingsOfSchoolId, ...value }
    return { ...state, ...{ buildingsOfSchoolId: newBuildings } }
  }
  return state
}

export default buildingsSet
