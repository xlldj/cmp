const CONSTANTS = {
  FILEADDR: 'https://s.xiaolian365.com/',
  FILESERVER: 'https://m.api.xiaolian365.com/file/upload',
  PAGINATION: Math.floor((window.document.body.clientHeight * 0.67) / 50),
  TASKSIZE: 12,
  SELECTWIDTH: 140,
  SHORTSELECTOR: 85,
  CHARTWIDTH: (window.document.body.clientWidth - 100) * 0.9,
  CHARTHEIGHT: 300,

  ACCOUNTTYPE: {1: '支付宝', 2: '微信'},
  BUSINESS: {1: '热水器', 2: '饮水机'},

  BUILDINGTYPE: {1: '宿舍楼', 2: '其他'},

  DEVICETYPE: {1: '热水器', 2: '饮水机'},
  WATERTYPE: {1: '热水', 2: '冷水', 3: '冰水'},
  DEVICESTATUS: {1: '正常', 2: '报修'},
  REPAIRSTATUS: {1: '待审核', 2: '待指派', 3: '已指派', 4: '正在维修', 5: '审核未通过', 6: '已拒绝', 7: '已完成'},
  PRIORITY: {1: '正常处理', 2: '优先处理', 3: '紧急处理'},
  REPAIRSTATUSFORSHOW: {1: '待审核', 2: '待指派', 3: '已指派', 4: '正在维修', 5: '审核未通过', 6: '已指派被拒绝', 7: '已完成'},
  WATERUNIT: {1: '吨', 2: '升', 3: '毫升'},
  BILLINGOPTIONS: {1: '流量计费'},
  DEVICEPROTOCOL: {1: '协议A', 2: '协议B'},

  FUNDTYPE: {2: '提现', 1: '充值'},
  WITHDRAWSTATUS: {1: '待审核', 2: '审核未通过', 3: '等待到账', 4: '成功', 5: '失败', 6: '已取消'},
  WITHDRAWTIME: {1: '固定时段', 2: '具体时段'},
  DEPOSITACTTYPE: {1: '充值优惠', 2: '赠送红包'},
  PAYMENTTYPE: {1: '余额支付', 2: '红包支付'},

  GIFTACTTYPE: {1: '新人有礼', 3: '兑换码'},
  RELEASEMETHOD: {1: '全部发放', 2: '随机发放'},
  BONUSACTTYPE: {1: '新人有礼', 2: '订单分享', 3: '兑换码'},

  LOSTTYPE: {1: '失物', 2: '招领'},
  DEFRIENDLEVEL: {
    1: '3天',
    2: '7天',
    3: '一个月',
    4: '永久'
  },

  ROLE: {1: '普通用户', 2: '维修员', 3: '管理员', 4: '运营', 5: '客服', 6: '研发人员'},

  NOTIFYTYPES: {1: '紧急公告', 2: '系统公告', 3: '客服消息'},
  NOTIFYSTATUS: {
    1: '已发布',
    2: '已过期',
    3: '等待审核',
    4: '审核未通过'},

  WEEKDAYS: {0: '日', 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六'},

  TIMESPANS: {'1': '本日', '2': '本周', '3': '本月'},

  CREATEWORKTYPE: {1: '工作记录', 2: '指派任务'},
  COMPLAINTTYPES: {1: '热水器', 2: '饮水机', 3: '充值', 4: '提现'},
  FEEDBACKTYPES: {1: '功能异常', 2: '产品建议', 3: '其它'},

  CHARTTYPES: {1: 'order', 2: 'user', 3: 'bonus', 4: 'funds', 5: 'repair', 6: 'repair/time'},
  SETTLETYPE: {1: '消息回复', 2: '电话回复'},
  UPDATETYPE: {1: '强制升级', 2: '普通升级'},
  SYSTEMS: {1: 'iOS', 2: 'Android'},
  VERSIONADDMETHOD: {1: '地址填入', 2: '安装包上传'},

  RECENTCOUNT: 4,
  NOIMAGE: 'data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%3F%3E%0A%3Csvg%20width%3D%22153%22%20height%3D%22153%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%0A%20%3Cg%3E%0A%20%20%3Ctitle%3ENo%20image%3C/title%3E%0A%20%20%3Crect%20id%3D%22externRect%22%20height%3D%22150%22%20width%3D%22150%22%20y%3D%221.5%22%20x%3D%221.500024%22%20stroke-width%3D%223%22%20stroke%3D%22%23666666%22%20fill%3D%22%23e1e1e1%22/%3E%0A%20%20%3Ctext%20transform%3D%22matrix%286.66667%2C%200%2C%200%2C%206.66667%2C%20-960.5%2C%20-1099.33%29%22%20xml%3Aspace%3D%22preserve%22%20text-anchor%3D%22middle%22%20font-family%3D%22Fantasy%22%20font-size%3D%2214%22%20id%3D%22questionMark%22%20y%3D%22181.249569%22%20x%3D%22155.549819%22%20stroke-width%3D%220%22%20stroke%3D%22%23666666%22%20fill%3D%22%23000000%22%3E%3F%3C/text%3E%0A%20%3C/g%3E%0A%3C/svg%3E',

  rootBlock: [
    {
      name: '学校管理',
      path: 'school',
      key: 0,
      icon: 'home',
      children: [
        {
          path: 'list',
          name: '学校列表',
          key: 0
        },
        {
          path: 'overview',
          name: '信息总览',
          key: 1
        }
      ]
    },
    {
      name: '设备管理',
      path: 'device',
      key: 1,
      icon: 'database',
      children: [
        {
          path: 'list',
          name: '设备列表',
          key: 0
        },
        {
          path: 'components',
          name: '设备配件',
          key: 1
        },
        {
          path: 'prepay',
          name: '设备预付',
          key: 3
        },
        {
          path: 'timeset',
          name: '供水时段',
          key: 4
        },
        {
          path: 'suppliers',
          name: '供应商',
          key: 5
        },
        {
          path: 'rateSet',
          name: '费率设置',
          key: 6
        },
        {
          path: 'repair',
          name: '报修管理',
          key: 7
        }
      ]
    },
    {
      name: '订单管理',
      path: 'order',
      key: 2,
      icon: 'file-text'
    },
    {
      name: '充值提现',
      path: 'fund',
      key: 3,
      icon: 'pay-circle-o',
      children: [
        {
          name: '资金列表',
          path: 'list',
          key: 0
        },
        {
          name: '提现时间',
          path: 'cashtime',
          key: 1
        },
        {
          name: '充值面额',
          path: 'charge',
          key: 2
        },
        {
          name: '充值活动',
          path: 'deposit',
          key: 3
        }
      ]
    },
    {
      name: '红包管理',
      path: 'gift',
      key: 4,
      icon: 'red-envelope',
      children: [
        {
          name: '红包列表',
          path: 'list',
          key: 0
        },
        {
          name: '红包活动',
          path: 'act',
          key: 1
        }
      ]
    },
    {
      name: '失物招领',
      path: 'lost',
      key: 5,
      icon: 'switcher'
    },
    {
      name: '用户管理',
      path: 'user',
      key: 6,
      icon: 'team'
    },
    {
      name: '客服工单',
      path: 'task',
      key: 7,
      icon: 'customer-service',
      children: [
        {
          name: '工单列表',
          path: 'list',
          key: 0
        },
        {
          name: '工作记录',
          path: 'log',
          key: 1
        },
        {
          name: '异常订单',
          path: 'abnormal',
          key: 2
        },
        {
          name: '账单投诉',
          path: 'complaint',
          key: 3
        },
        {
          name: '意见反馈',
          path: 'feedback',
          key: 4
        }
      ]
    },
    {
      name: '员工管理',
      path: 'employee',
      key: 8,
      icon: 'solution'
    },
    {
      name: '统计分析',
      path: 'stat',
      key: 9,
      icon: 'line-chart'
    },
    {
      name: '公告管理',
      path: 'notify',
      key: 10,
      icon: 'sound',
      children: [
        {
          name: '公告列表',
          path: 'list',
          key: 0
        },
        {
          name: '公告审核',
          path: 'censor',
          key: 1
        }
      ]
    },
    {
      name: '版本更新',
      path: 'version',
      key: 11,
      icon: 'down-square-o'
    }
  ]
}

export default CONSTANTS
