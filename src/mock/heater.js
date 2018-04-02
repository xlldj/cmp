import { add_success } from './generalResponse'
const machineUnit_list = {
  data: {
    machineUnits: [
      {
        buildingNames: ['string'],
        configStatus: 0,
        electricMeterRate: 0,
        emissionReductionParam: 0,
        id: 1,
        imei: 'imei',
        lastLoginTime: 1520216955000,
        loginCount: 0,
        machineCount: 0,
        name: 'string',
        registerTime: 1520216955000,
        schoolName: 'string',
        status: 0
      }
    ],
    total: 1
  },
  error: {
    test: 'test'
  }
}
const machineUnit_one = {
  data: {
    backWaterPump: 0,
    buildingIds: [0],
    configStatus: 0,
    electricMeterRate: 0,
    emissionReductionParam: 0,
    hotWaterModelId: 0,
    id: 0,
    imei: 'string',
    inverter: 0,
    lastLoginTime: '2018-03-05T03:36:45.493Z',
    loginCount: 0,
    name: 'string',
    registerTime: '2018-03-05T03:36:45.493Z',
    replenishmentWaterPump: 0,
    replyWaterPump: 0,
    schoolId: 0,
    solarEnergy: 0,
    startup: 0,
    waterHeater: 0,
    waterTanks: [
      {
        area: 0,
        height: 0,
        no: 0,
        range: 0
      }
    ]
  }
}

const heaterHandler = (resource, body, cb) => {
  if (resource === '/machine/unit/list') {
    let json = machineUnit_list
    return Promise.resolve().then(() => json)
  } else if (resource === '/machine/unit/one') {
    let json = machineUnit_one
    return Promise.resolve().then(() => json)
  } else if (resource === '/machine/unit/add') {
    console.log(body)
    machineUnit_list.data.machineUnit_list.push(
      JSON.parse(
        JSON.stringify({
          ...body,
          id: machineUnit_list.data.credits.length + 1
        })
      )
    )
    return Promise.resolve().then(cb(add_success))
  } else if (resource === '/machine/unit/update') {
    console.log(body)
    let i = machineUnit_list.data.credits.findIndex(c => c.id === body.id)
    machineUnit_list.data.credits[i] = body
    return Promise.resolve().then(cb(add_success))
  } else if (resource === '/machine/unit/check') {
    return Promise.resolve().then(
      cb({
        data: {
          result: false
        }
      })
    )
  } else if (resource === '/machine/unit/delete') {
    let i = machineUnit_list.data.credits.findIndex(c => c.id === body.id)
    machineUnit_list.data.credits.splice(i, 1)
    return Promise.resolve().then(
      cb({
        data: {
          result: true
        }
      })
    )
  }
}

export default heaterHandler
