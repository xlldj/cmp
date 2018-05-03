const ORDER = {
  /* ORDER */
  ORDERSTATUS: { 1: '使用中', 2: '使用结束', 4: '已退单' },
  ORDERUSERTYPES: { 1: '学生', 2: '员工' },
  ORDER_USER_TYPE_STUDENT: 1,
  /*
  ORDER_LIST_PAGE_TABS: [
    {
      value: 1,
      text: '订单列表'
    },
    {
      value: 2,
      text: '消费统计'
    },
    {
      value: 3,
      text: '设备消费分析'
    }
  ],
  */
  ORDER_LIST_PAGE_TABS: [
    {
      value: 1,
      text: '订单列表'
    },
    {
      value: 2,
      text: '消费统计'
    },
    {
      value: 3,
      text: '消费预警'
    }
  ],
  ORDER_WARN_PAGE_TABS: [
    {
      value: 1,
      text: '预警列表'
    },
    {
      value: 2,
      text: '预警设置'
    }
  ],
  // 'ORDER_DAY_SELECT' is same to normal day enums, like in task.
  ORDER_DAY_SELECT: {
    // for order table
    1: '今日',
    3: '近7日',
    5: '近30日'
  },
  // 'ORDER_STAT_DAY_SELECT' is different from normal day enums
  ORDER_STAT_DAY_SELECT: {
    // for order stat
    3: '今日',
    4: '近7日',
    5: '近30日'
  },
  // this day select is from normal day setting, different from upper 'ORDER_STAT_DAY_SELECT'
  ORDER_ANALYZE_DAY_SELECT: {
    // for order stat
    1: '今日',
    9: '昨天',
    3: '近7日',
    5: '近30日'
  },
  ORDER_ANALYZE_ORDERBYS: {
    consumption: 1,
    waterUsage: 2
  },
  ORDER_ANALYZE_DAY_SELECT_ARR: [
    { key: 1, value: '今日' },
    { key: 9, value: '昨天' },
    { key: 3, value: '近7日' },
    { key: 5, value: '近30日' }
  ],
  ORDER_STAT_DAY_UNLIMITED: 6,
  ORDER_WARN_TABS: {
    WARNTABLE: 1,
    WARNSET: 2
  },
  ORDER_LIST_TABLE: 1,
  ORDER_LIST_STAT: 2,
  ORDER_LIST_ANALYZE: 3,
  X_AXIS_NAME: {
    0: '0元',
    1: '<0.5元',
    2: '0.5~1元',
    3: '1~1.5元',
    4: '1.5~2元',
    5: '2~3元',
    6: '3~5元',
    7: '5元以上'
  },
  // for order stat x axis ranges
  ZERO_ZEROPOINTFIVE: 1,
  ZEROPOINTFIVE_ONE: 2,
  ONE_ONEPOINTFIVE: 3,
  ONEPOINTFIVE_TWO: 4,
  TWO_THREE: 5,
  THREE_FIVE: 6,
  MORE_THAN_FIVE: 7,
  // for set orderBy of orderStat module.
  USER_COUNT: 1,
  USER_AVERAGE: 2,
  ORDER_COUNT: 3,
  ORDER_AVERAGE: 4,
  TOTAL_CONSUME: 5,
  ORDER_STAT_ORDERBYS: {
    userCount: 1,
    userAverage: 2,
    orderCount: 3,
    orderAverage: 4,
    totalIncome: 5
  },

  // for order analyze
  DEVICE_WARN_TASK_STATUS_ENUM: {
    1: '没有工单',
    2: '已存在工单'
  },
  ROOMTYPES: {
    1: '正常房间',
    2: '空房间'
  },
  THRESHOLD_TYPE_ENUMS: {
    1: '以上',
    2: '以下'
  },
  DEVICE_WARN_TASK_HANDLING: 2 // 当前设备有订单预警工单处理中
}
export default ORDER
