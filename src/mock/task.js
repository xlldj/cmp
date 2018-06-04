import { delete_ok } from './generalResponse'

const deviceLocation = {
  data: {
    locations: [
      {
        label: 'A',
        value: 1,
        children: [
          {
            label: '一层',
            value: '2',
            children: [
              {
                label: '101',
                value: '3'
              }
            ]
          },
          {
            label: '二层',
            value: '8',
            children: [
              {
                label: '203',
                value: '9'
              }
            ]
          }
        ]
      },
      {
        label: 'B',
        value: 4,
        children: [
          {
            label: '一层',
            value: '11',
            children: [
              {
                label: '201',
                value: '337'
              }
            ]
          }
        ]
      }
    ]
  }
}
const taskHandler = (resource, body, cb) => {
  if (resource === '/work/order/relate') {
    return Promise.resolve(delete_ok)
  }
  if (resource === '/device/location') {
    return Promise.resolve(deviceLocation)
  }
}

export default taskHandler
