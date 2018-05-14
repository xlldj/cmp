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
  FUND_MISTAKE_TYPE: { 1: '订单不一致', 2: '状态不一致', 3: '金额不一致' },
  FUND_MISTAKE_STATUS: { 1: '未处理', 2: '已处理' },
  FUND_MISTAKE_METHOD: { 1: '自动处理', 2: '人工处理' },
  FUND_CHECK_STATUS_HANDLING: 1,
  FUND_CHECK_METHOD_MANUAL: 2
}

export default FUND
