import * as ActionTypes from '../../actions'

// 客服工单
const initialTaskState = {
  taskListContainer: {
    hintRoot: false, // if show the red point in root nav
    countOfUnviewed: 0, // count of all tasks status changed. 目前前两个字段无用，本来是作为未完结工单的提示存在的。
    tabIndex: 2, // '待处理'
    schoolId: 'all',
    mine: '2', // 1: '我的工单', 2: '全部'
    selectedRowIndex: -1, // the row whose detail is being watching
    selectedDetailId: -1, // id of showing detail
    showDetail: false
  },
  pendingList: {
    day: 3,
    startTime: '',
    endTime: '',
    type: 'all',
    selectKey: '',
    page: 1
  },
  handlingList: {
    day: 3,
    startTime: '',
    endTime: '',
    type: 'all',
    selectKey: '',
    page: 1
  },
  finishedList: {
    day: 3,
    startTime: '',
    endTime: '',
    type: 'all',
    selectKey: '',
    page: 1
  },
  taskDetail: {
    tabIndex: 1, // index for detail tab. Abstracted to be independent on data of detail.
    showFinishModal: false,
    showRepairmanModal: false,
    showCustomerModal: false,
    showDeveloperModal: false,
    currentTab: 1,
    complaintPage: 1, // 用户投诉tab页的页码
    feedbackPage: 1, // 用户反馈tab页的页码
    complaintTotal: 0,
    feedbackTotal: 0
  },
  report: {
    mainCate: 0, // 0: '工作情况', 1: '投诉分析', 2: '绩效考核'
    schoolId: 'all',

    panel_rangeIndex: [1, 3, 3], // range for each category; 1: '今日', 2: '近3天', 3: '近7天', 5: '近30天'.
    panel_startTime: ['', '', ''], // startTime of each panel
    panel_endTime: ['', '', ''], // endTime of each panel
    panel_page: [1, 1, 1],
    order: [1, 1, 1], // 1 for 'descend', 2 for 'ascend'
    orderBy: [0, 0, 0], // the param to sort the data with. 0 will be empty.

    assess_dim: 1 // 考核维度，1: '学校', 2: '客服', 3: '维修员'
  }
}
export const taskModule = (state = initialTaskState, action) => {
  const { type } = action

  if (type === ActionTypes.CHANGE_TASK) {
    const { subModule, keyValuePair } = action
    let newState = {}
    newState = Object.assign({}, state[subModule], keyValuePair)
    // console.log(keyValuePair);
    return Object.assign({}, state, { [subModule]: newState })
  }
  return state
}

const initialTaskModal = {
  list: [],
  total: 0,
  countOfUnviewed: 0, // count of data need to check again(status changed since last time check)
  listLoading: false
}
export const taskModal = (state = initialTaskModal, action) => {
  const { type } = action
  if (type === ActionTypes.CHANGE_MODAL_TASK) {
    const { value } = action
    return { ...state, ...value }
  }
  return state
}

const initialTaskDetailModal = {
  detailLoading: false,
  detail: {}
}
export const taskDetailModal = (state = initialTaskDetailModal, action) => {
  const { type } = action
  if (type === ActionTypes.CHANGE_MODAL_TASKDETAIL) {
    const { value } = action
    return { ...state, ...value }
  }
  return state
}
