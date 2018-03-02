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
        imei: 'string',
        lastLoginTime: '2018-03-02T08:46:43.185Z',
        loginCount: 0,
        machineCount: 0,
        name: 'string',
        registerTime: '2018-03-02T08:46:43.185Z',
        schoolName: 'string',
        status: 0
      }
    ],
    total: 1
  }
}

const heaterHandler = (resource, body, cb) => {
  if (resource === '/machine/unit/list') {
    let json = machineUnit_list
    return Promise.resolve().then(cb(json))
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
