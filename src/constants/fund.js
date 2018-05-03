const FUND = {
  /* FUND */
  FUNDTYPE: { 2: '提现', 1: '充值' },
  CASHTYPE: { WITHDRAW: 2, RECHARGE: 1 },
  WITHDRAWSTATUS: {
    1: '待审核',
    2: '审核未通过',
    3: '等待到账',
    4: '成功',
    5: '失败',
    6: '已取消'
  },
  WITHDRAWTIME: { 1: '固定时段', 2: '具体时段' },
  // DEPOSITACTTYPE: { 1: '充值优惠', 2: '赠送红包' },
  DEPOSITACTTYPE: { 2: '赠送红包' },
  PAYMENTTYPE: { 1: '余额支付', 2: '红包支付' },
  FREEGIVING_PERIOD: { 1: '每月', 2: '每日' },
  FREEGIVING_PERIOD_DAY: 2,
  FREEGIVING_PERIOD_MONTH: 1,
  FREEGIVING_STATUS: {
    1: '是',
    2: '否'
  },
  FREEGIVING_ONLINE: 1,
  FREEGIVING_OFFLINE: 2,
  FREEGIVING_TARGETS: { 1: '所有用户', 2: '已认证用户' }
}

export default FUND
