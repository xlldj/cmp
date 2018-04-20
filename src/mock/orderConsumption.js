const orderConsumption_list = {
  data: {
    list: [
      {
        schoolId: 1,
        schoolName: 'schoolName',
        deviceType: 1,
        deviceId: 2,
        location: 'location',
        consumption: 333,
        warningTaskHandling: true
      },
      {
        schoolId: 1,
        schoolName: 'schoolName',
        deviceType: 2,
        deviceId: 3,
        location: 'location',
        consumption: 333,
        warningTaskHandling: false
      },
      {
        schoolId: 1,
        schoolName: 'schoolName',
        deviceType: 2,
        deviceId: 4,
        location: 'location',
        consumption: 333,
        warningTaskHandling: false
      }
    ],
    total: 0
  }
}
const orderConsumptionHandler = (resource, body) => {
  if (resource === '/order/consumption/device/list') {
    let json = orderConsumption_list
    return Promise.resolve(json)
  }
}

export default orderConsumptionHandler
