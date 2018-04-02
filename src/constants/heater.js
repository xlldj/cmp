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
  HEATER_STATUS: {
    E: '无',
    '0': '关机',
    '1': '待机',
    '2': '加热',
    '3': '化霜'
  },
  SWITCH_ENUM: {
    '1': '开启',
    '0': '关闭',
    E: '无'
  },
  HINT_PIPE_BACKUP: 1, // 补水
  HINT_PIPE_SUPPLY: 2, // 供水
  HINT_PIPE_INVERSE: 3, // 回水
  HINT_WARMER: 4, // 加热器
  HINT_TANK: 99, // 水箱
  HINT_COMMON: 100, // 机组通用信息，总是展示
  STATE_NAMES: {
    1: 'replenishWaterStatuses',
    2: 'supplyWaterStatuses',
    3: 'backWaterStatuses',
    4: 'heaterStatuses',
    99: 'waterTankStatuses'
  },
  Hint_Wrapper_Class_Name: {
    1: 'waterpipeHintWrapper',
    2: 'waterpipeHintWrapper',
    3: 'waterpipeHintWrapper',
    4: 'warmerHintWrapper',
    99: 'tankHintWrapper'
  },
  Hint_Class_Name: {
    1: 'waterpipeHint',
    2: 'waterpipeHint',
    3: 'waterpipeHint',
    4: 'warmerHint',
    99: 'tankHint',
    100: 'commonHint'
  },
  Hint_Colors: {
    1: '#85c4ff',
    2: '#83d898',
    3: '#ffcc00',
    4: '#85c4ff',
    99: '#a2aab1',
    100: '#a2aab1'
  },
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
    },
    {
      key: 3,
      alt: 'waterInverse',
      shape: 'rect',
      trail: '0,260,176,284'
    }
  ]
}
export default HEATER
