import Noti from './noti'
import { getToken } from './handleToken'
import { removeStore } from './storage'
const domains = {
  qa: {
    manager: 'http://116.62.236.67:5080',
    user: 'http://116.62.236.67:5081'
  },
  qa2: {
    manager: 'http://39.108.97.229:5080',
    user: 'http://39.108.97.229:5081'
  },
  local: {
    manager: 'http://10.0.0.4:5080',
    user: 'http://10.0.0.4:5081'
  },
  changdang: {
    manager: 'http://10.195.90.130:5080',
    user: 'http://10.195.90.130:5081'
  },
  server: {
    manager: 'https://api.xiaolian365.com/m',
    user: 'https://api.xiaolian365.com/c'
  },
  dxy: {
    manager: 'http://10.195.90.187:5080',
    user: 'http://10.195.90.187:5080'
  },
  wq: {
    manager: 'http://10.195.90.172:5080',
    user: 'http://10.195.90.172:5081'
  },
  pre: {
    manager: 'http://47.106.62.186/m',
    user: 'http://47.106.62.186/c'
  },
  zdc: {
    manager: 'http://10.195.90.143:8080',
    user: 'http://10.195.90.143:8081'
  },
  szy: {
    manager: 'http://10.195.90.167:5080',
    user: 'http://10.195.90.167:5081'
  }
}
const currentDomain = domains.server
const AjaxHandler = {
  showingError: false
}

/* tell user current token is out-of-date, force to refresh */
const hintExpire = () => {
  // alert('expire')
  const logout = () => {
    removeStore('logged')
    window.location.assign('/')
  }
  Noti.hintAndClick(
    '您的账户已在别的地方登录',
    '您将被强制退出，请重新登录',
    logout
  )
}

/* This is timeout for error hint. For each category, only show the hint once in 4s */
AjaxHandler.ti = () =>
  setTimeout(() => {
    AjaxHandler.showingError = false
  }, 4000)
AjaxHandler.tiForTo = () =>
  setTimeout(() => {
    AjaxHandler.showingTo = false
  }, 4000)
AjaxHandler.tiFor10008 = () =>
  setTimeout(() => {
    AjaxHandler.showing10008 = false
  }, 4000)
AjaxHandler.tiFor10009 = () =>
  setTimeout(() => {
    AjaxHandler.showing10009 = false
  }, 4000)
AjaxHandler.tiFor10003 = () =>
  setTimeout(() => {
    AjaxHandler.showing10003 = false
  }, 4000)
AjaxHandler.tiForOther = () =>
  setTimeout(() => {
    AjaxHandler.showingOther = false
  }, 4000)
AjaxHandler.tiForNet = () =>
  setTimeout(() => {
    AjaxHandler.showingNetError = false
  }, 4000)
AjaxHandler.tiForBug = () =>
  setTimeout(() => {
    AjaxHandler.showingBug = false
  }, 4000)

/**
 * fetch has no timeout originally, so give a timeout promise to compete. If timeout happens first, Hint error.
 * But Notice, the ajax may be successful (Especially under slow network)
 */
