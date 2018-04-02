const order_stat_list = {
  data: {
    list: [
      {
        deviceType: 1,
        orderAverage: 0,
        orderCount: 0,
        schoolName: 'schoolName',
        totalIncome: 0,
        userAverage: 0,
        userCount: 0
      }
    ],
    total: 0
  }
}
const order_stat_histogram = {
  data: {
    orderPoints: [
      {
        x: 1,
        y: 0
      }
    ],
    userPoints: [
      {
        x: 2,
        y: 0
      }
    ]
  }
}
const orderHandler = (resource, body, cb) => {
  if (resource === '/order/statistic/list') {
    let json = order_stat_list
    return Promise.resolve().then(cb(json))
  } else if (resource === '/order/statistic/histogram') {
    return Promise.resolve().then(cb(order_stat_histogram))
  }
}

export default orderHandler
