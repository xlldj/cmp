import { delete_error, delete_ok } from './generalResponse'
const quick_list = {
  data: {
    msgs: [
      {
        id: 1,
        msgTypeId: 1,
        msgTypeDesc: '消息类型1',
        content: '内容ccss',
        operUesrId: 1,
        operUserNickname: '操作人1',
        updateTime: 0
      },
      {
        id: 2,
        msgTypeId: 2,
        msgTypeDesc: '消息类型1',
        content: '内容ssss',
        operUesrId: 1,
        operUserNickname: '操作人1',
        updateTime: 0
      },
      {
        id: 3,
        msgTypeId: 3,
        msgTypeDesc: '消息类型1',
        content: '内容2222',
        operUesrId: 1,
        operUserNickname: '操作人1',
        updateTime: 0
      }
    ],
    total: 0
  }
}
const quick_type = {
  data: {
    msgTypes: [
      {
        id: 2,
        description: '消息类型0',
        operUesrId: 1,
        operUserNickname: '创建人',
        updateTime: 0
      },
      {
        id: 1,
        description: '消息类型1',
        operUesrId: 1,
        operUserNickname: '创建人',
        updateTime: 0
      },
      {
        id: 3,
        description: '消息类型2',
        operUesrId: 1,
        operUserNickname: '创建人',
        updateTime: 0
      }
    ],
    total: 0
  }
}
const quickListHandler = (resource, body) => {
  if (resource === '/work/order/quick_msg/list') {
    let json = quick_list
    return Promise.resolve(json)
  }
  if (resource === '/work/order/quick_msg/type/list') {
    let json = quick_type
    return Promise.resolve(json)
  }
  if (resource === '/work/order/quick_msg/one') {
    const index = quick_list.data.msgs.findIndex(a => a.id === body.id)
    if (index !== -1) {
      const json = {
        data: quick_list.data.msgs[index]
      }
      return Promise.resolve(json)
    }
  }
  if (resource === '/work/order/quick_msg/type/one') {
    const index = quick_type.data.msgTypes.findIndex(a => a.id === body.id)
    if (index !== -1) {
      const json = {
        data: quick_type.data.msgTypes[index]
      }
      return Promise.resolve(json)
    }
  }
  if (resource === '/work/order/quick_msg/type/delete') {
    const index = quick_type.data.msgTypes.findIndex(a => a.id === body.id)
    if (index !== -1) {
      quick_type.data.msgTypes.splice(index, 1)
      return Promise.resolve(delete_ok)
    }
    return Promise.resolve(delete_error)
  }
  if (resource === '/work/order/quick_msg/type/save') {
    if (body.id) {
      const index = quick_type.data.msgTypes.findIndex(a => a.id === body.id)
      if (index !== -1) {
        quick_type.data.msgTypes[index].description = body.description
        return Promise.resolve(delete_ok)
      }
    } else {
      quick_type.data.msgTypes.push({
        id: parseInt(quick_type.data.msgTypes.length, 10) + 1,
        description: body.description
      })
      return Promise.resolve(delete_ok)
    }

    return Promise.resolve(delete_error)
  }
  if (resource === '/work/order/quick_msg/save') {
    if (body.id) {
      const index = quick_list.data.msgs.findIndex(a => a.id === body.id)
      if (index !== -1) {
        quick_list.data.msgs[index].content = body.content
        quick_list.data.msgs[index].msgTypeId = body.msgTypeId
        return Promise.resolve(delete_ok)
      }
    } else {
      quick_list.data.msgs.push({
        id: parseInt(quick_list.data.msgs.length, 10) + 1,
        content: body.content,
        msgTypeId: body.msgTypeId
      })
      return Promise.resolve(delete_ok)
    }

    return Promise.resolve(delete_error)
  }
  if (resource === '/work/order/quick_msg/delete') {
    const index = quick_list.data.msgs.findIndex(a => a.id === body.id)
    if (index !== -1) {
      quick_list.data.msgs.splice(index, 1)
      return Promise.resolve(delete_ok)
    }
    return Promise.resolve(delete_error)
  }
}

export default quickListHandler
