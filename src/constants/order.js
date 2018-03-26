const ORDER = {
  /* ORDER */
  ORDERSTATUS: { 1: '使用中', 2: '使用结束', 4: '已退单' },
  ORDERUSERTYPES: { 1: '学生', 2: '员工' },
  ORDER_LIST_PAGE_TABS: [
    {
      value: 1,
      text: '订单列表'
    },
    {
      value: 2,
      text: '消费统计'
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
  ORDER_STAT_DAY_UNLIMITED: 6,
  ORDER_LIST_TABLE: 1,
  X_AXIS_NAME: {
    1: '0~0.5元',
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
  TOTAL_CONSUME: 5
}
export default ORDER
