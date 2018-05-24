import { delete_error, delete_ok } from './generalResponse'
const beings_list = {
  data: {
    list: [
      {
        id: 1,
        schoolName: '富士康',
        pushtype: 1,
        pushEqument: 2,
        pushObj: '管理员',
        pushTime: 1525607978000,
        pushContent: '内容',
        createPerson: 'ren1',
        createTime: 1525607978000,
        pushStatus: 2
      },
      {
        id: 2,
        schoolName: '富士康',
        pushtype: 1,
        pushEqument: 2,
        pushObj: '管理员',
        pushTime: 1525607978000,
        pushContent: '内容',
        createPerson: 'ren1',
        createTime: 1525607978000,
        pushStatus: 2
      },
      {
        id: 3,
        schoolName: '富士康',
        pushtype: 1,
        pushEqument: 2,
        pushObj: '管理员',
        pushTime: 1525607978000,
        pushContent: '内容',
        createPerson: 'ren1',
        createTime: 1525607978000,
        pushStatus: 2
      }
    ],
    total: 0
  }
}
const userAuthHandler = (resource, body) => {
  if (resource === 'beings/list') {
    let json = beings_list
    return Promise.resolve(json)
  } else if (resource === 'beings/detail') {
    const index = beings_list.data.list.findIndex(a => a.id === body.id)
    if (index !== -1) {
      beings_list.data.list.splice(index, 1)
      return Promise.resolve(delete_ok)
    }
    return Promise.resolve(delete_error)
  }
}

export default userAuthHandler
