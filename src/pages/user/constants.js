const USER = {
  /* USER */
  SEX: { 1: '男', 2: '女' },
  USERORIGIN: { 1: '校ok迁移用户', 2: '导入用户' },
  Fushikang_Import_Methods: {
    1: '批量导入',
    2: '手动导入'
  },
  Import_Method_Batch: 1,
  Import_Method_Manual: 2,

  USER_LIST_PAGE_TABS: [
    {
      value: 1,
      text: '用户列表'
    },
    {
      value: 2,
      text: '用户消费分析'
    }
  ],
  USER_LIST_TAB_TABLE: 1,
  USER_LIST_TAB_ANALYZE: 2,
  USER_ANALYZE_DAY_SELECT: [
    { key: 1, value: '今日' },
    { key: 9, value: '昨天' },
    { key: 3, value: '近7日' },
    { key: 5, value: '近30日' }
  ]
}
export default USER
