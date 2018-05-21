const FUND = {
  /* FUND */
  FUNDTYPE: { 2: '提现', 1: '充值' },
  WIDTHDRAW_TYPE: 2,
  TOP_UP_TYPE: 1,
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
  FUND_CHECK_METHOD_MANUAL: 2,
  FUND_CHECK_MISTAKE_TYPES: {
    1: '订单不一致',
    2: '状态不一致',
    3: '金额不一致'
  },
  FUND_CHECK_MISTAKE_TYPE_ORDER: 1,
  REMOTE_ORDER_STATUS_SUCCESS: 4, // 第三方平台订单状态支付成功
  FUND_CHECK_MISTAKES: {
    1: '本地有账单，第三方支付无账单',
    2: '本地无账单，第三方支付有账单',
    3: '本地支付成功，第三方支付失败',
    4: '本地支付失败，第三方支付成功',
    5: '本地账单金额比第三方账单金额多',
    6: '本地账单金额比第三方账单金额少'
  },
  FUND_CHECK_REASON_NOREMOTE: 1,
  FUND_CHECK_REASON_NOLOCAL: 2,
  FUND_CHECK_NOLOCAL_HANDLE_TEXT: '此账单系统无法平账，请前往第三方平台处理'
}

export default FUND
