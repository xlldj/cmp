const USER = {
  /* USER */
  SEX: { 1: '男', 2: '女' },
  USERORIGIN: { 1: '校ok迁移用户' },
  Fushikang_Import_Methods: {
    1: '批量导入',
    2: '手动导入'
  },
  Import_Method_Batch: 1,
  Import_Method_Manual: 2,

  USER_LIST_PAGE_TABS_WITHOUT_FOX: [
    {
      value: 1,
      text: '用户列表'
    },
    {
      value: 3,
      text: '用户消费分析'
    }
  ],
  USER_LIST_PAGE_TABS_WITH_FOX: [
    {
      value: 1,
      text: '用户列表'
    },
    {
      value: 2,
      text: '富士康员工信息'
    },
    {
      value: 3,
      text: '用户消费分析'
    }
  ],
  USER_LIST_TAB_TABLE: 1,
  USER_LSIT_TAB_FOXCONN: 2,
  USER_LIST_TAB_ANALYZE: 3,
  USER_ANALYZE_DAY_SELECT: [
    { key: 1, value: '今日' },
    { key: 9, value: '昨天' },
    { key: 3, value: '近7日' },
    { key: 5, value: '近30日' }
  ],

  COMPANY_USER_AHTH_PENDING: 1, // 工厂用户，未绑定。(如富士康)
  COMPANY_USER_AUTHED: 2, // 工厂用户，已绑定。(如富士康)
  COMPANY_USER_AUTH_STATUS: { 1: '未绑定', 2: '已绑定' }
}
export default USER
