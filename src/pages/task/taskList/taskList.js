import React from 'react'
import { Table, Button } from 'antd'

import PhaseLine from '../../component/phaseLine'
import RangeSelect from '../../component/rangeSelect'
import SearchInput from '../../component/searchInput.js'
import Time from '../../../util/time'
import AjaxHandler from '../../../util/ajax'
import CONSTANTS from '../../../constants'
import SchoolSelector from '../../component/schoolSelector'
import BasicSelectorWithoutAll from '../../component/basicSelectorWithoutAll'
import CheckSelect from '../../component/checkSelect'
import { checkObject } from '../../../util/checkSame'
import TaskDetail from './taskDetail'
import BuildTask from './buildTask'
import selectedImg from '../../assets/selected.png'
import Noti from '../../../util/noti'
import notworking from '../../assets/notworking.jpg'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeTask, setUserInfo, changeOnline } from '../../../actions'
const subModule = 'taskList'
const classLevel = {
  1: '',
  2: 'yellowfc',
  3: 'red'
}

const TIMERANGESELECTS = {
  0: {
    0: '不限',
    1: '今日',
    3: '近7天',
    6: '超过1天',
    7: '超过2天',
    8: '超过5天'
  },
  1: {
    0: '不限',
    1: '今日',
    3: '近7天',
    6: '超过1天',
    7: '超过2天',
    8: '超过5天'
  },
  2: {
    1: '今日',
    2: '近3天',
    3: '近7天',
    4: '近14天',
    5: '近30天'
  }
}
const TIMELABEL = {
  0: '等待时间',
  1: '等待时间',
  2: '完结时间'
}

const TASKTYPES = {
  1: '不限',
  2: '报修',
  3: '账单投诉',
  4: '意见反馈'
}
const TARGETS = {
  1: '我的任务',
  2: '所有客服任务'
}
const ALLTAG = {
  1: false,
  2: true
}
const {
  TASK_PENDING,
  TASK_ASSIGNED,
  TASK_ACCEPTED,
  TASK_REFUSED,
  TASK_FINISHED,
  TASK_LIST_PAGE_TABS
} = CONSTANTS
const STATUS_LIST = {
  0: [TASK_PENDING],
  1: [TASK_ASSIGNED, TASK_ACCEPTED, TASK_REFUSED],
  2: [TASK_FINISHED]
}

const SIZE = CONSTANTS.PAGINATION
/*------后端接受的all为true/false,必传，post之前将0，1转为true/false---------*/
/*------后端接受的pending为int，不传为所有，我用0表示不传---------------------*/
/*------rule表示顺序或倒序，1为倒序，默认值----------------------------------*/
/*------sourcetype不传表示所有，我用0代替，1为体现，2为维修-------------------*/

class TaskList extends React.Component {
  static propTypes = {
    taskList: PropTypes.object.isRequired,
    forbiddenStatus: PropTypes.object.isRequired
  }
  constructor(props) {
    super(props)
    let dataSource = []
    this.state = {
      dataSource,
      loading: false,
      total: 0,
      startTime: '',
      endTime: '',
      searchingText: '',
      showBuild: false
    }
    this.needUpdate = false
  }

