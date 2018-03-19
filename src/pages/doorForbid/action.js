import AjaxHandler from '../../util/ajax'
// import AjaxHandler from '../../mock/ajax'
import DOORFORBID from '../../constants/doorForbid'
import Noti from '../../util/noti'

const {
  DOORFORBID_URL,
  DOORFORBID_PAGE_TAB_RECORD,
  DOORFORBID_PAGE_TAB_REPORT,
  DOORFORBID_PAGE_TAB_TIME
} = DOORFORBID

export const CHANGE_DOORFORBID = 'CHANGE_DOORFORBID'
export const changeDoorForbid = (subModule, keyValuePair) => {
  return {
    type: CHANGE_DOORFORBID,
    subModule,
    keyValuePair
  }
}

/**
 * 请求门禁记录中的列表
 * @param {*} tabIndex 选择的tab 1record 2report 3timeSetting
 * @param {*} body 请求body体
 * @param {*} subModule reducer定义的subModule
 */
export const fetchDoorForbidList = (tabIndex, body, subModule) => {
  if (tabIndex === DOORFORBID_PAGE_TAB_RECORD) {
    return fetchDoorForbidRecordList(body, subModule)
  } else if (tabIndex === DOORFORBID_PAGE_TAB_REPORT) {
    return fetchDoorForbidReportList(body, subModule)
  } else if (tabIndex === DOORFORBID_PAGE_TAB_TIME) {
    return fetchDoorForbidTimeSettingList(body, subModule)
  }
}
/**
 * 归寝记录 列表
 * @param {*} body 请求body体
 * @param {*} subModule
 */
const fetchDoorForbidRecordList = (body, subModule) => {
  const clearLoading = dispatch => {
    dispatch({
      type: CHANGE_DOORFORBID,
      subModule,
      keyValuePair: {
        record_loading: false
      }
    })
  }
  return dispatch => {
    dispatch({
      type: CHANGE_DOORFORBID,
      subModule,
      keyValuePair: {
        record_loading: true
      }
    })

    let resource = DOORFORBID_URL.recordList
    return AjaxHandler.fetch(resource, body, null, null).then(json => {
      console.log(json)

      if (json && json.data) {
        dispatch({
          type: CHANGE_DOORFORBID,
          subModule,
          keyValuePair: {
            record_dataSource: json.data.gateRecords,
            record_total: json.data.total,
            record_loading: false
          }
        })
      } else {
        clearLoading(dispatch)
      }
    })
  }
}

/**
 * 归寝报表 列表
 * @param {*} body 请求body体
 * @param {*} subModule
 */
const fetchDoorForbidReportList = (body, subModule) => {
  const clearLoading = dispatch => {
    dispatch({
      type: CHANGE_DOORFORBID,
      subModule,
      keyValuePair: {
        report_loading: false
      }
    })
  }
  return dispatch => {
    dispatch({
      type: CHANGE_DOORFORBID,
      subModule,
      keyValuePair: {
        report_loading: true
      }
    })

    let resource = DOORFORBID_URL.reportList

    return AjaxHandler.fetch(resource, body, null, null).then(json => {
      console.log(json)

      if (json && json.data) {
        dispatch({
          type: CHANGE_DOORFORBID,
          subModule,
          keyValuePair: {
            report_dataSource: json.data.gateRecords,
            report_total: json.data.total,
            report_loading: false
          }
        })
      } else {
        clearLoading(dispatch)
      }
    })
  }
}

/**
 * 归寝时间段 列表
 * @param {*} body 请求body体
 * @param {*} subModule
 */
const fetchDoorForbidTimeSettingList = (body, subModule) => {
  const clearLoading = dispatch => {
    dispatch({
      type: CHANGE_DOORFORBID,
      subModule,
      keyValuePair: {
        timeSetting_loading: false
      }
    })
  }
  return dispatch => {
    dispatch({
      type: CHANGE_DOORFORBID,
      subModule,
      keyValuePair: {
        timeSetting_loading: true
      }
    })

    let resource = DOORFORBID_URL.timeList

    return AjaxHandler.fetch(resource, body, null, null).then(json => {
      console.log(json)

      if (json && json.data) {
        dispatch({
          type: CHANGE_DOORFORBID,
          subModule,
          keyValuePair: {
            timeSetting_dataSource: json.data.gateTimes,
            timeSetting_total: json.data.total,
            timeSetting_loading: false
          }
        })
      } else {
        clearLoading(dispatch)
      }
    })
  }
}

/**
 * 学校楼栋列表
 * @param {schoolId} id
 * @param {*} props 调用函数的props 用于数据改变 页面即时刷新
 * @param {*} subModule
 */