const abortablePromise = (
  fetch_promise,
  cb,
  serviceErrorCb,
  options,
  errorCb
) => {
  let timeoutAction = null

  // 这是一个可以被reject的promise
  const timerPromise = new Promise((resolve, reject) => {
    timeoutAction = () => {
      reject('timeout')
    }
  })

  // 这里使用Promise.race，以最快 resolve 或 reject 的结果来传入后续绑定的回调
  const abortable_promise = Promise.race([fetch_promise, timerPromise])
    .then(response => {
      if (response.status >= 200 && response.status < 300) {
        return response
      }
      throw response
    })
    .then(response => {
      let contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return response.json()
      }
      throw new TypeError('返回的数据类型出错!')
    })
    .then(json => {
      if (json.error) {
        /* if the caller has own service-error-callback, do not throw error, just exect it */
        /* else throw the error */
        if (serviceErrorCb) {
          serviceErrorCb(json.error)
        } else {
          throw json.error
        }
      } else {
        /* successful callback */
        cb(json)
      }
    })
    .catch(error => {
      console.log(error)
      if (errorCb) {
        errorCb(error)
      }
      /* if need clear posting status for the caller class even error occurs, clear the status */
      if (options && options.clearPosting && options.thisObj) {
        options.thisObj.setState({
          posting: false
        })
      }
      /* same for checking status clear */
      if (options && options.clearChecking && options.thisObj) {
        options.thisObj.setState({
          checking: false
        })
      }
      /* same for loading status clear */
      if (options && options.clearLoading && options.thisObj) {
        options.thisObj.setState({
          loading: false
        })
      }
      let title, message
      // if timeout
      if (error === 'timeout') {
        title = '请求超时'
        message = '请稍后重试～'
        // 如果是超时，判断是否正在显示超时错误，无则提示，否则返回
        if (!AjaxHandler.showingTo) {
          Noti.hintLock(title, message)
          AjaxHandler.showingTo = true
          return AjaxHandler.tiForTo()
        }
      } else if (error.status && (error.status < 200 || error.status >= 300)) {
        // network error
        if (error.status === 401) {
          // 若为异地登录，提示重新登录，
          if (!AjaxHandler.showingExpire) {
            hintExpire()
            AjaxHandler.showingExpire = true
          }
        } else {
          /* ordinary network error, just toast */
          if (!AjaxHandler.showingNetError) {
            Noti.hintNetworkError()
            AjaxHandler.showingNetError = true
            return AjaxHandler.tiForNet()
          }
        }
      } else if (error.code) {
        // error.code shows this is form server.
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
        } else if (error.code === 30002) {
          // dispatched when employee/account exists (employeeInfo.js)
          title = '账号重复'
          message = error.displayMessage || '账号重复，请重新生成后提交'
          // message = '当前操作针对的信息已在别处被更改，请稍后重新查看其状态'
        } else {
          console.log(error.message)
          message =
            error.message || error.displayMessage || '网络错误，请稍后刷新重试'
        }
        // 是否有对应回调，无则归为other类中
        let tiCallback = AjaxHandler[`tiFor${error.code}`]
        if (tiCallback) {
          // 如果有对应的回调，且当前未显示该类错误，显示错误
          if (!AjaxHandler[`showing${error.code}`]) {
            Noti.hintWarning(title, message)
            AjaxHandler[`showing${error.code}`] = true
            tiCallback()
          }
        } else {
          // 显示其它错误
          if (!AjaxHandler.showingOther) {
            Noti.hintWarning(title, message)
            AjaxHandler.showingOther = true
            AjaxHandler.tiForOther()
          }
        }
      } else {
        if (error.title) {
          // error myself throwed, need to clear
          Noti.hintLock(error.title, error.message)
        } else if (error.message === 'Failed to fetch') {
          if (!AjaxHandler.showingNetError) {
            Noti.hintNetworkError()
            AjaxHandler.showingNetError = true
            return AjaxHandler.tiForNet()
          }
        } else if (!AjaxHandler.showingBug) {
          Noti.hintLock('程序出错', '请咨询相关人员')
          AjaxHandler.showingBug = true
          AjaxHandler.tiForBug()
        }
      }
    })

  /* reject timeout promise after 5s */
  setTimeout(() => {
    timeoutAction()
  }, 5000)

  return abortable_promise
}

/**
 * for ajax
 * @function ajax
 * @param {String}      resource         pathname of api
 * @param {Object}      body             request body
 * @param {function}    cb               callback for success ajax
 * @param {? function}  serviceErrorCb   error callback for service error, this callback will end error handling. A service error is a response with json.error.
 * @param {? Object}    options          other options, mostly for setState in component
 * @param {? errorCb}   errorCb          callback for general error, this callback won't end error handling.
 * @return {Promise}
 */
