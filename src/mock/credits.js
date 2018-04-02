import { add_success } from './generalResponse'
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
const creditsHandler = (resource, body, cb) => {
  if (resource === '/credits/list') {
    let json = credit_list
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

export default creditsHandler
