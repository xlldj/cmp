const EMPLOYEE = {
  /* EMPLOYEE */
  ROLE: {
    1: '普通用户',
    2: '维修员',
    3: '管理员',
    4: '运营',
    5: '客服',
    6: '研发人员'
  },
  EMPLOYEE_TYPE: { 1: '客服', 2: '维修员', 3: '研发人员' },
  EMPLOYEE_CUSTOMER: 1,
  EMPLOYEE_REPAIRMAN: 2,
  EMPLOYEE_DEVELOPER: 3,
  ROLELOGLIMIT: { 1: 'CMP', 2: '运维端' },
  LOGIN_CMP: 1,
  LOGIN_LIGHT: 2,
  // privileges control for mobile app of employee ('light').
  LIGHTBLOCKS: {
    1: '设备管理',
    2: '报修管理',
    3: '订单管理',
    4: '统计分析',
    5: '充值管理',
    6: '公告管理'
  },
  LIGHT_DEVICE: 1,
  LIGHT_REPAIR: 2,
  LIGHT_ORDER: 3,
  LIGHT_STAT: 4,
  LIGHT_FUND: 5,
  LIGHT_NOTIFY: 6,
  ONLINE_STATUS: {
    1: '在线',
    2: '离线'
  }
}
export default EMPLOYEE
