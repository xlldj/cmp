const SCHOOL = {
  ACCOUNTTYPE: { 1: '支付宝', 2: '微信' },
  BUSINESS: { 1: '热水器', 2: '饮水机', 3: '吹风机', 4: '洗衣机', 101: '门禁' },
  BUSI_TYPE_ENTRANCE: 101,
  BUILDINGTYPE: { 1: '宿舍楼', 2: '其他' },
  TEST_SCHOOL: 2,
  REAL_SCHOOL: 1,
  COMPANY_SCHOOL: 3,
  SCHOOL_TYPES: {
    1: '真实学校',
    2: '测试学校',
    3: '工厂'
  },
  WXCERTSIZE: 65534, // cert file should not exceed 64k bytes.
  ACCOUNT_ENVS: [
    {
      label: '笑联用户端',
      value: 1
    },
    {
      label: '笑联运维端',
      value: 4
    }
  ],
  ACCOUNT_ENV_ALI_USER: 1,
  ACCOUNT_ENV_ALI_YUNWEI: 4
}

export default SCHOOL
