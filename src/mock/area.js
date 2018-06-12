import { delete_error, delete_ok } from './generalResponse'
const areaList = {
  data: {
    areas: [
      {
        buildings: [
          {
            name: '楼栋一',
            id: 1
          }
        ],
        fullName: '富士康-区域一',
        id: 1,
        name: '区域一',
        parentId: 0,
        schoolId: 0,
        status: 0,
        type: 0
      },
      {
        buildings: [
          {
            name: '楼栋二',
            id: 2
          }
        ],
        fullName: '富士康-区域二',
        id: 2,
        name: '区域二',
        parentId: 0,
        schoolId: 0,
        status: 0,
        type: 0
      }
    ],
    total: 0
  }
}
const unbindBuildings = {
  data: {
    buildings: [
      {
        name: '楼栋三',
        id: 3
      },
      {
        name: '楼栋四',
        id: 4
      }
    ]
  }
}
const areaHandler = (resource, body) => {
  if (resource === '/area/list') {
    let json = areaList
    return Promise.resolve(json)
  }
  if (resource === '/area/unbind/building/list') {
    let json = unbindBuildings
    return Promise.resolve(json)
  }
  if (resource === '/area/check') {
    if (body.id) {
      if (body.name.indexOf('一') !== -1) {
        return Promise.resolve(delete_error)
      }
    }
    return Promise.resolve(delete_ok)
  }
}

export default areaHandler
