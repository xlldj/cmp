import { delete_error, delete_ok } from './generalResponse'
const authUser_list = {
  data: {
    list: [
      {
        id: 1,
        userId: 1,
        userName: 'userName1',
        userNo: 'userNo1',
        authTime: 1525677978000,
        auth: 1
      },
      {
        id: 2,
        userId: 2,
        userName: 'userName2',
        userNo: 'userNo2',
        mobile: 'mobile2',
        authTime: 1525607978000,
        auth: 2
      },
      {
        id: 3,
        userId: 100134,
        userName: 'userName3',
        userNo: 'userNo3',
        mobile: 'mobile3',
        authTime: 1525600978000,
        auth: 2
      }
    ],
    total: 0
  }
}
const userAuthHandler = (resource, body) => {
  if (resource === '/user/auth/list') {
    let json = authUser_list
    return Promise.resolve(json)
  } else if (resource === '/user/deauth') {
    const index = authUser_list.data.list.findIndex(a => a.id === body.id)
    if (index !== -1) {
      authUser_list.data.list.splice(index, 1)
      return Promise.resolve(delete_ok)
    }
    return Promise.resolve(delete_error)
  }
}

export default userAuthHandler
