const CONSTANTS = {
  FILEADDR: 'https://s.xiaolian365.com/',
  FILESERVER: 'https://m.api.xiaolian365.com/file/upload',
  PAGINATION: Math.floor(window.document.body.clientHeight * 0.67 / 50),
  TASKSIZE: 12,
  SELECTWIDTH: 140,
  SHORTSELECTOR: 85,
  CHARTWIDTH: (window.document.body.clientWidth - 100) * 0.9,
  CHARTHEIGHT: 300,

  ERRORALTMESSAGE: '请求出错，请稍后刷新重试',
  NETWORKERRORMESSAGE: '网络出错，请稍后刷新重试',

  ACCOUNTTYPE: { 1: '支付宝', 2: '微信' },
  BUSINESS: { 1: '热水器', 2: '饮水机', 3: '吹风机', 4: '洗衣机' },

  BUILDINGTYPE: { 1: '宿舍楼', 2: '其他' },

  /* DEVICE */
  DEVICETYPE: { 1: '热水器', 2: '饮水机', 3: '吹风机', 4: '洗衣机' },
  DEVICE_TYPE_HEATER: 1,
  DEVICE_TYPE_DRINGKER: 2,
  DEVICE_TYPE_BLOWER: 3,
  DEVICE_TYPE_WASHER: 4,
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
  DEVICEPROTOCOL: { 1: '协议A', 2: '协议B' },

  /* ORDER */
  ORDERSTATUS: { 1: '使用中', 2: '使用结束', 4: '已退单' },
  ORDERUSERTYPES: { 1: '学生', 2: '员工' },

  /* FUND */
  FUNDTYPE: { 2: '提现', 1: '充值' },
  WITHDRAWSTATUS: {
    1: '待审核',
    2: '审核未通过',
    3: '等待到账',
    4: '成功',
    5: '失败',
    6: '已取消'
  },
  WITHDRAWTIME: { 1: '固定时段', 2: '具体时段' },
  DEPOSITACTTYPE: { 1: '充值优惠' },
  PAYMENTTYPE: { 1: '余额支付', 2: '红包支付' },

  /* GIFT */
  GIFTACTTYPE: { 1: '新人有礼', 3: '兑换码', 4: 'H5活动' },
  GIFT_ACT_NEW: 1,
  GIFT_ACT_CODE: 3,
  GIFT_ACT_H5: 4,
  RELEASEMETHOD: { 1: '全部发放', 2: '随机发放' },
  RELEASE_RANDOM: 2,
  BONUSACTTYPE: { 1: '新人有礼', 2: '订单分享', 3: '兑换码' },

  /* LOST */
  LOSTTYPE: { 1: '失物', 2: '招领' },
  DEFRIENDLEVEL: {
    1: '3天',
    2: '7天',
    3: '一个月',
    4: '永久'
  },

  /* USER */
  SEX: { 1: '男', 2: '女' },

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
  },

  /* NOTIFY */
  NOTIFYTYPES: { 1: '紧急公告', 2: '系统公告', 3: '客服消息' },
  NOTIFYSTATUS: {
    1: '已发布',
    2: '已过期',
    3: '等待审核',
    4: '审核未通过'
  },

  WEEKDAYS: { 0: '日', 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六' },

  TIMESPANS: { '1': '本日', '2': '本周', '3': '本月' },

  /* TASK */
  TASK_DETAIL_LIST_LENGTH: 5,
  CREATEWORKTYPE: { 1: '工作记录', 2: '指派任务' },
  COMPLAINTTYPES: {
    1: '热水器',
    2: '饮水机',
    3: '充值',
    4: '提现',
    5: '吹风机',
    6: '洗衣机'
  },
  FEEDBACKTYPES: { 1: '功能异常', 2: '产品建议', 3: '其它' },
  TASKSTATUS: {
    1: '待处理',
    2: '处理中',
    3: '处理中',
    4: '处理中',
    5: '已完结'
  }, // real status: {2: '已指派', 3: '已接受', 4: '已拒绝'}
  TASK_PENDING: 1, // task whose 'status' is 'pending'
  TASK_ASSIGNED: 2,
  TASK_ACCEPTED: 3,
  TASK_REFUSED: 4,
  TASK_FINISHED: 5,
  TASK_CANCELED: 6,

  TASKTYPE: { 1: '报修', 2: '账单投诉', 3: '意见反馈' },
  TASK_TYPE_REPAIR: 1, // type value of 'repair' in task
  TASK_TYPE_COMPLAINT: 2,
  TASK_TYPE_FEEDBACK: 3,
  TASK_BUILD_ENV: { 1: '用户端', 2: 'CMP' },
  TASK_BUILD_USER: 1,
  TASK_BUILD_CMP: 2,
  TASKHANDLE: {
    1: '转接',
    2: '拒绝',
    3: '接受',
    4: '发送消息',
    5: '备注',
    6: '完成',
    7: '创建'
  },
  TASK_HANDLE_REFUSE: 2,
  TASK_HANDLE_REASSIGN: 1,
  TASK_HANDLE_ACCEPT: 3,
  TASK_HANDLE_SENDMESSAGE: 4,
  TASK_HANDLE_REMARK: 5,
  TASK_HANDLE_FINISH: 6,
  TASK_HANDLE_BUILD: 7,
  // constants for task/report
  REPORTCATE: { 1: '工作情况', 2: '投诉分析', 3: '绩效考核' },
  REPORT_CATE_SUM: 1,
  REPORT_CATE_COMPLAINT: 2,
  REPORT_CATE_ASSESS: 3,
  REPORT_ASSESS_TYPE: { 1: '学校', 2: '客服', 3: '维修员' },
  ASSESS_SCHOOL: 1,
  ASSESS_CUSTOM: 2,
  ASSESS_REPAIRMAN: 3,
  // order userd in task/report
  ORDER: { descend: 1, ascend: 2 },
  ORDER_DESCEND: 1,
  ORDER_ASCEND: 2,
  ORDERBYS: {
    csFinished: 3,
    csResponseTime: 5,
    repairFinished: 11,
    ratioInOne: 12,
    repairResponseTime: 13,
    repairTime: 14,
    repairSecondRepair: 15,
    repairRating: 16
  },
  // for heart beat check of online status
  HEARTBEATTIMEOUT: 5 * 60 * 1000,

  CHARTTYPES: {
    1: 'order',
    2: 'user',
    3: 'bonus',
    4: 'funds',
    5: 'repair',
    6: 'repair/time'
  },
  SETTLETYPE: { 1: '消息回复', 2: '电话回复' },
  UPDATETYPE: { 1: '强制升级', 2: '普通升级' },
  VERSIONENV: { 1: '用户端', 2: '管理端' },
  SYSTEMS: { 1: 'iOS', 2: 'Android' },
  VERSIONADDMETHOD: { 1: '地址填入', 2: '安装包上传' },

  RECENTCOUNT: 4,
  NOIMAGE:
    'data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%3F%3E%0A%3Csvg%20width%3D%22153%22%20height%3D%22153%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%0A%20%3Cg%3E%0A%20%20%3Ctitle%3ENo%20image%3C/title%3E%0A%20%20%3Crect%20id%3D%22externRect%22%20height%3D%22150%22%20width%3D%22150%22%20y%3D%221.5%22%20x%3D%221.500024%22%20stroke-width%3D%223%22%20stroke%3D%22%23666666%22%20fill%3D%22%23e1e1e1%22/%3E%0A%20%20%3Ctext%20transform%3D%22matrix%286.66667%2C%200%2C%200%2C%206.66667%2C%20-960.5%2C%20-1099.33%29%22%20xml%3Aspace%3D%22preserve%22%20text-anchor%3D%22middle%22%20font-family%3D%22Fantasy%22%20font-size%3D%2214%22%20id%3D%22questionMark%22%20y%3D%22181.249569%22%20x%3D%22155.549819%22%20stroke-width%3D%220%22%20stroke%3D%22%23666666%22%20fill%3D%22%23000000%22%3E%3F%3C/text%3E%0A%20%3C/g%3E%0A%3C/svg%3E',

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
          path: 'rateLimit',
          name: '扣费速率',
          key: 8
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
      icon: 'file-text',
      children: [
        {
          name: '订单列表',
          path: 'list',
          key: 0
        },
        {
          name: '异常订单',
          path: 'abnormal',
          key: 1
        }
      ]
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
        },
        {
          name: '异常资金',
          path: 'abnormal',
          key: 4
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
          name: '工作报表',
          path: 'report',
          key: 1
        }
      ]
    },
    {
      name: '员工管理',
      path: 'employee',
      key: 8,
      icon: 'solution',
      children: [
        {
          name: '员工列表',
          path: 'list',
          key: 1
        },
        {
          name: '身份设置',
          path: 'role',
          key: 2
        },
        {
          name: '权限设置',
          path: 'authen',
          key: 3
        }
      ]
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
  ],

  forbiddenRootBlock: [
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
          path: 'rateLimit',
          name: '扣费速率',
          key: 8
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
      icon: 'file-text',
      children: [
        {
          name: '订单列表',
          path: 'list',
          key: 0
        },
        {
          name: '异常订单',
          path: 'abnormal',
          key: 1
        }
      ]
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
        },
        {
          name: '异常资金',
          path: 'abnormal',
          key: 4
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
      name: '统计分析',
      path: 'stat',
      key: 9,
      icon: 'line-chart'
    }
  ],
  AuthenOpeType: {
    1: '查看',
    2: '操作'
  },
  ROOTNAME2URL: {
    学校管理: 'school',
    设备管理: 'device',
    订单管理: 'order',
    充值提现: 'fund',
    红包管理: 'gift',
    失物招领: 'lost',
    用户管理: 'user',
    客服工单: 'task',
    员工管理: 'employee',
    统计分析: 'stat',
    公告管理: 'notify',
    版本更新: 'version'
  },
  DESC2STATUS: {
    '添加/编辑报修常见问题': 'EDIT_REPAIR_PROBLEM',
    屏蔽失物招领: 'SHIELD_LOST_INFO',
    拉黑用户: 'DEACTIVE_USER',
    重置用户密码: 'RESET_USER_PWD',
    指派客服任务: 'ASSIGN_CUSTOM_TASK',
    '电话/消息回复': 'REPLY_COMPLAINT',
    删除员工: 'DELETE_EMPLOYEE',
    '发布/编辑紧急公告': 'EDIT_EMERGENCY_NOTIFY',
    '发布/编辑系统公告': 'EDIT_SYSTEM_NOTIFY',
    '发布/编辑客服公告': 'EDIT_CUSTOM_NOTIFY',
    删除公告: 'DELETE_NOTIFY',
    审核: 'CENSOR_NOTIFY',
    '转接/完结/发送客服消息': 'HANDLE_TASK',
    创建工单: 'BUILD_TASK',
    添加标签: 'BUILD_COMPLAINT_TAG'
  },
  PRIVILEGE2URL: {
    '学校列表/搜索/查询': ['/school'],
    楼栋列表: ['/school/list/blockManage'],
    上线设置: ['school/infoSet'],
    '添加/编辑学校信息': ['/school/list/add', '/school/list/edit'],
    '添加/编辑楼栋': [
      'school/list/blockManage/add',
      'school/list/blockManage/edit'
    ],
    功能入口管理: ['school/list/business'],
    '信息总览列表/搜索/查询': ['school/overview'],
    '设备列表/搜索/查询': ['device/list'],
    设备详情: ['device/deviceInfo'],
    '设备配件列表/搜索/查询': ['device/components'],
    '配件类型管理/添加配件/编辑配件': [
      'device/components/componentType',
      'device/components/addComponent',
      'device/components/editComponent'
    ],
    '设备预付列表/搜索/查询': ['device/prepay'],
    '添加/编辑预付选项': [
      'device/prepay/addPrepay',
      'device/prepay/editPrepay'
    ],
    '设备供水时段列表/搜索/查询': ['device/timeset'],
    '添加/编辑供水时段': [
      'device/timeset/addTimeset',
      'device/timeset/editTimeset'
    ],
    '设备供应商列表/搜索/查询': ['device/suppliers'],
    '添加/编辑供应商': ['device/suppliers/addInfo', 'device/suppliers/info'],
    '设备费率列表/搜索/查询': ['device/rateSet'],
    '添加/编辑设备费率': ['device/rateSet/addRate', 'device/rateSet/rateInfo'],
    '扣费速率列表/搜索/查询': ['device/rateLimit'],
    '添加/编辑扣费速率': [
      'device/rateLimit/addRateLimit',
      'device/rateLimit/editRateLimit'
    ],
    '报修列表/搜索/查询': ['device/repair'],
    报修常见问题列表: ['device/repair/repairProblem'],
    维修员评价列表: ['device/repair/repairRate'],
    '报修详情(处理报修任务)': ['device/repair/repairInfo'],
    '设备订单列表/搜索/查询': ['order/list'],
    '订单详情（处理退单）': ['order/list/orderInfo'],
    '异常订单列表/搜索/查询': ['order/abnormal'],
    '异常订单详情（处理退单）': ['order/abnormal/detail'],
    '充值提现列表/搜索/查询': ['fund/list'],
    '充值提现详情（提现审核）': ['fund/list/fundInfo'],
    '提现时间列表/搜索/查询': ['fund/cashtime'],
    '添加/编辑提现时间': [
      'fund/cashtime/addCashtime',
      'fund/cashtime/editCashtime'
    ],
    '充值面额列表/搜索/查询': ['fund/charge'],
    '添加/编辑充值面额': ['fund/charge/addCharge', 'fund/charge/editCharge'],
    '充值活动列表/搜索/查询': ['fund/deposit'],
    '添加/编辑充值活动': [
      'fund/deposit/addDeposit',
      'fund/deposit/depositInfo'
    ],
    '异常充值提现列表/搜索/查询': ['/fund/abnormal'],
    '红包列表/搜索/查询': ['/gift/list'],
    '添加/编辑红包': ['gift/list/addGift', 'gift/list/giftInfo'],
    '红包活动列表/搜索/查询': ['gift/act'],
    '添加/编辑红包活动': ['/gift/act/addAct', 'gift/act/actInfo'],
    '失物招领列表/搜索/查询': ['lost'],
    失物招领详情: ['lost/lostInfo'],
    '用户列表/搜索/查询': ['user'],
    用户详情: ['user/userInfo'],
    '工单列表查询/搜索/详情': ['task/list'],
    '转接/完结/发送客服消息': [],
    // 上下线是通过登录时是否为客服的isCs字段来控制的，不需要另外设置.
    // 工作报表查看 通过子导航就可以控制，不需要另外设置.
    '员工列表搜索/查询': ['employee/list'],
    '添加/编辑员工': ['employee/list/add', 'employee/list/detail'],
    身份列表: ['employee/role'],
    创建身份: ['employee/role/add'],
    统计分析图表: ['stat'],
    '公告列表/搜索/查询': ['notify/list'],
    '公告审核列表/详情': ['notify/censor', 'notify/censor/info'],
    版本更新列表: ['version'],
    '添加/编辑版本更新': ['version/add', 'version/detail']
  }
}

export default CONSTANTS
