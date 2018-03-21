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
  ORDER_DAY_SELECT: {
    // for order table
    1: '今日',
    2: '近7日',
    3: '近30日'
  },
  ORDER_STAT_DAY_SELECT: {
    // for order stat
    1: '今日',
    2: '近7日',
    3: '近30日'
  },
  ORDER_LIST_TABLE: 1
}
export default ORDER
