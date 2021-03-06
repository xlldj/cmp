const TASK = {
  TASK_LIST_TAB_PENDING: 1,
  TASK_LIST_TAB_HANDLING: 2,
  TASK_LIST_TAB_FINISHED: 3,
  TIMELABEL: {
    1: '等待时间',
    2: '等待时间',
    3: '完结时间'
  },
  TIMERANGESELECTS: {
    1: {
      1: '今日',
      3: '近7天',
      6: '超过1天',
      7: '超过2天',
      8: '超过5天'
    },
    2: {
      1: '今日',
      3: '近7天',
      6: '超过1天',
      7: '超过2天',
      8: '超过5天'
    },
    3: {
      1: '今日',
      2: '近3天',
      3: '近7天',
      4: '近14天',
      5: '近30天'
    }
  },
  TASKTYPES: {
    1: '报修',
    2: '账单投诉',
    3: '意见反馈',
    4: '消费预警'
  },
  TAB_TO_REDUX_NAME: {
    1: 'pendingList',
    2: 'handlingList',
    3: 'finishedList'
  },
  /* TASK */
  TASK_LIST_PAGE_TABS: [
    {
      value: 1,
      text: '待处理'
    },
    {
      value: 2,
      text: '处理中'
    },
    {
      value: 3,
      text: '已完结'
    }
  ],
  TASK_DETAIL_LIST_LENGTH: 5,
  CREATEWORKTYPE: { 1: '工作记录', 2: '指派任务' },
  COMPLAINTTYPES: {
    1: '热水器',
    2: '饮水机',
    3: '充值',
    4: '提现',
    5: '吹风机',
    6: '洗衣机'
  },
  FEEDBACKTYPES: { 1: '功能异常', 2: '产品建议', 3: '其它' },
  TASKSTATUS: {
    1: '待处理',
    2: '处理中',
    3: '处理中',
    4: '处理中',
    5: '已完结'
  }, // real status: {2: '已指派', 3: '已接受', 4: '已拒绝'}
  TASK_PENDING: 1, // task whose 'status' is 'pending'
  TASK_ASSIGNED: 2,
  TASK_ACCEPTED: 3,
  TASK_REFUSED: 4,
  TASK_FINISHED: 5,
  TASK_CANCELED: 6,

  TASKTYPE: { 1: '报修', 2: '账单投诉', 3: '意见反馈', 4: '消费预警' },
  TASK_TYPE_REPAIR: 1, // type value of 'repair' in task
  TASK_TYPE_COMPLAINT: 2,
  TASK_TYPE_FEEDBACK: 3,
  TASK_BUILD_ENV: { 1: '用户端', 2: 'CMP' },
  TASK_BUILD_USER: 1,
  TASK_BUILD_CMP: 2,
  TASKHANDLE: {
    1: '转接',
    2: '拒绝',
    3: '接受',
    4: '发送消息',
    5: '备注',
    6: '完成',
    7: '创建'
  },
  TASK_HANDLE_REFUSE: 2,
  TASK_HANDLE_REASSIGN: 1,
  TASK_HANDLE_ACCEPT: 3,
  TASK_HANDLE_SENDMESSAGE: 4,
  TASK_HANDLE_REMARK: 5,
  TASK_HANDLE_FINISH: 6,
  TASK_HANDLE_BUILD: 7,
  TASK_HANDLE_RELATE: 8,
  TASK_HANDLE_CANCELRELATE: 9,
  TASK_HANDLE_AUTOMATIC: 10,
  TASK_HANDLE_CSREMIND: 11,
  TASK_HANDLE_SETTARGET: 12,
  TASK_HANDLE_REPAIRPART: 13,
  TASK_HANDLE_CHANGETASK: 14,
  TASK_HANDLE_CHOOSEROOM: 15,
  // constants for task/report
  REPORTCATE: { 1: '工作情况', 2: '投诉分析', 3: '绩效考核' },
  REPORT_CATE_SUM: 1,
  REPORT_CATE_COMPLAINT: 2,
  REPORT_CATE_ASSESS: 3,
  REPORT_ASSESS_TYPE: { 1: '学校', 2: '客服', 3: '维修员' },
  ASSESS_SCHOOL: 1,
  ASSESS_CUSTOM: 2,
  ASSESS_REPAIRMAN: 3,
  TASK_REPORT_PAGE_TABS: [
    {
      value: 0,
      text: '工作情况'
    },
    {
      value: 1,
      text: '投诉分析'
    },
    {
      value: 2,
      text: '绩效考核'
    }
  ],

  // order userd in task/report
  ORDER_DESCEND: 1,
  ORDER_ASCEND: 2,
  ORDERBYS: {
    csFinished: 3,
    csResponseTime: 5,
    repairFinished: 11,
    ratioInOne: 12,
    repairResponseTime: 13,
    repairTime: 14,
    repairSecondRepair: 15,
    repairRating: 16
  },
  // for heart beat check of online status
  HEARTBEATTIMEOUT: 4 * 60 * 1000,
  // for day control
  NORMAL_DAY_UNLIMITED: 0,
  NORMAL_DAY_TODAY: 1,
  NORMAL_DAY_3: 2,
  NORMAL_DAY_7: 3,
  NORMAL_DAY_14: 4,
  NORMAL_DAY_30: 5,
  NORMAL_DAY_BEYOND_1: 6,
  NORMAL_DAY_BEYOND_2: 7,
  NORMAL_DAY_BEYOND_5: 8,

  // 重写taskdetail
  DETAILTAB2NAME: {
    1: 'committer',
    2: 'committerOrder',
    3: 'committerRepair',
    4: 'deviceInfo',
    5: 'deviceOrder',
    6: 'deviceRepair',
    7: 'userFundRecord',
    8: 'userComplaints',
    9: 'userFeedbacks'
  },
  TABINDEX2RES: {
    1: '/user/one',
    2: '/order/list',
    3: '/work/order/list',
    4: '/device/one',
    5: '/order/list',
    6: '/work/order/list',
    7: '/funds/list',
    8: '/work/order/list',
    9: '/work/order/list'
  },
  DETAILTAB2JSONNAME: {
    2: 'orders',
    3: 'workOrders',
    5: 'orders',
    6: 'workOrders',
    7: 'funds',
    8: 'workOrders',
    9: 'workOrders'
  },

  TAB2HINT: {
    2: '用户近五笔订单',
    3: '用户近五次报修记录',
    5: '设备近五笔订单',
    6: '设备近五次维修记录',
    7: '用户近五次充值提现',
    8: '用户近五次投诉',
    9: '用户近五次反馈'
  },

  roleModalName: {
    1: 'showCustomerModal',
    2: 'showRepairmanModal',
    3: 'showDeveloperModal'
  },

  QUICK_MSG_TABS: [
    {
      value: 1,
      text: '快捷消息列表'
    },
    {
      value: 2,
      text: '消息类型列表'
    }
  ],
  QUICK_MSG_LIST_TAB: {
    value: 1,
    text: '快捷消息列表'
  },
  QUICK_MSG_TYPE_TAB: {
    value: 2,
    text: '消息类型列表'
  },
  QUICK_MSG_TAB_LIST: 1,
  QUICK_MSG_TAB_TYPE: 2,
  QUICK_MSGLIST_TYPE: {
    1: '水温不热',
    2: '功能建议',
    3: '设备连接异常'
  }
}
export default TASK
