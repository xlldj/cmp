import { delete_error, delete_ok } from './generalResponse'
const beings_list = {
  data: {
    list: [
      {
        id: 1,
        content: '内容',
        creatorName: '操作人',
        env: 1,
        planPushTime: '2018-05-25T06:11:38.357Z',
        schoolName: '富士康',
        target: 2,
        type: 2,
        status: 3,
        mobile: [],
        methon: 1,
        schoolId: 1,
        updateTime: '2018-05-25T06:11:38.357Z'
      },
      {
        id: 2,
        content: '内容',
        creatorName: '操作人',
        env: 2,
        mobile: [],
        methon: 1,
        schoolId: 1,
        planPushTime: '2018-05-25T06:11:38.357Z',
        schoolName: '富士康',
        target: 1,
        type: 2,
        status: 3,
        updateTime: '2018-05-25T06:11:38.357Z'
      },
      {
        id: 3,
        content: '内容',
        creatorName: '操作人',
        env: 1,
        mobile: [],
        methon: 2,
        schoolId: 2,
        planPushTime: '2018-05-25T06:11:38.357Z',
        schoolName: '富士康',
        target: 2,
        type: 1,
        status: 4,
        updateTime: '2018-05-25T06:11:38.357Z'
      }
    ],
    total: 3
  }
}
const beingPushHandler = (resource, body) => {
  if (resource === 'beings/list') {
    let json = beings_list
    return Promise.resolve(json)
  } else if (resource === 'beings/info') {
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
}

export default beingPushHandler
