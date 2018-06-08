import * as ActionTypes from '../actions'

const initialBuildings = {
  // map schoolId to buildings
  buildingsOfSchoolId: {},
  // 从区域开始的学校公寓信息, 键为学校的id, 值为数组，第一层为区域，依次嵌套楼栋/楼层
  residenceOfSchoolId: {
    2: [
      {
        children: [
          {
            children: [
              {
                id: 1,
                name: '楼层1',
                type: 3
              }
            ],
            id: 1,
            name: '楼栋1',
            type: 2
          }
        ],
        id: 1,
        name: '区域1',
        type: 1
      }
    ]
  }
}
const buildingsSet = (state = initialBuildings, action) => {
  const { type, subModule, value } = action
  if (type === ActionTypes.SET_BUILDING_LIST) {
    const newState = {}
    newState[subModule] = value
    return { ...state, ...newState }
  }
  return state
}

export default buildingsSet
