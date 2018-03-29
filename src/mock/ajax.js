const add_success = {
  data: {
    id: 2
  }
}
const credit_list = {
  data: {
    credits: [
      {
        createTime: 1519439707000,
        creatorId: 3,
        creatorName: 'creatorname',
        creditsItems: [
          {
            giftId: 18,
            credits: 1,
            deviceType: 1
          },
          {
            giftId: 19,
            credits: 2,
            deviceType: 2
          }
        ],
        id: 1,
        schoolId: 1,
        schoolName: 'schoolname'
      }
    ],
    total: 0
  }
}
const RESULTS = {
  credit_list: credit_list
}

const AjaxHandler = {
  showingError: false
}

AjaxHandler.ajax = (resource, body, cb, serviceErrorCb, options, errorCb) => {
  /* ----handle the 'api' ----- */
  /* this is because cmp used a node.js server as a mock server at the beginning. And I used '/api' to distinguish it from Java server api */
  if (resource.includes('/api')) {
    resource = resource.replace('/api', '')
  }
  // mock data
  if (resource === '/credits/list') {
    let json = RESULTS.credit_list
    return Promise.resolve().then(cb(json))
  } else if (resource === '/credits/add') {
    console.log(body)
    credit_list.data.credits.push(
      JSON.parse(
        JSON.stringify({ ...body, id: credit_list.data.credits.length + 1 })
      )
    )
    return Promise.resolve().then(cb(add_success))
  } else if (resource === '/credits/update') {
    console.log(body)
    let i = credit_list.data.credits.findIndex(c => c.id === body.id)
    credit_list.data.credits[i] = body
    return Promise.resolve().then(cb(add_success))
  } else if (resource === '/credits/check') {
    return Promise.resolve().then(
      cb({
        data: {
          result: false
        }
      })
    )
  } else if (resource === '/credits/delete') {
    let id = body.id
    let i = credit_list.data.credits.findIndex(c => c.id === body.id)
    credit_list.data.credits.splice(i, 1)
    return Promise.resolve().then(
      cb({
        data: {
          result: true
        }
      })
    )
  }
}

/* for client ajax request */
AjaxHandler.ajaxClient = (resource, body, cb) => {
  const domain = 'http://116.62.236.67:5081'
  // const domain = 'http://10.0.0.4:5081'
  // const domain = 'https://api.xiaolian365.com/c'
  // const domain = 'http://120.78.25.22:2080'
  AjaxHandler.ajax(resource, body, cb, null, { domain: domain })
}

export default AjaxHandler
