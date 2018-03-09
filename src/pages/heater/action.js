import AjaxHandler from '../../util/ajax'
// import AjaxHandler from '../../mock/ajax'

export const CHANGE_HEATER = 'CHANGE_HEATER'
export const changeHeater = (subModule, keyValuePair) => {
  return {
    type: CHANGE_HEATER,
    subModule,
    keyValuePair
  }
}

export const fetchHeaterList = (body, subModule) => {
  const clearLoading = dispatch => {
    dispatch({
      type: CHANGE_HEATER,
      subModule,
      keyValuePair: {
        loading: false
      }
    })
  }
  return dispatch => {
    dispatch({
      type: CHANGE_HEATER,
      subModule,
      keyValuePair: {
        loading: true
      }
    })

    let resource = '/api/machine/unit/list'

    return AjaxHandler.fetch(resource, body, null, null).then(json => {
      console.log(json)
      if (json && json.data) {
        dispatch({
          type: CHANGE_HEATER,
          subModule,
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
