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
  NOTIFY_STATUS_REFUSED: 4
}
export default NOTIFY
