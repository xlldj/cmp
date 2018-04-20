import buildingsSet from './building'
import * as ActionTypes from '../actions'
const initialBuildings = {
  // map schoolId to buildings
  buildingsOfSchoolId: {}
}
test('', () => {
  expect(
    buildingsSet(initialBuildings, {
      type: ActionTypes.SET_BUILDING_LIST,
      value: {
        1: ['buildingname']
      }
    })
  ).toEqual({
    buildingsOfSchoolId: {
      1: ['buildingname']
    }
  })
})
