const fundCheck_mistake_list = {
  data: {
    fundsCheckMistakeRespDTOS: [
      {
        id: 1,
        schoolName: '笑联大学',
        orderType: 1,
        mistakeType: 1,
        mistakeReason: '本地有账单，第三方支付无账单',
        mistakeAmount: 1,
        orderCreateTime: 1526274106000,
        settleMethod: 2,
        settleStatus: 1,
        settleUserName: '代欣雨',
        settleTime: 1526274119000
      }
    ],
    total: 1
  },
  timestamp: 1526278293746
}
const detail = {
  data: {
    fundsMistake: {
      mistakeAmount: 222,
      mistakeReason: 0,
      mistakeType: 2,
      orderCreateTime: 14444444444,
      orderType: 1,
      schoolName: 'schoolName',
      settleMethod: 2,
      settleStatus: 1,
      settleTime: 14444444444,
      settleUser: 'settleUser'
    },
    platformOrder: {
      amount: 0,
      createTime: '2018-05-14T04:42:19.974Z',
      finishTime: '2018-05-14T04:42:19.974Z',
      orderNo: 'orderNo',
      orderStatus: 3,
      orderType: 1,
      userPhone: 'userPhone'
    },
    thirdOrder: {
      amount: 0,
      oderCreateTime: '2018-05-14T04:42:19.974Z',
      orderFinishTime: '2018-05-14T04:42:19.974Z',
      platformOrderNo: 'platformOrderNo',
      status: 1,
      thirdType: 1,
      userAccount: 'userAccount'
    }
  },
  error: {
    bleCmdType: 0,
    code: 0,
    debugMessage: 'string',
    displayMessage: 'string'
  },
  timestamp: '2018-05-14T04:42:19.974Z'
}
const fundCheckHandler = (resource, body, cb) => {
  if (resource === '/fundsCheck/mistake/list') {
    let json = fundCheck_mistake_list
    return Promise.resolve(json)
  } else if (resource === '/fundsCheck/mistake/detail') {
    return Promise.resolve(detail)
  }
}

export default fundCheckHandler
