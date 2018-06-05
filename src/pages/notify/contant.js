const NOTIFY = {
  /* NOTIFY */
  NOTIFYTYPES: { 1: '紧急公告', 2: '系统公告', 3: '客服消息' },
  NOTIFYSTATUS: {
    1: '已发布',
    2: '已过期',
    3: '等待审核',
    4: '审核未通过'
  },
  NOTIFY_STATUS_RELEASED: 1,
  NOTIFY_STATUS_OUTDATED: 2,
  NOTIFY_STATUS_PENDING: 3,
  NOTIFY_STATUS_REFUSED: 4,
  BEING_PUSH_METHON: {
    2: '指定时间推送',
    1: '立即推送'
  },
  BEING_PUSH_METNON_WAITE: 2,
  BEINGS_PUSH_TYPE: {
    1: '自动推送',
    2: '人工推送'
  },
  BEINGS_PUSH_PERSON: {
    2: '全部用户'
    // 1: '指定用户'
  },
  BEINGS_PUSH_TARGET_PERSON: 1,
  BEINGS_PUSH_EQUMENT: {
    1: '笑联用户端',
    2: '笑联运维端',
    3: '笑联企业版'
  },
  BEINGS_PUSH_STATUS: {
    1: '待推送',
    2: '推送成功',
    3: '推送失败',
    4: '取消推送'
    // 5: '已删除'
  },
  BEING_STATUSTEXT: {
    2: 'success',
    3: 'error',
    4: 'default',
    1: 'warning'
  },
  PUSH_TYPE_PERSON: 2,
  PUSH_SUCCESS_STATUS: 2,
  PUSH_ERROR_STATUS: 3,
  PUSH_CANCEL_STATUS: 4,
  PUSH_WAITE_STATUS: 1
}
export default NOTIFY
