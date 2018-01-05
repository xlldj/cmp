import React from 'react'
import {Link} from 'react-router-dom'
import {Table, Badge, Button, Modal} from 'antd'

import RangeSelect from '../component/rangeSelect'
import SearchInput from '../component/searchInput.js'
import Time from '../component/time'
import AjaxHandler from '../ajax'
import CONSTANTS from '../component/constants'
import SearchLine from '../component/searchLine'
import SchoolSelector from '../component/schoolSelector'
import BasicSelector from '../component/basicSelector'
import BasicSelectorWithoutAll from '../component/basicSelectorWithoutAll'
import CheckSelect from '../component/checkSelect'
import {checkObject} from '../util/checkSame'
import RepairDetail from './repairDetail'
import BuildTask from './buildTask'
import selectedImg from '../assets/selected.png'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeTask, fetchTasks} from '../../actions'
const subModule = 'taskList'

const TIMERANGESELECTS = {
  0: {
    1: '不限',
    2: '1天以内',
    3: '7天以内',
    4: '超过1天',
    5: '超过2天',
    6: '超过5天'
  },
  1: {
    1: '不限',
    2: '1天以内',
    3: '7天以内',
    4: '超过1天',
    5: '超过2天',
    6: '超过5天'
  },
  2: {
    1: '今天',
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
const DATASOURCENAME = {
  0: 'unhandled',
  1: 'handling',
  2: 'finished'
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
const TYPE2LISTRESOURCE = {
  1: '/work/sheet/list',
  2: '/repair/list',
  3: '/complaint/list',
  4: '/feedback/list'
}
const TYPE2DETAILRESOURCE = {
  1: '/repair/one',
  2: '/complaint/one',
  3: '/feedback/one'
}
const TYPE2KEY = {
  1: 'workSheets',
  2: 'repairDevices',
  3: 'complaints',
  4: 'feedbacks'
}
const ALLTAG = {
  1: false,
  2: true
}

const SIZE = CONSTANTS.PAGINATION
/*------后端接受的all为true/false,必传，post之前将0，1转为true/false---------*/
/*------后端接受的pending为int，不传为所有，我用0表示不传---------------------*/
/*------rule表示顺序或倒序，1为倒序，默认值----------------------------------*/
/*------sourcetype不传表示所有，我用0代替，1为体现，2为维修-------------------*/

class TaskList extends React.Component {
  static propTypes = {
    taskList: PropTypes.object.isRequired,
  }
  constructor (props) {
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
  }

  // fetch task/list 
  fetchTasks = (type, resource, body) => {
    // json.data has different keys according to type
    let {main_phase, panel_page} = this.props.taskList
    const cb = (json) => {
      this.setState({
        loading: false
      })
      // let type = panel_type[main_phase]
      // console.log(type)
      let jsonKeyName = TYPE2KEY[type]
      // console.log(jsonKeyName)
      let panel_dataSource = JSON.parse(JSON.stringify(this.props.taskList.panel_dataSource))
      let page = panel_page[main_phase]
      // console.log(json.data)
      // console.log(json.data[jsonKeyName])
      panel_dataSource[main_phase][page] = json.data[jsonKeyName]
      this.props.changeTask(subModule, {
        panel_dataSource: panel_dataSource
      })
    }
    this.setState({
      loading: true
    })
    AjaxHandler.ajax(resource, body, cb)
  }
  fetchData = (body) => {
    let resource = '/api/work/sheet/list'
    const cb = (json) => {
      /* set a timer of 5 minutes, fetch the data again when timer fires */
      if (this.ti) {
        clearTimeout(this.ti)
        this.ti = null
      }
      this.ti = setTimeout(this.refetch, 5 * 60 * 1000)

      let nextState = {}
      if(json.error){
        throw new Error(json.error)
      }else{        
        let workSheets = json.data.workSheets
        nextState.dataSource = workSheets
        nextState.total = json.data.total
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  refetch = () => {
    let {all, assigned, sourceType, pending, page, schoolId} = this.props
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
  componentDidMount(){
    this.props.hide(false)
    let {main_phase, main_schoolId, main_mine, 
      panel_rangeIndex, panel_startTime, panel_endTime, panel_type, 
      panel_selectKey, panel_total, panel_page, panel_dataSource,
      panel_countOfUnviewed, 
      details, detail_tabIndex
    } = this.props.taskList
    let page = panel_page[main_phase]
    if (panel_dataSource[main_phase] && panel_dataSource[main_phase][page] && (panel_dataSource[main_phase][page].length > 0)) {
      // dataSource has the data, don't need to fetch again

    } else {
      let type = panel_type[main_phase]
      let resource = TYPE2LISTRESOURCE[type]
      const body = {
        page: page, 
        size: SIZE,
        all: ALLTAG[main_mine]
        // status: main_phase
      }
      if (main_schoolId !== 'all') {
        body.schoolId = parseInt(main_schoolId, 10)
      }
      if (type === 1) {
        body.assigned = false
      }
      this.fetchTasks(type, resource, body)
    }

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

  }
  closeDetail = (e) => {
    // e.preventDefault()
    // e.stopPropagation()
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
        selectedRowIndex: -1
      })
    }
  }
  componentWillUnmount () {
    this.props.hide(true)
    let root = document.getElementById('root')
    root.removeEventListener('click', this.closeDetail, false)
  }
  componentWillReceiveProps (nextProps) {
    /* distinguish data fetch of 'list' from 'detail' , or else it will cause mutual chaos. */
    try {
      let {main_phase, main_schoolId, main_mine, 
        panel_rangeIndex, panel_startTime, panel_endTime, panel_type, 
        panel_selectKey, panel_total, panel_page, panel_dataSource, 
        details, detail_tabIndex, showDetail, selectedRowIndex, detailLoading
      } = nextProps.taskList
      let page = panel_page[main_phase]

      // update state.startTime to props.startTime
      let {startTime, endTime} = this.state, nextState = {}
      if (startTime !== panel_startTime[main_phase]) {
        nextState.startTime = panel_startTime[main_phase]
      }
      if (endTime !== panel_endTime[main_phase]) {
        nextState.endTime = panel_endTime[main_phase]
      }
      this.setState(nextState)

      // First, check these props to determine if to check exist.
      // Second, check if needed data exist, determine if to fetch list data.
      if (!checkObject(this.props.taskList, nextProps.taskList, [
        'main_phase', 'main_schoolId', 'main_mine', 
        'panel_rangeIndex', 'panel_startTime', 'panel_endTime', 'panel_type',
        'panel_selectKey', 'panel_page'])) {
          if (panel_dataSource[main_phase] && panel_dataSource[main_phase][page]) {
            // dataSource has the data
            if (this.state.loading) {
              this.setState({
                loading: false
              })
            }
          } else {
            // fetch the data
            let type = panel_type[main_phase]
            let resource = TYPE2LISTRESOURCE[type]
            let page = panel_page[main_phase]
            let body = {
              page: page, 
              size: SIZE
              // status: main_phase
            }
            this.fetchTasks(type, resource, body)
            this.setState({
              loading: true
            })
          }
        }

      // If detail is not displaying, no need to check detail.
      if (!showDetail) {
        return
      }
      // Check if fetch detail data. If these props change, need to check.
      if (!checkObject(this.props.taskList, nextProps.taskList, ['selectedRowIndex'])) {
        let selectedItem = panel_dataSource[main_phase][page] && panel_dataSource[main_phase][page][selectedRowIndex] // selected row
        let id = '', detail
        if (selectedItem) { // should always be true, or else it can't be clicked.
          id = selectedItem[id] || 1
          if (details[id]) { 
            // if loading, toggle it
            if (detailLoading) {
              this.props.changeTask(subModule, {
                detailLoading: false
              })
            }
          } else {
            // fetch the detail
            let resource = '/repair/one'
            const body = {
              id: id
            }
            this.fetchTaskDetail(resource, body)
            if (!detailLoading) {
              this.props.changeTask(subModule, {
                detailLoading: true
              })
            }
          }
        }
      }


      this.props = nextProps
    } catch (e) {
      console.log(e)
    }
    /*
    if (checkObject(this.props.taskList, nextProps.taskList, ['page', 'all', 'assigned', 'sourceType', 'pending', 'schoolId'])) {
      return
    }

    let {all, assigned, sourceType, pending, page, schoolId} = nextProps
    console.log(schoolId)
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
    */
  }

  // fetch task/one 
  fetchTaskDetail = (resource, body) => {
    const cb = (json) => {
      // only handle data here
      let data = {
        [body.id]: json.data
      }
      let {details} = this.props.taskList
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


  changePhase = (e) => {
    try {
      e.preventDefault()
      if (this.props.taskList.showDetail) {
        return
      }
      let key = parseInt(e.target.getAttribute('data-key'), 10)
      let {main_phase} = this.props.taskList
      if (main_phase !== key) {
        this.props.changeTask(subModule, {main_phase: key})
      }
    } catch (e) {
      console.log(e)
    }
  }
  changeSchool = (v) => {
    if (this.props.taskList.showDetail) {
      return
    }
    let {main_schoolId} = this.props.taskList
    if (v !== main_schoolId) {
      return
    }
    this.props.changeTask(subModule, {
      'main_schoolId': v, panel_page: [1, 1, 1], panel_dataSource: [{}, {}, {}]
    })
  }
  changeAll = (v)=> {
    if (this.props.taskList.showDetail) {
      return
    }
    let {main_mine} = this.props.taskList
    if (v !== main_mine) {
      this.props.changeTask(subModule, {
        'main_mine': v, 'panel_page': [1, 1, 1], panel_dataSource: [{}, {}, {}]
      })
    }
  }
  changeRange = (key) => {
    if (this.props.taskList.showDetail) {
      return
    }
    let panel_rangeIndex = this.props.taskList['panel_rangeIndex'].slice()
    let panel_dataSource = JSON.parse(JSON.stringify(this.props.taskList['panel_dataSource']))
    let panel_page = this.props.taskList['panel_page'].slice()
    let startTime = this.props.taskList['panel_startTime'].slice()
    let endTime = this.props.taskList['panel_endTime'].slice()

    let i = this.props.taskList.main_phase
    panel_rangeIndex[i] = parseInt(key, 10)
    panel_page[i] = 1
    panel_dataSource[i] = {} // clear dataSource of the corresponding panel 
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
  changeTaskType = (key) => {
    if (this.props.taskList.showDetail) {
      return
    }
    let panel_type = JSON.parse(JSON.stringify(this.props.taskList['panel_type']))
    let panel_dataSource = JSON.parse(JSON.stringify(this.props.taskList['panel_dataSource']))
    let i = this.props.taskList.main_phase
    panel_type[i] = parseInt(key, 10)
    panel_dataSource[i] = {} // clear dataSource of the corresponding panel 
    this.props.changeTask(subModule, {
      panel_type: panel_type, panel_dataSource: panel_dataSource
    })
  }
  changeStartTime = (time) => {
    this.setState({
      startTime: time
    })
  }
  changeEndTime = (time) => {
    this.setState({
      endTime: time
    })
  }
  confirmTimeRange = () => {
    let {startTime, endTime} = this.state
    if (!startTime || !endTime) {
      return
    }
    let panel_startTime = JSON.parse(JSON.stringify(this.props.taskList.panel_startTime))
    let panel_endTime = JSON.parse(JSON.stringify(this.props.taskList.panel_endTime))
    let panel_page = JSON.parse(JSON.stringify(this.props.taskList.panel_page))
    let panel_rangeIndex = this.props.taskList.panel_rangeIndex.slice()
    let panel_dataSource = JSON.parse(JSON.stringify(this.props.taskList['panel_dataSource']))
    // let panel_total = JSON.parse(JSON.stringify(this.props.taskList.panel_total))
    let i = this.props.taskList.main_phase
    panel_startTime[i] = startTime
    panel_endTime[i] = endTime
    panel_page[i] = 1
    panel_rangeIndex[i] = 1
    panel_dataSource[i] = {} // clear dataSource of the corresponding panel 
    this.props.changeTask(subModule, {
      panel_startTime: panel_startTime, 
      panel_endTime: panel_endTime, 
      panel_page: panel_page,
      panel_rangeIndex: panel_rangeIndex,
      panel_dataSource: panel_dataSource
    })
  }
  changeSearch = (e) => {
    let v = e.target.value
    this.setState({
      searchingText: v
    })
  }
  searchEnter = () => {
    let v = this.state.searchingText.trim()
    if (!v) {
      return
    }
    let panel_selectKey = JSON.parse(JSON.stringify(this.props.taskList.panel_selectKey))
    let panel_page = JSON.parse(JSON.stringify(this.props.taskList.panel_page))
    let panel_dataSource = JSON.parse(JSON.stringify(this.props.taskList['panel_dataSource']))
    let i = this.props.taskList.main_phase
    panel_selectKey[i] = v
    panel_page[i] = 1
    panel_dataSource[i] = {}
    this.props.changeTask(subModule, {
      panel_selectKey: panel_selectKey,
      panel_page: panel_page,
      panel_dataSource: panel_dataSource
    })
  }
  selectRow = (record, index, event) => {
    this.props.changeTask(subModule, {selectedRowIndex: index, showDetail: true})
  }

  changePage = (pageObj) => {
    let page = pageObj.current
    let {panel_page, main_phase} = this.props.taskList
    let former = panel_page[main_phase]
    if (former === page) {
      return
    }
    let newPage = Array.from(panel_page)
    newPage.splice(main_phase, 1, page)
    this.props.changeTask(subModule, {'panel_page': newPage})
  }

  setRowClass = (record, index) => {
    let {selectedRowIndex} = this.props.taskList
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
  render () {
    let {main_phase, main_schoolId, main_mine, 
      panel_rangeIndex, panel_startTime, panel_endTime, panel_type, 
      panel_selectKey, panel_total, panel_page, panel_dataSource, 
      panel_countOfUnviewed, 
      details, detail_tabIndex, showDetail, selectedRowIndex
    } = this.props.taskList
    let page = panel_page[main_phase]
    let dataSource = (panel_dataSource[main_phase] && panel_dataSource[main_phase][page]) || []
    const {loading, startTime, endTime, searchingText, showBuild} = this.state

    const columns = [{
      title: '学校',
      className: 'firstCol selectedHintWraper',
      dataIndex: 'schoolName',
      width: '10%',
      render: (text, record, index) => (
        <span className=''>
          { index === selectedRowIndex ?
              <img src={selectedImg} alt='' className='selectedImg' />
            : null 
          }
          {text}
        </span>
      )
    }, {
      title: '任务类型',
      dataIndex: 'sourceType',
      width: '8%',
      render: (text) => (TASKTYPES[text])
    }, {
      title: '用户',
      dataIndex: 'mobile',
      width: '10%',
      render: (text, record) => (record.mobile || '----')
    }, {
      title: '设备地址',
      dataIndex: 'location',
      width: '10%',
      render: (text, record) => (record.location || '----')
    }, {
      title: '任务申请时间',
      dataIndex: 'createTime',
      width: '14%',
      render:(text,record)=>(Time.showDate(text))
    }, {
      title: '任务等待时间',
      dataIndex: 'id',
      width: '14%',
      render: (text,record,index) => (Time.getSpan(record.createTime))
    }, {
      title: '提醒次数',
      dataIndex: 'remind',
      width: '8%'
    },{
      title: '任务分工',
      dataIndex: 'assignName',
      width: '8%',
      render: (text, record) => {
        switch(record.status) {
          case 1:
          case 2:
          case 5:
          case 6:
            return record.csName;
          case 3:
          case 4:
          case 7:
            return record.assignName;
          default: 
            return record.csName || '----'
        }
      }
    },{
      title: '处理状态',
      dataIndex: 'status',
      width: '11%',
      render: (text,record) => {
        if (record.sourceType === 1) {
          switch(record.status){
            case 1:
              return <Badge status='error' text={CONSTANTS.WITHDRAWSTATUS[record.status]} />
            case 2:
            case 5:
              return <Badge status='default' text={CONSTANTS.WITHDRAWSTATUS[record.status]} />
            case 3: 
              return <Badge status='warning' text={CONSTANTS.WITHDRAWSTATUS[record.status]} />
            case 4: 
              return <Badge status='success' text={CONSTANTS.WITHDRAWSTATUS[record.status]} />
            default:
              return <Badge status='warning' text='----' />
          }
        } else {
          switch(record.status){
            case 7:
              return <Badge status='success' text='维修完成' />
            case 3:
              return <Badge status='warning' text={CONSTANTS.REPAIRSTATUSFORSHOW[record.status]+`(${record.assignName})`} />
            case 4:
              return <Badge status='warning' text={CONSTANTS.REPAIRSTATUSFORSHOW[record.status]} />
            case 1:
            case 2:
            case 5:
              return <Badge status='error' text={CONSTANTS.REPAIRSTATUSFORSHOW[record.status]} />
            case 6:
              return <Badge status='error' text={CONSTANTS.REPAIRSTATUSFORSHOW[record.status]+`(${record.assignName})`} />
            default: 
              return <Badge status='error' text='未知' />
          }
        }
      }
    }, {
      title: '操作',
      dataIndex: 'operation',
      width: '10%',
      className: 'lastCol',
      render: (text, record, index) => {
        let deviceAddr = '/device/repair/repairInfo/:', fundAddr = '/fund/list/fundInfo/:', addr
        if (record.sourceType === 2) {
          addr = deviceAddr + record.sourceId
        } else {
          addr = fundAddr + record.sourceId
        }
        return (
          <div className='editable-row-operations'>
            <span>
              <Link to={{pathname: addr, state: {path: 'fromTask'}}} >详情</Link>
            </span>
          </div>
        )
      }
    }]
    return (
      <div className='taskPanelWrapper' ref='wrapper'>
        <div className='phaseLine'>
          <div className='block'>        
            <div className='navLink' onClick={this.changePhase} >
              <a href='' className={main_phase === 0 ? 'active' : ''} data-key={0} >待处理</a>
              <a href='' className={main_phase === 1 ? 'active' : ''} data-key={1}>处理中</a>
              <a href='' className={main_phase === 2 ? 'active' : ''} data-key={2} >已完结</a>
            </div>
            <div className='task-select'>
              <SchoolSelector
                className='select-item'
                selectedSchool={main_schoolId}
                changeSchool={this.changeSchool}
              />
              <BasicSelectorWithoutAll 
                className='select-item'
                selectedOpt={main_mine} 
                staticOpts={TARGETS} 
                changeOpt={this.changeAll} 
              />
            </div>
          </div>
          <div className='block'>
            <Button type='primary' className='rightBtn' onClick={this.buildTask}>创建工单</Button>
          </div>
        </div>

        <div className='task-queryPanel'>
          <div className='task-queryLine'>
            <div className='block'>
              <span>{TIMELABEL[main_phase]}:</span>
              <CheckSelect
                options={TIMERANGESELECTS[main_phase]}
                value={panel_rangeIndex[main_phase]}
                onClick={this.changeRange}
              />
              <RangeSelect
                className='task-rangeSelect'
                startTime={startTime}
                endTime={endTime}
                changeStartTime={this.changeStartTime}
                changeEndTime={this.changeEndTime}
                confirm={this.confirmTimeRange}
              />
            </div>
            <div className='block'>
              <SearchInput
                placeholder='用户'
                searchingText={searchingText}
                pressEnter={this.searchEnter}
                changeSearch={this.changeSearch}
              />
            </div>
          </div>

          <div className='task-queryLine'>
            <div className='block'>
              <span>任务类型:</span>
              <CheckSelect
                options={TASKTYPES}
                value={panel_type[main_phase]}
                onClick={this.changeTaskType}
              />
            </div>
            <div className='block'>
              <span className='mgr10'>当前工单总条数:</span>
            </div>
          </div>
        </div>

        <div className='tableList'>
          <Table 
            bordered
            loading={loading}
            rowKey={(record)=>(record.id)} 
            pagination={{pageSize: SIZE, current: page, total: panel_total[main_phase]}}  
            // dataSource={panel_dataSource[main_phase]} 
            dataSource={dataSource}
            columns={columns} 
            onChange={this.changePage}
            onRowClick={this.selectRow}
            rowClassName={this.setRowClass}
          />
        </div>
        {
          showBuild ? 
            <BuildTask cancel={this.cancelBuildTask} />
          : null
        }

        <div 
          ref='detailWrapper'
        >
          <RepairDetail
            show={showDetail}
          />
        </div>
      </div>
    )
  }
}

// export default TaskList

const mapStateToProps = (state, ownProps) => ({
  taskList: state.changeTask[subModule]
})

export default withRouter(connect(mapStateToProps, {
  changeTask,
  fetchTasks
})(TaskList))