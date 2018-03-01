const TASK = {
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
  HEARTBEATTIMEOUT: 4 * 60 * 1000
}
export default TASK