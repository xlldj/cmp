const DOORFORBID = {
  DOORFORBID_PAGE_TABS: [
    {
      value: 1,
      text: '归寝记录'
    },
    {
      value: 2,
      text: '归寝报表'
    },
    {
      value: 3,
      text: '归寝时间设置'
    }
  ],
  DOORFORBID_RECORD_TAB: {
    value: 1,
    text: '归寝记录'
  },
  DOORFORBID_REPORT_TAB: {
    value: 2,
    text: '归寝报表'
  },
  DOORFORBID_TIMESETTING_TAB: {
    value: 3,
    text: '归寝时间设置'
  },
  DOORFORBID_PAGE_TAB_RECORD: 1,
  DOORFORBID_PAGE_TAB_REPORT: 2,
  DOORFORBID_PAGE_TAB_TIME: 3,

  DOORFORBID_URL: {
    recordList: '/api/gate/record/list',
    recordHandle: '/api/gate/handle',
    recordUserList: '/api/gate/record/user/list',
    reportList: '/api/gate/report/list',
    reportUserList: '/api/gate/report/user/list',
    unbind: '/api/gate/unbind',
    timeSave: '/api/gate/time/save',
    timeCheck: '/api/gate/time/check',
    timeDelete: '/api/gate/time/delete',
    timeList: '/api/gate/time/list',
    timeOne: '/api/gate/time/one',
    timeUpdate: '/api/gate/time/update'
  },
  DOORFORBID_NAV_TITLE: {
    1: '归寝记录',
    2: '归寝报表',
    3: '归寝时间设置'
  },
  DOORFORBID_RECORD_TIME: {
    1: '不限',
    2: '今天',
    3: '昨天',
    4: '近7天',
    5: '近30天'
  },

  DOORFORBID_REPORT_TIME: {
    1: '昨天',
    2: '近7天',
    3: '近30天'
  },
  DOORFORBID_SEX: {
    1: '不限',
    2: '男生',
    3: '女生'
  },
  DOORFORBID_FORM: {
    1: '打卡记录',
    2: '归寝报表'
  },
  DOORFORBID_RECORD_BACKDORM_STATUS: {
    1: '不限',
    2: '归寝',
    3: '出寝'
  },

  DOORFORBID_WEEK: {
    1: '周一',
    2: '周二',
    3: '周三',
    4: '周四',
    5: '周五',
    6: '周六',
    7: '周日',
    周一: 1,
    周二: 2,
    周三: 3,
    周四: 4,
    周五: 5,
    周六: 6,
    周日: 7
  },

  DOORFORBID_ORDER: {
    ascend: 1,
    descend: 2
  },
  DOORFORBID_DAYTYPE: {
    1: 0,
    2: 1,
    3: 9,
    4: 3,
    5: 5
  },
  DOORFORBID_REPORT_DAYTYPE: {
    1: 9,
    2: 3,
    3: 5
  }
}

export default DOORFORBID
