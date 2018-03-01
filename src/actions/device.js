import AjaxHandler from '../util/ajax'
import CONSTANTS from '../constants'
const { PAGINATION } = CONSTANTS

export const CHANGE_DEVICE = 'CHANGE_DEVICE'
export const changeDevice = (subModule, keyValuePair) => {
  return {
    type: CHANGE_DEVICE,
    subModule,
    keyValuePair
  }
}

export const fetchDeviceList = newProps => {
  let { page, schoolId, deviceType, selectKey } = newProps
  const clearLoading = dispatch => {
    dispatch({
      type: CHANGE_DEVICE,
      subModule: 'deviceList',
      keyValuePair: {
        loading: false
      }
    })
  }
  return dispatch => {
    dispatch({
      type: CHANGE_DEVICE,
      subModule: 'deviceList',
      keyValuePair: {
        loading: true
      }
    })

    const body = {
      page: page,
      size: PAGINATION
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if (deviceType !== 'all') {
      body.type = deviceType
    }
    if (selectKey) {
      body.selectKey = selectKey
    }
    let resource = '/api/device/query/list'
    const cb = json => {
      dispatch({
        type: CHANGE_DEVICE,
        subModule: 'deviceList',
        keyValuePair: {
          dataSource: json.data.devices,
          total: json.data.total,
          loading: false
        }
      })
    }

    return AjaxHandler.ajax(resource, body, cb, null, null, () => {
      clearLoading(dispatch)
    })
  }
}

export const deleteComponent = id => {
  return dispatch => {
    const body = {
      id: id
    }
    let resource = '/api/device/component/delete'
    const cb = json => {
      // dispatch fetch
    }

    return AjaxHandler.ajax(resource, body, cb)
  }
}
