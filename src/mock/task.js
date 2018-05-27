import { delete_error, delete_ok } from './generalResponse'
const taskHandler = (resource, body, cb) => {
  if (resource === '/work/order/relate') {
    return Promise.resolve(delete_ok)
  }
}

export default taskHandler
