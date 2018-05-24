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
  BEINGS_PUSH_TYPE: {
    1: '自动推送',
    2: '人工推送'
  },
  BEINGS_PUSH_EQUMENT: {
    1: '笑联用户端',
    2: '笑联运维端',
    3: '笑联企业版'
  },
  BEINGS_PUSH_STATUS: {
    1: '成功',
    2: '失败',
    3: '取消',
    4: '待推送'
  }
}
export default NOTIFY
