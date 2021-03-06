import React from 'react'
import { notification, Button } from 'antd'
import CONSTANTS from '../constants'

const Noti = {}

Noti.hintError = (message, description) => {
  notification['error']({
    message: '当前不能删除',
    description: '请先将关联数据清除或联系管理员删除',
    duration: 2
  })
}
Noti.hintOccupied = () => {
  notification['error']({
    message: '当前输入已被占用！',
    description: '请重新输入',
    duration: 2
  })
}
Noti.hintLock = (message, description) => {
  notification['error']({
    message: message || '请求出错',
    description: description,
    duration: 2
  })
}
Noti.hintWarning = (message, description) => {
  notification['warning']({
    message: message || '操作出错',
    description: description,
    duration: 2
  })
}
/* 通用网络错误 */
Noti.hintNetworkError = description => {
  notification['error']({
    message: '网络出错',
    description: description || CONSTANTS.NETWORKERRORMESSAGE,
    duration: 2
  })
}
/* 提示业务错误，非网络错误 */
Noti.hintServiceError = description => {
  notification['error']({
    message: '请求出错',
    description: description || CONSTANTS.ERRORALTMESSAGE,
    duration: 2
  })
}
Noti.hintSuccess = (history, route) => {
  const key = `open${Date.now()}`
  const btnClick = () => {
    // to hide notification box
    history.push(route)
    notification.close(key)
  }
  const btn = (
    <Button type="primary" size="small" onClick={btnClick}>
      返回
    </Button>
  )
  const close = () => {
    history.push(route)
  }
  notification['success']({
    message: '操作成功！',
    description: '马上转回列表~',
    btn,
    key,
    onClose: close,
    duration: 1
  })
}
Noti.hintSuccessAndBack = history => {
  const key = `open${Date.now()}`
  const btnClick = () => {
    // to hide notification box
    history.goBack()
    notification.close(key)
  }
  const btn = (
    <Button type="primary" size="small" onClick={btnClick}>
      返回
    </Button>
  )
  const close = () => {
    history.goBack()
  }
  notification['success']({
    message: '操作成功！',
    description: '马上返回',
    btn,
    key,
    onClose: close,
    duration: 1
  })
}
Noti.hintSuccessWithoutSkip = () => {
  notification['success']({
    message: '操作成功',
    duration: 2
  })
}
Noti.hintOk = (message, description) => {
  notification['success']({
    message: message,
    description: description,
    duration: 2
  })
}

Noti.hintLog = () => {
  notification['success']({
    message: '登录成功',
    duration: 0.5
  })
}
// 只有一个回调，确认和关闭都会调用
Noti.hintAndClick = (message, description, cb) => {
  const key = `open${Date.now()}`
  const btnClick = () => {
    // to hide notification box
    if (cb) {
      cb()
    }
    notification.close(key)
  }
  const btn = (
    <Button type="primary" size="small" onClick={btnClick}>
      确认
    </Button>
  )
  const close = () => {
    if (cb) {
      cb()
    }
  }
  notification['info']({
    message: message,
    description: description,
    btn,
    key,
    onClose: close,
    duration: null
  })
}
// 带有确认和取消的回调
Noti.clickForYesOrNo = (message, description, confirmCb, cancelCb) => {
  const key = `open${Date.now()}`
  const yesClick = () => {
    // to hide notification box
    if (confirmCb) {
      confirmCb()
    }
    notification.close(key)
  }
  const btn = (
    <Button type="primary" size="small" onClick={yesClick}>
      确认
    </Button>
  )
  const close = () => {
    if (cancelCb) {
      cancelCb()
    }
  }
  notification['info']({
    message: message,
    description: description,
    btn,
    key,
    onClose: close,
    duration: null
  })
}
Noti.hintAndRoute = (message, description, history, route) => {
  const key = `open${Date.now()}`
  const btnClick = () => {
    // to hide notification box
    history.push(route)
    notification.close(key)
  }
  const btn = (
    <Button type="primary" size="small" onClick={btnClick}>
      确认
    </Button>
  )
  const close = () => {
    history.push(route)
  }
  notification['info']({
    message: message,
    description: description,
    btn,
    key,
    onClose: close,
    duration: 1
  })
}
Noti.hintProgramError = () => {
  Noti.hintLock('程序出错', '请联系相关人员')
}
export default Noti
