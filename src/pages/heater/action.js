import AjaxHandler from '../../util/ajax'
// import AjaxHandler from '../../mock/ajax'
import CONSTANTS from '../../constants'
const { PAGINATION, HEATER_STATUS_REGISTERD } = CONSTANTS

export const CHANGE_HEATER = 'CHANGE_HEATER'
export const changeHeater = (subModule, keyValuePair) => {
  return {
    type: CHANGE_HEATER,
    subModule,
    keyValuePair
  }
}

export const fetchHeaterList = newProps => {
  let { page, schoolId, tabIndex, loading } = newProps
  const clearLoading = dispatch => {
    dispatch({
      type: CHANGE_HEATER,
      subModule: 'heaterList',
      keyValuePair: {
        loading: false
      }
    })
  }
  return dispatch => {
    dispatch({
      type: CHANGE_HEATER,
      subModule: 'heaterList',
      keyValuePair: {
        loading: true
      }
    })
    const body = {
      page: page,
      size: PAGINATION,
      status: tabIndex
    }

    if (tabIndex === HEATER_STATUS_REGISTERD && schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    let resource = '/api/machine/unit/list'

    return AjaxHandler.fetch(resource, body, null, null).then(json => {
      if (json.data) {
        dispatch({
          type: CHANGE_HEATER,
          subModule: 'heaterList',
          keyValuePair: {
            dataSource: json.data.machineUnits,
            total: json.data.total,
            loading: false
          }
        })
      } else {
        clearLoading(dispatch)
      }
    })
  }
}