  // fetch task/list
  fetchTasks = body => {
    let resource = '/work/order/list'

    const cb = json => {
      this.setState({
        loading: false
      })
      let {
        main_phase,
        panel_total,
        showDetail,
        selectedDetailId,
        selectedRowIndex
      } = this.props.taskList
      let panel_dataSource = JSON.parse(
        JSON.stringify(this.props.taskList.panel_dataSource)
      )
      let newTotal = Array.from(panel_total)
      // console.log(json.data)
      // console.log(json.data[jsonKeyName])
      panel_dataSource[main_phase] = json.data.workOrders
      newTotal[main_phase] = json.data.total

      /* update 'selectedDetailId' if neccesary */
      let newProps = {
        panel_dataSource: panel_dataSource,
        panel_total: newTotal
      }
      if (showDetail && selectedRowIndex === -1 && selectedDetailId !== -1) {
        let index = -1
        console.log(selectedDetailId)
        json.data.workOrders.forEach((r, i) => {
          if (r.id === selectedDetailId) {
            index = i
          }
        })
        if (index !== -1) {
          newProps.selectedRowIndex = index
        }
        console.log(index)
      }
      this.props.changeTask(subModule, newProps)
    }
    this.setState({
      loading: true
    })
    AjaxHandler.ajax(resource, body, cb, null, {
      clearLoading: true,
      thisObj: this
    })
  }
  fetchData = body => {
    let resource = '/api/work/sheet/list'
    const cb = json => {
      /* set a timer of 5 minutes, fetch the data again when timer fires */
      if (this.ti) {
        clearTimeout(this.ti)
        this.ti = null
      }
      this.ti = setTimeout(this.refetch, 5 * 60 * 1000)

      let nextState = {}
      if (json.error) {
        throw new Error(json.error)
      } else {
        let workSheets = json.data.workSheets
        nextState.dataSource = workSheets
        nextState.total = json.data.total
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  refetch = () => {
    let { all, assigned, sourceType, pending, page, schoolId } = this.props
    const body = {
      page: page,
      size: SIZE,
      assigned: assigned
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if (all === '1') {
      body.all = false
    } else {
      body.all = true
    }
    if (pending !== 'all') {
      body.pending = parseInt(pending, 10)
    }
    if (sourceType !== 'all') {
      body.sourceType = parseInt(sourceType, 10)
    }
    this.fetchData(body)
  }
  componentDidMount() {
    this.props.hide(false)
    let {
      main_phase,
      main_schoolId,
      main_mine,
      panel_rangeIndex,
      panel_startTime,
      panel_endTime,
      panel_type,
      panel_selectKey,
      panel_page,
      panel_dataSource
    } = this.props.taskList
    let page = panel_page[main_phase]
    let startTime = panel_startTime[main_phase],
      endTime = panel_endTime[main_phase]
    // set startTime and endTime if props has no-empty value
    if (panel_startTime[main_phase] && panel_endTime[main_phase]) {
      this.setState({
        startTime: panel_startTime[main_phase],
        endTime: panel_endTime[main_phase]
      })
    }

    // add click event
    let root = document.getElementById('root')
    root.addEventListener('click', this.closeDetail, false)

    if (!this.props.user.csOnline) {
      return
    }

    if (panel_dataSource[main_phase]) {
      // dataSource has the data
      if (this.state.loading) {
        this.setState({
          loading: false
        })
      }
    } else {
      let type = panel_type[main_phase]
      let day = panel_rangeIndex[main_phase]
      const body = {
        page: page,
        size: SIZE,
        all: ALLTAG[main_mine],
        statusList: STATUS_LIST[main_phase]
      }
      if (main_schoolId !== 'all') {
        body.schoolId = parseInt(main_schoolId, 10)
      }
      if (day !== 0) {
        body.day = day
      }
      if (startTime && endTime) {
        body.startTime = startTime
        body.endTime = endTime
      }
      if (panel_selectKey[main_phase]) {
        body.selectKey = panel_selectKey[main_phase]
      }
      // console.log(type)
      if (type !== 1) {
        body.type = type - 1
      }
      this.fetchTasks(body)
    }
  }
  closeDetail = e => {
    // e.preventDefault()
    // e.stopPropagation()
    if (!this.props.taskList.showDetail) {
      return
    }
    console.log('happen')
    let target = e.target
    let detailWrapper = this.refs.detailWrapper
    if (detailWrapper.contains(target)) {
      console.log('contain')
      return
    }
    if (this.props.taskList.showDetail) {
      this.props.changeTask(subModule, {
        showDetail: false,
        selectedRowIndex: -1,
        selectedDetailId: -1,
        details: {}
      })
    }
  }
  componentWillUnmount() {
    this.props.hide(true)
    let root = document.getElementById('root')
    root.removeEventListener('click', this.closeDetail, false)
  }
  componentWillReceiveProps(nextProps) {
    /* distinguish data fetch of 'list' from 'detail' , or else it will cause mutual chaos. */
    try {
      let {
        main_phase,
        main_schoolId,
        main_mine,
        panel_rangeIndex,
        panel_startTime,
        panel_endTime,
        panel_type,
        panel_selectKey,
        panel_page,
        panel_dataSource
      } = nextProps.taskList

      // update state.startTime to props.startTime
      let { startTime, endTime } = this.state,
        nextState = {}
      nextState.searchingText = panel_selectKey[main_phase]
      if (startTime !== panel_startTime[main_phase]) {
        nextState.startTime = panel_startTime[main_phase]
      }
      if (endTime !== panel_endTime[main_phase]) {
        nextState.endTime = panel_endTime[main_phase]
      }
      this.setState(nextState)

      // First, check these props to determine if to check exist.
      // Second, check if needed data exist, determine if to fetch list data.
      // Third, check if customer is online from offline.
      // need to check 'showDetail' because if finish or transfer task, will clear all dataSource.
      if (
        !checkObject(this.props.taskList, nextProps.taskList, [
          'main_phase',
          'main_schoolId',
          'main_mine',
          'panel_rangeIndex',
          'panel_startTime',
          'panel_endTime',
          'panel_type',
          'panel_selectKey',
          'panel_page'
        ]) ||
        !panel_dataSource[main_phase] ||
        (nextProps.user.csOnline && !this.props.user.csOnline)
      ) {
        // fetch the data
        let type = panel_type[main_phase]
        let page = panel_page[main_phase]
        let day = panel_rangeIndex[main_phase]
        const body = {
          page: page,
          size: SIZE,
          all: ALLTAG[main_mine],
          statusList: STATUS_LIST[main_phase]
        }
        if (main_schoolId !== 'all') {
          body.schoolId = parseInt(main_schoolId, 10)
        }
        if (day !== 0 && day !== 100) {
          // 100 is the value for selecting custom range.
          body.day = day
        }
        if (panel_startTime[main_phase] && panel_endTime[main_phase]) {
          body.startTime = panel_endTime[main_phase]
          body.endTime = panel_endTime[main_phase]
        }
        if (panel_selectKey[main_phase]) {
          body.selectKey = panel_selectKey[main_phase]
        }
        if (type !== 1) {
          body.type = type - 1
        }
        this.fetchTasks(body)
      }

      // Check if fetch detail data. If these props change, need to check.
      /*
      if (showDetail && !checkObject(this.props.taskList, nextProps.taskList, ['selectedRowIndex'])) {
        let selectedItem = panel_dataSource[main_phase] && panel_dataSource[main_phase][selectedRowIndex] // selected row
        let id = ''
        if (selectedItem) { // should always be true, or else it can't be clicked.
        console.log(selectedItem)
          id = selectedItem.id
          console.log(id)
          if (details[id]) { 
            // if loading, toggle it
            if (detailLoading) {
              this.props.changeTask(subModule, {
                detailLoading: false
              })
            }
          } else {
            // fetch the detail
            const body = {
              id: id
            }
            this.fetchTaskDetail(body)
            if (!detailLoading) {
              this.props.changeTask(subModule, {
                detailLoading: true
              })
            }
          }
        }
      }
      */
      this.props = nextProps
    } catch (e) {
      console.log(e)
    }
  }

  // fetch task/one
  fetchTaskDetail = body => {
    let resource = '/work/order/one'
    const cb = json => {
      // only handle data here
      let data = {
        [body.id]: json.data
      }
      let { details } = this.props.taskList
      let newDetails = Object.assign({}, details, data)
      let value = {
        details: newDetails,
        detailLoading: false
      }
      console.log(newDetails)
      // set data into store
      this.props.changeTask(subModule, value)
    }
    // console.log(resource)
    AjaxHandler.ajax(resource, body, cb)
  }

  /*
  changePhase = e => {
    try {
      e.preventDefault()
      let key = parseInt(e.target.getAttribute('data-key'), 10)
      let { main_phase } = this.props.taskList
      if (main_phase !== key) {
        this.props.changeTask(subModule, { main_phase: key })
      }
    } catch (e) {
      console.log(e)
    }
  }
  */
  changePhase = v => {
    let { main_phase } = this.props.taskList
    if (main_phase !== v) {
      this.props.changeTask(subModule, { main_phase: v })
    }
  }
  changeSchool = v => {
    let { main_schoolId } = this.props.taskList
    if (v === main_schoolId) {
      return
    }
    this.props.changeTask(subModule, {
      main_schoolId: v,
      panel_page: [1, 1, 1],
      panel_dataSource: { 1: [], 2: [], 3: [] }
    })
  }
  changeAll = v => {
    let { main_mine } = this.props.taskList
    if (v !== main_mine) {
      this.props.changeTask(subModule, {
        main_mine: v,
        panel_page: [1, 1, 1],
        panel_dataSource: { 1: [], 2: [], 3: [] }
      })
    }
  }
  changeRange = key => {
    let panel_rangeIndex = this.props.taskList['panel_rangeIndex'].slice()
    let panel_dataSource = JSON.parse(
      JSON.stringify(this.props.taskList['panel_dataSource'])
    )
    let panel_page = this.props.taskList['panel_page'].slice()
    let startTime = this.props.taskList['panel_startTime'].slice()
    let endTime = this.props.taskList['panel_endTime'].slice()

    let i = this.props.taskList.main_phase
    panel_rangeIndex[i] = parseInt(key, 10)
    panel_page[i] = 1
    panel_dataSource[i + 1] = [] // clear dataSource of the corresponding panel
    // clear startTime and endTime
    startTime[i] = ''
    endTime[i] = ''
    this.props.changeTask(subModule, {
      panel_rangeIndex: panel_rangeIndex,
      panel_page: panel_page,
      panel_dataSource: panel_dataSource,
      panel_startTime: startTime,
      panel_endTime: endTime
    })
  }
  changeTaskType = key => {
    let panel_type = JSON.parse(
      JSON.stringify(this.props.taskList['panel_type'])
    )
    let panel_dataSource = JSON.parse(
      JSON.stringify(this.props.taskList['panel_dataSource'])
    )
    let panel_page = Array.from(this.props.taskList['panel_page'])
    let i = this.props.taskList.main_phase
    panel_type[i] = parseInt(key, 10)
    panel_dataSource[i + 1] = [] // clear dataSource of the corresponding panel
    panel_page[i] = 1 // clear page also
    this.props.changeTask(subModule, {
      panel_type: panel_type,
      panel_dataSource: panel_dataSource,
      panel_page: panel_page
    })
  }
  changeStartTime = time => {
    this.setState({
      startTime: time
    })
  }
  changeEndTime = time => {
    this.setState({
      endTime: time
    })
  }
  confirmTimeRange = () => {
    let { startTime, endTime } = this.state
    if (!startTime || !endTime) {
      return
    }
    let panel_startTime = JSON.parse(
      JSON.stringify(this.props.taskList.panel_startTime)
    )
    let panel_endTime = JSON.parse(
      JSON.stringify(this.props.taskList.panel_endTime)
    )
    let panel_page = JSON.parse(JSON.stringify(this.props.taskList.panel_page))
    let panel_rangeIndex = this.props.taskList.panel_rangeIndex.slice()
    let panel_dataSource = JSON.parse(
      JSON.stringify(this.props.taskList['panel_dataSource'])
    )
    // let panel_total = JSON.parse(JSON.stringify(this.props.taskList.panel_total))
    let i = this.props.taskList.main_phase
    panel_startTime[i] = startTime
    panel_endTime[i] = endTime
    panel_page[i] = 1
    panel_rangeIndex[i] = 100
    panel_dataSource[i + 1] = [] // clear dataSource of the corresponding panel
    this.props.changeTask(subModule, {
      panel_startTime: panel_startTime,
      panel_endTime: panel_endTime,
      panel_page: panel_page,
      panel_rangeIndex: panel_rangeIndex,
      panel_dataSource: panel_dataSource
    })
  }
  changeSearch = e => {
    let v = e.target.value
    this.setState({
      searchingText: v
    })
  }
  searchEnter = () => {
    let v = this.state.searchingText.trim()
    let panel_selectKey = JSON.parse(
      JSON.stringify(this.props.taskList.panel_selectKey)
    )
    let panel_page = JSON.parse(JSON.stringify(this.props.taskList.panel_page))
    let panel_dataSource = JSON.parse(
      JSON.stringify(this.props.taskList['panel_dataSource'])
    )
    let i = this.props.taskList.main_phase
    panel_selectKey[i] = v
    panel_page[i] = 1
    panel_dataSource[i + 1] = []
    this.props.changeTask(subModule, {
      panel_selectKey: panel_selectKey,
      panel_page: panel_page,
      panel_dataSource: panel_dataSource
    })
  }
  selectRow = (record, index, event) => {
    let { detail_tabIndex, main_phase, panel_dataSource } = this.props.taskList
    // let page = panel_page[main_phase]
    let id =
      panel_dataSource[main_phase] &&
      panel_dataSource[main_phase][index] &&
      panel_dataSource[main_phase][index].id
    let newTabIndex = Array.from(detail_tabIndex)
    newTabIndex[main_phase] = 1
    this.props.changeTask(subModule, {
      selectedRowIndex: index,
      showDetail: true,
      detail_tabIndex: newTabIndex,
      selectedDetailId: id
    })
  }

  changePage = pageObj => {
    let page = pageObj.current
    let { panel_page, main_phase } = this.props.taskList
    let former = panel_page[main_phase]
    if (former === page) {
      return
    }
    let newPage = Array.from(panel_page)
    newPage.splice(main_phase, 1, page)
    this.props.changeTask(subModule, { panel_page: newPage })
  }

  setRowClass = (record, index) => {
    let { selectedRowIndex } = this.props.taskList
    if (index === selectedRowIndex) {
      return 'selectedRow'
    } else {
      return ''
    }
  }
  buildTask = () => {
    this.setState({
      showBuild: true
    })
  }
  cancelBuildTask = () => {
    this.setState({
      showBuild: false
    })
  }
  buildTaskSuccess = () => {
    Noti.hintOk('操作成功', '创建工单成功')
    this.setState({
      showBuild: false
    })
    this.updateList()
  }
  updateList = () => {
    let panel_dataSource = JSON.parse(
      JSON.stringify(this.props.taskList.panel_dataSource)
    )
    let panel_page = Array.from(this.props.taskList.panel_page)
    delete panel_dataSource[1] // clear handling list
    panel_page[1] = 1
    let newProps = {
      panel_dataSource: panel_dataSource,
      main_phase: 1,
      panel_page: panel_page
    }
    this.needUpdate = true // tell 'propsWillReceiveProps' to update dataSource
    this.props.changeTask(subModule, newProps)
  }

  changeOnline = e => {
    this.props.changeOnline()
    /*
    let resource = '/employee/cs/online';
    const body = null;
    const cb = json => {
      if (json.data.result) {
        Noti.hintOk('操作成功', '已成功上线');
        this.props.setUserInfo({
          csOnline: true
        });
      } else {
        Noti.hintWarning('上线出错', '未成功上线，请稍后重试');
      }
    };
    AjaxHandler.ajax(resource, body, cb);
    */
  }
  render() {
    const { isCs, csOnline } = this.props.user
    let {
      main_phase,
      main_schoolId,
      main_mine,
      panel_rangeIndex,
      panel_type,
      panel_total,
      panel_page,
      panel_dataSource,
      showDetail,
      selectedRowIndex
    } = this.props.taskList
    const { forbiddenStatus } = this.props
    let page = panel_page[main_phase]
    let dataSource = panel_dataSource[main_phase] || []
    // console.log(dataSource)
    const { loading, startTime, endTime, searchingText, showBuild } = this.state

    const TIMETITLE = main_phase === 2 ? '用时' : '等待时间'
    const columns = [
      {
        title: '工单编号',
        dataIndex: 'id',
        className: 'firstCol selectedHintWraper',
        width: '8%',
        render: (text, record, index) => (
          <span className="">
            {index === selectedRowIndex ? (
              <img src={selectedImg} alt="" className="selectedImg" />
            ) : null}
            {text}
          </span>
        )
      },
      {
        title: '学校',
        dataIndex: 'schoolName',
        width: '10%'
      },
      {
        title: '工单类型',
        dataIndex: 'type',
        width: '8%',
        render: text => CONSTANTS.TASKTYPE[text]
      },
      {
        title: '发起人',
        dataIndex: 'creatorName',
        width: '10%'
      },
      {
        title: '受理人',
        dataIndex: 'assignName',
        width: '10%'
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        width: '14%',
        render: (text, record) => Time.getTimeStr(text)
      },
      {
        title: <span>{TIMETITLE}</span>,
        dataIndex: 'endTime',
        width: '14%',
        render: (text, record, index) => {
          if (record.status === 5 || record.status === 6) {
            return record.endTime
              ? Time.getTimeInterval(record.createTime, record.endTime)
              : Time.getSpan(record.createTime)
          } else {
            return record.createTime ? Time.getSpan(record.createTime) : ''
          }
        }
      }
    ]

    const handlingColumns = [
      {
        title: '工单编号',
        dataIndex: 'id',
        className: 'firstCol selectedHintWraper',
        width: '8%',
        render: (text, record, index) => (
          <span className="">
            {index === selectedRowIndex ? (
              <img src={selectedImg} alt="" className="selectedImg" />
            ) : null}
            {text}
          </span>
        )
      },
      {
        title: '学校',
        dataIndex: 'schoolName',
        width: '10%'
      },
      {
        title: '工单类型',
        dataIndex: 'type',
        width: '8%',
        render: text => CONSTANTS.TASKTYPE[text]
      },
      {
        title: '发起人',
        dataIndex: 'creatorName',
        width: '8%'
      },
      {
        title: '受理人',
        dataIndex: 'assignName',
        width: '8%'
      },
      {
        title: '紧急程度',
        dataIndex: 'level',
        width: '8%',
        render: (text, record) => (
          <span className={classLevel[record.level]}>
            {CONSTANTS.PRIORITY[text]}
          </span>
        )
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        width: '12%',
        render: (text, record) => Time.getTimeStr(text)
      },
      {
        title: <span>{TIMETITLE}</span>,
        dataIndex: 'endTime',
        width: '12%',
        render: (text, record, index) => {
          if (record.status === 5 || record.status === 6) {
            return record.endTime
              ? Time.getTimeInterval(record.createTime, record.endTime)
              : Time.getSpan(record.createTime)
          } else {
            return record.createTime ? Time.getSpan(record.createTime) : ''
          }
        }
      }
    ]

    const selector1 = (
      <SchoolSelector
        key="schoolSelector"
        className="select-item"
        selectedSchool={main_schoolId}
        changeSchool={this.changeSchool}
      />
    )
    const selector2 = (
      <BasicSelectorWithoutAll
        key="mineSelector"
        className="select-item"
        selectedOpt={main_mine}
        staticOpts={TARGETS}
        changeOpt={this.changeAll}
      />
    )
    return (
      <div className="taskPanelWrapper" ref="wrapper">
        {isCs && !csOnline ? (
          <div className="loadingMask offlineWrapper">
            <div className="offline">
              <img src={notworking} alt="offline" />
              <span>未进入工作状态</span>
              <Button size="small" type="primary" onClick={this.changeOnline}>
                点击上班
              </Button>
            </div>
          </div>
        ) : null}
        <PhaseLine
          value={main_phase}
          staticPhase={TASK_LIST_PAGE_TABS}
          selectors={[selector1, selector2]}
          changePhase={this.changePhase}
        >
          <div className="block">
            {forbiddenStatus.BUILD_TASK ? null : (
              <Button
                type="primary"
                className="rightBtn"
                onClick={this.buildTask}
              >
                创建工单
              </Button>
            )}
          </div>
        </PhaseLine>

        <div className="queryPanel">
          <div className="queryLine">
            <div className="block">
              <span>{TIMELABEL[main_phase]}:</span>
              <CheckSelect
                options={TIMERANGESELECTS[main_phase]}
                value={panel_rangeIndex[main_phase]}
                onClick={this.changeRange}
              />
              <RangeSelect
                className="task-rangeSelect"
                startTime={startTime}
                endTime={endTime}
                changeStartTime={this.changeStartTime}
                changeEndTime={this.changeEndTime}
                confirm={this.confirmTimeRange}
              />
            </div>
            <div className="block">
              <SearchInput
                placeholder="用户"
                searchingText={searchingText}
                pressEnter={this.searchEnter}
                changeSearch={this.changeSearch}
              />
            </div>
          </div>

          <div className="queryLine">
            <div className="block">
              <span>任务类型:</span>
              <CheckSelect
                options={TASKTYPES}
                value={panel_type[main_phase]}
                onClick={this.changeTaskType}
              />
            </div>
            <div className="block">
              <span className="mgr10">
                当前工单总条数:{panel_total[main_phase]}
              </span>
            </div>
          </div>
        </div>

        <div className="tableList">
          <Table
            bordered
            loading={loading}
            rowKey={record => record.id}
            pagination={{
              pageSize: SIZE,
              current: page,
              total: panel_total[main_phase]
            }}
            // dataSource={panel_dataSource[main_phase]}
            dataSource={dataSource}
            columns={main_phase === 1 ? handlingColumns : columns}
            onChange={this.changePage}
            onRowClick={this.selectRow}
            rowClassName={this.setRowClass}
          />
        </div>
        {showBuild ? (
          <BuildTask
            cancel={this.cancelBuildTask}
            success={this.buildTaskSuccess}
          />
        ) : null}

        <div ref="detailWrapper">
          <TaskDetail show={showDetail} />
        </div>
      </div>
    )
  }
}

// export default TaskList

const mapStateToProps = (state, ownProps) => ({
  taskList: state.taskModule[subModule],
  forbiddenStatus: state.setAuthenData.forbiddenStatus,
  user: state.setUserInfo
})

export default withRouter(
  connect(mapStateToProps, {
    changeTask,
    setUserInfo,
    changeOnline
  })(TaskList)
)