AjaxHandler.ajax = (resource, body, cb, serviceErrorCb, options, errorCb) => {
  /* ----handle the 'api' ----- */
  /* this is because cmp used a node.js server as a mock server at the beginning. And I used '/api' to distinguish it from Java server api */
  if (resource.includes('/api')) {
    resource = resource.replace('/api', '')
  }
  // 默认使用管理端账户，除非用domain字段传入
  // debugger
  let url
  if (options && options.domain) {
    url = options.domain + resource
  } else {
    url = currentDomain.manager + resource
  }

  const token = getToken()

  const hdrs = {
    'Content-Type': 'application/json',
    Accept: 'application/json' || '*/*',
    token: token
  }

  let fetch_promise = fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: hdrs
  })

  return abortablePromise(fetch_promise, cb, serviceErrorCb, options, errorCb)
}

/* for client ajax request */
AjaxHandler.ajaxClient = (resource, body, cb) => {
  const domain = currentDomain.user
  AjaxHandler.ajax(resource, body, cb, null, { domain: domain })
}

/* change to promise based ajax */

const abortablePromiseWrapper = (
  fetch_promise,
  serviceErrorCb,
  options,
  errorCb
) => {
  let timeoutAction = null

  // 这是一个可以被reject的promise
  const timerPromise = new Promise((resolve, reject) => {
    timeoutAction = () => {
      reject('timeout')
    }
  })

  // 这里使用Promise.race，以最快 resolve 或 reject 的结果来传入后续绑定的回调
  const abortable_promise = Promise.race([fetch_promise, timerPromise])
    .then(response => {
      if (response.status >= 200 && response.status < 300) {
        return response
      }
      throw response
    })
    .then(response => {
      let contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return response.json()
      }
      throw new TypeError('返回的数据类型出错!')
    })
    .then(json => {
      if (json.error) {
        /* if the caller has own service-error-callback, do not throw error, just exect it */
        /* else throw the error */
        if (serviceErrorCb) {
          serviceErrorCb(json.error)
        } else {
          console.log('error happen')
          throw json.error
        }
      } else {
        /* successful callback */
        return json
      }
    })
    .catch(error => {
      console.log(error)
      if (errorCb) {
        errorCb(error)
      }
      /* if need clear posting status for the caller class even error occurs, clear the status */
      if (options && options.clearPosting && options.thisObj) {
        options.thisObj.setState({
          posting: false
        })
      }
      /* same for checking status clear */
      if (options && options.clearChecking && options.thisObj) {
        options.thisObj.setState({
          checking: false
        })
      }
      /* same for loading status clear */
      if (options && options.clearLoading && options.thisObj) {
        options.thisObj.setState({
          loading: false
        })
      }
      let title, message
      // if timeout
      if (error === 'timeout') {
        title = '请求超时'
        message = '请稍后重试～'
        // 如果是超时，判断是否正在显示超时错误，无则提示，否则返回
        if (!AjaxHandler.showingTo) {
          Noti.hintLock(title, message)
          AjaxHandler.showingTo = true
          return AjaxHandler.tiForTo()
        }
      } else if (error.status && (error.status < 200 || error.status >= 300)) {
        // network error
        if (error.status === 401) {
          // 若为异地登录，提示重新登录，
          if (!AjaxHandler.showingExpire) {
            hintExpire()
            AjaxHandler.showingExpire = true
          }
        } else {
          /* ordinary network error, just toast */
          if (!AjaxHandler.showingNetError) {
            Noti.hintNetworkError()
            AjaxHandler.showingNetError = true
            return AjaxHandler.tiForNet()
          }
        }
      } else if (error.code) {
        // error.code shows this is form server.
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
        } else if (error.code === 30002) {
          // dispatched when employee/account exists (employeeInfo.js)
          title = '账号重复'
          message = error.displayMessage || '账号重复，请重新生成后提交'
          // message = '当前操作针对的信息已在别处被更改，请稍后重新查看其状态'
        } else {
          console.log(error.message)
          message =
            error.message || error.displayMessage || '网络错误，请稍后刷新重试'
        }
        // 是否有对应回调，无则归为other类中
        let tiCallback = AjaxHandler[`tiFor${error.code}`]
        if (tiCallback) {
          // 如果有对应的回调，且当前未显示该类错误，显示错误
          if (!AjaxHandler[`showing${error.code}`]) {
            Noti.hintWarning(title, message)
            AjaxHandler[`showing${error.code}`] = true
            tiCallback()
          }
        } else {
          // 显示其它错误
          if (!AjaxHandler.showingOther) {
            Noti.hintWarning(title, message)
            AjaxHandler.showingOther = true
            AjaxHandler.tiForOther()
          }
        }
      } else {
        if (error.title) {
          // error myself throwed, need to clear
          Noti.hintLock(error.title, error.message)
        } else if (error.message === 'Failed to fetch') {
          if (!AjaxHandler.showingNetError) {
            Noti.hintNetworkError()
            AjaxHandler.showingNetError = true
            return AjaxHandler.tiForNet()
          }
        } else if (!AjaxHandler.showingBug) {
          Noti.hintLock('程序出错', '请咨询相关人员')
          AjaxHandler.showingBug = true
          AjaxHandler.tiForBug()
        }
      }
    })

  /* reject timeout promise after 5s */
  setTimeout(() => {
    timeoutAction()
  }, 10000)

  return abortable_promise
}

