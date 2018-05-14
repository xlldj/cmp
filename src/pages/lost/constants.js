const LOST = {
  /* LOST */
  LOSTTYPE: { 1: '失物', 2: '招领' },
  showStatus: { 1: '正常显示', 2: '已屏蔽' },
  HiddenStatus: 2,
  DEFRIENDLEVEL: {
    1: '3天',
    2: '7天',
    3: '一个月',
    4: '永久'
  },
  LOST_LIST_PAGE_TAB: [
    {
      value: 1,
      text: '失物招领列表'
    },
    {
      value: 2,
      text: '拉黑用户列表'
    }
  ],
  LOST_LIST_PAGE_TAB_LOSTFOUND: 1,
  LOST_LIST_PAGE_TAB_BLACKEDLIST: 2,
  LOST_FOUND_LIST_DAY_SELECT: [
    { key: 1, value: '今日' },
    { key: 3, value: '近7日' },
    { key: 5, value: '近30日' }
  ],
  LOST_FOUND_STATUS: { 1: '正常显示', 2: '已屏蔽' },
  LOST_FOUND_STATUS_SHADOWED: 2,
  LOST_COMMENT: 1, // 评论
  LOST_REPLY: 2, // 评论的回复
  COMMENT_SIZE_THRESHOLD: 2,
  LOST_BLACK_TIME_SELECTED: '1',
  LOST_BLACK_TIME_SELECTOPTIONS: [
    {
      id: 1,
      name: '拉黑1天'
    },
    {
      id: 2,
      name: '拉黑2天'
    }
  ]
}
export default LOST
