import { stopBeat } from '../tasks/heartBeat'
import AjaxHandler from '../util/ajax'
import { buildAuthenData } from '../util/authenDataHandle'
import { getStore, setStore, removeStore } from '../util/storage'

export const fetchTaskDetail = body => {
  let resource = '/work/order/one'
  const cb = json => {
    // only handle data here
    let data = {
      [body.id]: json.data
    }
    let { details } = this.props.taskList
    let newDetails = Object.assign({}, details, data)
    let value = {
      details: newDetails,
      detailLoading: false
    }
    console.log(newDetails)
    // set data into store
  }
  // console.log(resource)
  AjaxHandler.ajax(resource, body, cb)
}
// fetch task/list
export const fetchTasks = body => {
  let resource = '/work/order/list'

  const cb = json => {
    this.setState({
      loading: false
    })
    let {
      main_phase,
      panel_total,
      showDetail,
      selectedDetailId,
      selectedRowIndex
    } = this.props.taskList
    let panel_dataSource = JSON.parse(
      JSON.stringify(this.props.taskList.panel_dataSource)
    )
    let newTotal = Array.from(panel_total)
    // console.log(json.data)
    // console.log(json.data[jsonKeyName])
    panel_dataSource[main_phase] = json.data.workOrders
    newTotal[main_phase] = json.data.total

    /* update 'selectedDetailId' if neccesary */
    let newProps = {
      panel_dataSource: panel_dataSource,
      panel_total: newTotal
    }
    if (showDetail && selectedRowIndex === -1 && selectedDetailId !== -1) {
      let index = -1
      console.log(selectedDetailId)
      json.data.workOrders.forEach((r, i) => {
        if (r.id === selectedDetailId) {
          index = i
        }
      })
      if (index !== -1) {
        newProps.selectedRowIndex = index
      }
      console.log(index)
    }
  }
  this.setState({
    loading: true
  })
  AjaxHandler.ajax(resource, body, cb, null, {
    clearLoading: true,
    thisObj: this
  })
}

export const changeOffline = (forceOffline, stillHasTaskCallback) => {
  return dispatch => {
    let resource = '/employee/cs/offline'
    const body = {
      force: forceOffline
    }
    const cb = json => {
      if (json.data) {
        let data = {}
        if (forceOffline || json.data.amount === 0) {
          data.csOnline = false

          // set data into store
          dispatch({
            type: 'SET_USERINFO',
            value: data
          })
          removeStore('online')
          stopBeat()
        } else {
          if (stillHasTaskCallback) {
            stillHasTaskCallback()
          }
        }
      }
    }
    return AjaxHandler.ajax(resource, body, cb)
  }
}
// fetch privilege/list
export const fetchPrivileges = () => {
  return dispatch => {
    let resource = '/privilege/list'
    const body = null
    const cb = json => {
      let fullPrivileges = json.data.privileges
      // set full privileges data
      let full = buildAuthenData(fullPrivileges)
      let data = {
        full: full,
        originalPrivileges: fullPrivileges,
        authenSet: true
      }
      // set data into store
      dispatch({
        type: 'SET_AUTHENDATA',
        value: data
      })
      // store info into sessionStorage so it will remain when refresh
      // sessionStorage/authenInfo should always exist here, because it's set when login
      let authenInfo = JSON.parse(getStore('authenInfo'))
      if (authenInfo) {
        let auth = Object.assign({}, authenInfo, { full: full })
        console.log(auth)
        setStore('authenInfo', JSON.stringify(auth))
      }
    }
    return AjaxHandler.ajax(resource, body, cb)
  }
}

export const CHANGE_TASK = 'CHANGE_TASK'
export const changeTask = (subModule, keyValuePair) => {
  return {
    type: CHANGE_TASK,
    subModule,
    keyValuePair
  }
}
