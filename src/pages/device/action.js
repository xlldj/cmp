import AjaxHandler from '../../util/ajax'
import store from '../../index'
import CONSTANTS from '../../constants'
const { PAGINATION, DEVICE_TYPE_DRINGKER } = CONSTANTS

export const CHANGE_DEVICE = 'CHANGE_DEVICE'
export const CHANGE_MODAL_REPAIRLIST = 'CHANGE_MODAL_REPAIRLIST'
export const CHANGE_MODAL_DEVICEINFO = 'CHANGE_MODAL_DEVICEINFO'
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

export const fetchRepairList = body => {
  const { repairListModal } = store.getState()
  const { loading } = repairListModal
  if (loading) {
    return
  }
  store.dispatch({
    type: CHANGE_MODAL_REPAIRLIST,
    value: {
      loading: true
    }
  })
  const resource = '/api/work/order/list'
  AjaxHandler.fetch(resource, body).then(json => {
    const value = {
      loading: false
    }
    if (json && json.data) {
      value.list = json.data.workOrders
    }
    store.dispatch({
      type: CHANGE_MODAL_REPAIRLIST,
      value
    })
  })
}

export const fetchDeviceInfo = body => {
  const { deviceInfoModal } = store.getState()
  const { loading } = deviceInfoModal
  if (loading) {
    return
  }
  store.dispatch({
    type: CHANGE_MODAL_DEVICEINFO,
    value: {
      loading: true
    }
  })
  let resource = '/api/work/order/list'
  if (body.deviceType === DEVICE_TYPE_DRINGKER) {
    resource = '/device/water/one'
  } else {
    resource = '/device/group/one'
  }
  AjaxHandler.fetch(resource, body).then(json => {
    const value = {
      loading: false
    }
    if (json && json.data) {
      value.detail = json.data
    }
    store.dispatch({
      type: CHANGE_MODAL_DEVICEINFO,
      value
    })
  })
}
