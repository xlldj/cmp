import { delete_error, delete_ok } from './generalResponse'
const beings_list = {
  data: {
    list: [
      {
        id: 1,
        content: '内容',
        creatorName: '操作人1',
        env: 1,
        planPushTime: 1526227200000,
        schoolName: '富士康',
        target: 2,
        type: 2,
        status: 3,
        mobile: [],
        methon: 1,
        schoolId: 1,
        updateTime: 1526227200000
      },
      {
        id: 2,
        content: '内容3',
        creatorName: '操作人2',
        env: 2,
        mobile: [],
        methon: 1,
        schoolId: 1,
        planPushTime: 1526227200000,
        schoolName: '富士康',
        target: 1,
        type: 2,
        status: 2,
        updateTime: 1526227200000
      },
      {
        id: 3,
        content: '内容',
        creatorName: '操作人',
        env: 1,
        mobile: [],
        methon: 2,
        schoolId: 2,
        planPushTime: 1526227200000,
        schoolName: '富士康',
        target: 2,
        type: 1,
        status: 4,
        updateTime: 1526227200000
      }
    ],
    total: 3
  }
}
const beingPushHandler = (resource, body) => {
  if (resource === '/push/list') {
    let json = beings_list
    return Promise.resolve(json)
  } else if (resource === '/push/one') {
    const index = beings_list.data.list.findIndex(a => a.id === body.id)
    if (index !== -1) {
      let result = {
        data: {
          detail: beings_list.data.list[index]
        }
      }
      return Promise.resolve(result)
    }
    return Promise.resolve(delete_error)
  }
  if (resource === '/push/delete') {
    return Promise.resolve(delete_ok)
  }
}

export default beingPushHandler
