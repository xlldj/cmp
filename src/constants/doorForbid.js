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
  DOORFORBID_PAGE_TAB_RECORD: 1,
  DOORFORBID_PAGE_TAB_REPORT: 2,
  DOORFORBID_PAGE_TAB_TIME: 3,

  DOORFORBID_URL: {
    recordList: '/api/gate/record/list',
    recordHandle: 'api/gate/record/handle',
    recordOne: 'api/gate/record/one',
    reportList: '/api/gate/report/list',
    timeAdd: '/api/gate/time/add',
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
    1: '近7天',
    2: '近30天'
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
    2: '已归寝',
    3: '晚归寝',
    4: '未归寝'
  },

  DOORFORBID_WEEK: {
    周一: 1,
    周二: 2,
    周三: 3,
    周四: 4,
    周五: 5,
    周六: 6,
    周日: 7,
    1: '周一',
    2: '周二',
    3: '周三',
    4: '周四',
    5: '周五',
    6: '周六',
    7: '周日'
  }
}

export default DOORFORBID
