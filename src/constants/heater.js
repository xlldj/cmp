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
  HEATER_UNIT_DEVICE_TYPE: {
    1: '热水机',
    2: '供水',
    3: '补水',
    4: '太阳能'
  },
  WARMER_IN_UNIT: 1, // type value of warmer in unit
  REPLY_IN_UNIT: 2, // 供水
  REPLENISH_IN_UNIT: 3, // 补水
  SOLAR_IN_UNIT: 4, // 太阳能
  HEATER_CONFIG_NEED_DELIVERY: 1, //配置已更改需要下发
  HEATER_CONFIG_DELIVERED: 2, //配置不需要下发
  HEATER_CONFIG_DELIVERY_FAIL: 3, //配置下发失败

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
  UNIT_DEVICE_STATUS: {
    1: true, // 该设备enable
    2: false // disable
  },
  DEVICE_UNIT_DISABLE: 2,
  DEVICE_UNIT_ENABLE: 1,
  PARAMNAMES: {
    1: 'heaterLimitParam',
    2: 'waterFeederLimitParam',
    3: 'waterCompensatorLimitParam',
    4: 'solarEnergyLimitParam'
  },

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
