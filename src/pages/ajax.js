import Noti from './noti'
import {getToken} from './util/handleToken'
import {removeStore} from './util/storage'

const AjaxHandler = {
  showingError: false
}

const hintExpire = () => {
  // alert('expire')
  const logout = () => {
    removeStore()
    window.location.assign('/')
  }
  Noti.hintAndClick('您的账户已在别的地方登录', '您将被强制退出，请重新登录', logout)
}

AjaxHandler.ti = () => setTimeout(() => {
  AjaxHandler.showingError = false
}, 4000)
AjaxHandler.tiForTo = () => setTimeout(() => {
  AjaxHandler.showingTo = false
}, 4000)
AjaxHandler.tiFor10008 = () => setTimeout(() => {
  AjaxHandler.showing10008 = false
}, 4000)
AjaxHandler.tiFor10009 = () => setTimeout(() => {
  AjaxHandler.showing10009 = false
}, 4000)
AjaxHandler.tiFor10003 = () => setTimeout(() => {
  AjaxHandler.showing10003 = false
}, 4000)
AjaxHandler.tiForOther = () => setTimeout(() => {
  AjaxHandler.showingOther = false
}, 4000)

const abortablePromise = (fetch_promise, cb, errorCb) => {
  let timeoutAction = null

  // 这是一个可以被reject的promise
  const timerPromise = new Promise((resolve, reject) => {
    timeoutAction = () => {
      reject('timeout')
    }
  })

  // 这里使用Promise.race，以最快 resolve 或 reject 的结果来传入后续绑定的回调
  const abortable_promise = Promise.race([fetch_promise, timerPromise])
                                    .then((response) => {
                                      if (response.status >= 200 && response.status < 300) {
                                        return response
                                      }

                                      throw response
                                    })
                                    .then((response) => {
                                      let contentType = response.headers.get('content-type')
                                      if (contentType && contentType.includes('application/json')) {
                                        return response.json()
                                      }
                                      throw new TypeError('返回的数据类型出错!')
                                    })
                                    .then((json) => {
                                      cb(json)
                                    })
                                    .catch((error) => {
                                      console.log(error)
                                      let title, message
                                      if (errorCb) {
                                        errorCb()
                                      }
                                      if (error === 'timeout') {
                                        title = '请求超时'
                                        message = '请稍后重试～'
                                        // 如果是超时，判断是否显示超时错误，无则提示，否则返回
                                        if (!AjaxHandler.showingTo) {
                                          Noti.hintLock(title, message)
                                          AjaxHandler.showingTo = true
                                          AjaxHandler.tiForTo()
                                        }
                                      } else {
                                        title = error.title || '请求出错'
                                        if (error.code === 10008) {
                                          message = error.displayMessage
                                        } else if (error.code === 10002) {
                                          title = '服务器错误'
                                          message = error.displayMessage
                                        } else if (error.code === 10003) {
                                          title = '参数异常'
                                          message = error.displayMessage
                                        } else if (error.code === 10009) {
                                          title = '状态异常'
                                          // message = error.displayMessage
                                          message = '当前操作针对的信息已在别处被更改，请稍后重新查看其状态'
                                        } else {
                                          message = error.message || error.displayMessage || '网络错误，请稍后重试'
                                        }
                                        // 若为异地登录，提示重新登录，
                                        if (error.status === 401) {
                                          if (!AjaxHandler.showingExpire) {
                                            hintExpire()
                                            AjaxHandler.showingExpire = true
                                          }
                                          return
                                        }
                                        // 是否有对应回调，无则归为other类中
                                        let tiCallback = AjaxHandler[`tiFor${error.code}`]
                                        if (tiCallback) {
                                          // 如果有对应的回调，且当前未显示该类错误，显示错误
                                          if (!AjaxHandler[`showing${error.code}`]) {
                                            Noti.hintLock(title, message)
                                            AjaxHandler[`showing${error.code}`] = true
                                            tiCallback()
                                          }
                                        } else {
                                          // 显示其它错误
                                          if (!AjaxHandler.showingOther) {
                                            Noti.hintLock(title, message)
                                            AjaxHandler.showingOther = true
                                            AjaxHandler.tiForOther()
                                          }
                                        }
                                      }
                                      /* if (!AjaxHandler.showingError) {
                                        if (error.status === 401) {
                                          hintExpire()
                                          AjaxHandler.showingError = true
                                          return
                                        }
                                        Noti.hintLock(title, message)
                                        AjaxHandler.showingError = true
                                        AjaxHandler.ti()
                                      } */
                                    })

  setTimeout(() => { timeoutAction() }, 3000)

  return abortable_promise
}

AjaxHandler.ajax = (resource, body, cb, errorCb) => {
  /* ----handle the 'api' ----- */
  if (resource.includes('/api')) {
    resource = resource.replace('/api', '')
  }
  // const url = 'http://116.62.236.67:5080' + resource
  // const url = 'http://10.0.0.4:5080' + resource
  const url = 'https://api.xiaolian365.com/m' + resource
  // const url = resource

  const token = getToken()

  const hdrs = {
    'Content-Type': 'application/json',
    'Accept': 'application/json' || '*/*',
    token: token
  }

  let fetch_promise = fetch(url, {method: 'POST', body: JSON.stringify(body), headers: hdrs})

  return abortablePromise(fetch_promise, cb, errorCb)
}

AjaxHandler.uploadFile = (body, cb) => {
  let url = 'https://api.xiaolian365.com/file/upload'
  const token = getToken()

  const hdrs = {
    token: token
  }

  let fetchPromise = fetch(url, {method: 'POST', body: body, headers: hdrs, mode: 'cors'})
  return abortablePromise(fetchPromise, cb)
}

export default AjaxHandler
