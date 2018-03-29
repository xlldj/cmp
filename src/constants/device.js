const DEVICE = {
  /* DEVICE */
  DEVICETYPE: { 1: '热水器', 2: '饮水机', 3: '吹风机', 4: '洗衣机' },
  DEVICE_TYPE_HEATER: 1,
  DEVICE_TYPE_DRINGKER: 2,
  DEVICE_TYPE_BLOWER: 3,
  DEVICE_TYPE_WASHER: 4,
  DEVICE_TYPE_ENTRANCE: 5,
  WATERTYPE: { 1: '热水', 2: '冷水', 3: '冰水' },
  WASHER_RATE_TYPES: {
    1: '单脱水',
    2: '一洗一漂一脱水',
    3: '两洗一漂一脱水',
    4: '两洗两漂一脱水'
  },
  DEVICESTATUS: { 1: '正常', 2: '报修' },
  // REPAIRSTATUS: {1: '待审核', 2: '待指派', 3: '已指派', 4: '正在维修', 5: '审核未通过', 6: '已拒绝', 7: '已完成', 8: '已取消'},
  REPAIRSTATUS: { 1: '待处理', 2: '处理中', 3: '已完结' },
  REPAIRSTATUS2TRUESTATUS: { 1: [1], 2: [2, 3, 4], 3: [5] }, // true status for task/repair, note to keep same with task/status below
  PRIORITY: { 1: '正常处理', 2: '优先处理', 3: '紧急处理' },
  PRIORITY_NORMAL: 1,
  PRIORITY_PRIOR: 2,
  PRIORITY_URGENT: 3,
  REPAIRSTATUSFORSHOW: {
    1: '待审核',
    2: '待指派',
    3: '已指派',
    4: '正在维修',
    5: '审核未通过',
    6: '已指派被拒绝',
    7: '已完成',
    8: '已取消'
  },
  WATERUNIT: { 1: '吨', 2: '升', 3: '毫升' },
  HEATER_BILLING_OPTIONS: { 1: '流量计费' },
  DRINKER_BILLING_OPTIONS: { 1: '流量计费' },
  BLOWER_BILLING_OPTIONS: { 2: '时间计费' },
  WASHER_BILLING_OPTIONS: { 3: '固定计费' },
  BILLINGOPTIONS: { 1: '流量计费', 2: '时间计费', 3: '固定计费' },
  DEVICEPROTOCOL: { 1: '协议A', 2: '协议B' }
}
export default DEVICE
