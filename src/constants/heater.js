const HEATER = {
  HEATER_LIST_PAGE_TABS: [
    {
      value: 1,
      text: '待审核机组'
    },
    {
      value: 2,
      text: '已注册机组'
    }
  ],
  HEATER_LIST_TAB_UNREGISTERD: 1,
  HEATER_LIST_TAB_REGISTERD: 2,
  HEATER_STATUS_UNREGISTERD: 1,
  HEATER_STATUS_REGISTERD: 2,
  EFFECTIVE: {
    1: true,
    2: false
  },
  EFFECTIVE_YES: 1,
  EFFECTIVE_NO: 2,

  /* heater status page */
  HEATER_STATUS_TAB_LIVE: 1,
  HEATER_STATUS_TAB_CONFIG: 2,
  HEATER_STATUS_PAGE_TABS: [
    {
      value: 1,
      text: '实时'
    },
    {
      value: 2,
      text: '设置'
    }
  ],
  HINT_PIPE_INVERSE: 1,
  HINT_PIPE_SUPPLY: 2,
  HINT_PIPE_BACKUP: 3,

  AREADATAS: [
    {
      key: 1,
      alt: 'waterBackup',
      shape: 'rect',
      trail: '0,200,166,214'
    },
    {
      key: 2,
      alt: 'waterSupply',
      shape: 'rect',
      trail: '0,240,176,254'
    }
  ]
}
export default HEATER