export const fetchBuildings = (id, props, subModule) => {
  let schoolId = parseInt(id, 10)
  const body = {
    page: 1,
    size: 1000,
    schoolId: schoolId,
    residenceLevel: 1
  }
  let resource = '/api/residence/list'
  const cb = json => {
    try {
      let data = json.data.residences
      let buildingData = {}
      data.forEach(r => {
        buildingData[r.id] = r.name
      })

      props.changeDoorForbid(subModule, {
        buildingMap: buildingData
      })
    } catch (e) {
      console.log(e)
    }
  }
  AjaxHandler.ajax(resource, body, cb)
}

/**
 * 用户归寝记录查询
 * @param {*} body 请求的body体
 * @param {*} subModule
 * @param {*} formType 1 打卡记录 2归寝记录
 */
export const fetchDetailRecordList = (body, subModule, formType) => {
  const clearLoading = dispatch => {
    dispatch({
      type: CHANGE_DOORFORBID,
      subModule,
      keyValuePair: {
        detail_loading: false
      }
    })
  }
  return dispatch => {
    dispatch({
      type: CHANGE_DOORFORBID,
      subModule,
      keyValuePair: {
        detail_loading: true
      }
    })

    let resource =
      formType === 1
        ? DOORFORBID_URL.recordUserList
        : DOORFORBID_URL.reportUserList
    return AjaxHandler.fetch(resource, body, null, null).then(json => {
      console.log(json)

      if (json && json.data) {
        dispatch({
          type: CHANGE_DOORFORBID,
          subModule,
          keyValuePair: {
            detail_dataSource:
              formType === 1
                ? json.data.gateRecords
                : json.data.userReturnReports,
            detail_total: json.data.total,
            detail_loading: false
          }
        })
      } else {
        clearLoading(dispatch)
      }
    })
  }
}

/**
 * 解除绑定
 * @param {*} body 请求body体
 * @param {*} callBack 请求回调
 */
export const fetchUnbindUserInDorm = (body, callBack) => {
  let resource = DOORFORBID_URL.unbind
  const cb = json => {
    if (callBack) {
      callBack(json.data.result)
    }
  }
  AjaxHandler.ajax(resource, body, cb)
}

/**
 * 修改打卡记录或归寝报表 异常
 * @param {*} body 请求body体
 * @param {*} callBack 请求回调
 */
export const fetchChangeBackDormStatus = (body, callBack) => {
  let resource = DOORFORBID_URL.recordHandle
  const cb = json => {
    if (callBack) {
      callBack(json.data.result)
    }
  }
  AjaxHandler.ajax(resource, body, cb)
}

/**
 * 获取时间段设置详情
 * @param {schoolId} schoolId
 * @param {调用函数的props 用于数据改变 页面即时刷新} props
 * @param {subModule} subModule
 */
export const fetchDoorFobidSchoolSettingList = (schoolId, props, subModule) => {
  const body = {
    page: 1,
    size: 1000,
    id: schoolId
  }
  let resource = DOORFORBID_URL.timeOne
  const cb = json => {
    try {
      let data = json.data.items
      var newItemList = []
      let selectedDays = []
      data.forEach((r, i) => {
        let itemData = r.items
        // let itemDays = []
        var newItemMap = []

        itemData.forEach((subRecord, index) => {
          selectedDays[index] = subRecord.day
          newItemMap.lateTime = subRecord.lateTime
          newItemMap.notReturnTime = subRecord.notReturnTime
        })
        newItemMap.groupNo = r.groupNo

        newItemList[i] = newItemMap
      })

      props.changeDoorForbid(subModule, {
        buildingMap: newItemList
      })
    } catch (e) {
      console.log(e)
    }
  }
  AjaxHandler.ajax(resource, body, cb)
}

/**
 * 校验选中的学校是否可以设置时间段
 * @param {schoolId} schoolId
 * @param {回调 true 请求成功 false 请求失败} callBack
 */
export const checkSchoolTimeRangeExist = (schoolId, callBack) => {
  let resource = DOORFORBID_URL.timeCheck
  const body = {
    id: schoolId
  }
  const cb = json => {
    if (json.data.result) {
      Noti.hintLock('添加出错', '当前学校已有门禁时间端，请勿重复添加')
      callBack(false)
    } else {
      if (callBack) {
        callBack(true)
      }
    }
  }
  AjaxHandler.ajax(resource, body, cb)
}

/**
 * 保存时间段
 * @param {请求的body体} body
 * @param {回调} callBack 返回data.result
 */
export const fetchSaveSchollTimeRange = (body, callBack) => {
  let resource = DOORFORBID_URL.timeSave
  const cb = json => {
    if (callBack) {
      callBack(json.data.result)
    }
  }
  AjaxHandler.ajax(resource, body, cb)
}