AjaxHandler.fetch = (resource, body, serviceErrorCb, options, errorCb) => {
  /* ----handle the 'api' ----- */
  /* this is because cmp used a node.js server as a mock server at the beginning. And I used '/api' to distinguish it from Java server api */
  if (resource.includes('/api')) {
    resource = resource.replace('/api', '')
  }
  // 默认使用当前设置的服务器，除非用domain字段传入
  let url
  if (options && options.domain) {
    // 自定义域名+端口
    url = options.domain + resource
  } else {
    // 默认域名+自定义端口
    if (options && options.userPort) {
      url = currentDomain.user + resource
    } else {
      url = currentDomain.manager + resource
    }
  }

  const token = getToken()

  const hdrs = {
    'Content-Type': 'application/json',
    Accept: 'application/json' || '*/*',
    token: token
  }

  let fetch_promise = fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: hdrs
  })

  return abortablePromiseWrapper(
    fetch_promise,
    serviceErrorCb,
    options,
    errorCb
  )
}

AjaxHandler.postFile = (file, resource, options) => {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest()
    xhr.timeout = 4000

    // 监听文件上传进度
    xhr.upload.onprogress = function(evt) {
      // lengthComputabel: 文件长度是否可计算
      if (evt.lengthComputable) {
        // evt.loaded: 已下载的字节数
        // evt.total: 文件总字节数
        var percent = Math.round(evt.loaded * 100 / evt.total)
        console.log(percent)
      }
    }

    // 监听传输结束事件: 不管成功或者失败都会触发
    xhr.onreadystatechange = function(evt) {
      if (xhr.readyState === 4 && xhr.status === 200) {
        const res = xhr.response
        resolve(JSON.parse(res))
      }
    }
    const errorHandler = e => {
      reject(e)
    }
    xhr.onerror = errorHandler
    xhr.ontimeout = errorHandler

    //* 发起ajax请求数据
    if (resource.includes('/api')) {
      resource = resource.replace('/api', '')
    }
    xhr.open('POST', currentDomain.manager + resource, true)

    const token = getToken()
    xhr.setRequestHeader('token', token)
    const formData = new FormData()
    formData.append('file', file)
    if (options && options.keys) {
      options.keys.forEach(k => {
        formData.append(k.key, k.value)
      })
    }
    xhr.send(formData)
  })
}

export default AjaxHandler
