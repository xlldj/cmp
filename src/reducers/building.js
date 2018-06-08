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
                id: 333,
                name: '楼层31',
                type: 3
              }
            ],
            id: 31,
            name: '楼栋31',
            type: 2
          }
        ],
        id: 3,
        name: '区域31',
        type: 1
      },
      {
        children: [
          {
            children: [
              {
                id: 111,
                name: '楼层111',
                type: 3
              }
            ],
            id: 11,
            name: '楼栋11',
            type: 2
          }
        ],
        id: 1,
        name: '区域1',
        type: 1
      },
      {
        children: [
          {
            children: [
              {
                id: 211,
                name: '楼层211',
                type: 3
              }
            ],
            id: 21,
            name: '楼栋21',
            type: 2
          },
          {
            children: [
              {
                id: 221,
                name: '楼层221',
                type: 3
              },
              {
                id: 222,
                name: '楼层222',
                type: 3
              }
            ],
            id: 22,
            name: '楼栋22',
            type: 2
          }
        ],
        id: 2,
        name: '区域2',
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
