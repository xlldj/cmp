import React from 'react'
import {Link} from 'react-router-dom'
import {Table, Badge, Button} from 'antd'

import RangeSelect from '../component/rangeSelect'
import SearchInput from '../component/searchInput.js'
import Time from '../component/time'
import AjaxHandler from '../ajax'
import CONSTANTS from '../component/constants'
import SearchLine from '../component/searchLine'
import SchoolSelector from '../component/schoolSelector'
import BasicSelector from '../component/basicSelector'
import BasicSelectorWithoutAll from '../component/basicSelectorWithoutAll'
import {checkObject} from '../util/checkSame'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeTask } from '../../actions'
const subModule = 'taskList'

const TYPES = {
  2: '报修',
  1: '提现'
}
const PENDINGS = {
  1: '超过一天',
  2: '超过二天'
}
const TARGETS = {
  1: '我的任务',
  2: '所有客服任务'
}

const SIZE = CONSTANTS.PAGINATION
/*------后端接受的all为true/false,必传，post之前将0，1转为true/false---------*/
/*------后端接受的pending为int，不传为所有，我用0表示不传---------------------*/
/*------rule表示顺序或倒序，1为倒序，默认值----------------------------------*/
/*------sourcetype不传表示所有，我用0代替，1为体现，2为维修-------------------*/

class TaskList extends React.Component {
  static propTypes = {
    all: PropTypes.string.isRequired, //值为1和2
    pending: PropTypes.string.isRequired, // 值为all，1，2
    sourceType: PropTypes.string.isRequired, // 值为all，1，2
    assigned: PropTypes.bool.isRequired,
    page: PropTypes.number.isRequired,
    schoolId: PropTypes.string.isRequired
  }
  constructor (props) {
    super(props)
    let dataSource = []
    this.state = { 
      dataSource, 
      loading: false,
      total: 0
    }
    this.columns = [{
      title: '学校',
      className: 'firstCol',
      dataIndex: 'schoolName',
      width: '10%'
    }, {
      title: '任务类型',
      dataIndex: 'sourceType',
      width: '8%',
      render: (text) => (TYPES[text])
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
  }
  fetchData = (body) => {
    this.setState({
      loading: true
    })
    let resource = '/api/work/sheet/list'
    const cb = (json) => {
      /* set a timer of 5 minutes, fetch the data again when timer fires */
      if (this.ti) {
        clearTimeout(this.ti)
        this.ti = null
      }
      this.ti = setTimeout(this.refetch, 5 * 60 * 1000)

      let nextState = {loading: false}
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
    let {all, assigned, sourceType, pending, page, schoolId} = this.props
    console.log(schoolId)
    const body = {
      page: page,
      size: SIZE,
      assigned: assigned
    }
    // console.log(all === '1')

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
  componentWillUnmount () {
    this.props.hide(true)
  }
  componentWillReceiveProps (nextProps) {
    if (checkObject(this.props, nextProps, ['page', 'all', 'assigned', 'sourceType', 'pending', 'schoolId'])) {
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
  }
  changeDivision = (v)=> {
    let {all} = this.state
    if (v !== all) {
      this.props.changeTask(subModule, {'all': v, 'page': 1})
    }
  }
  changeType = (v) => {
    let {type} = this.props
    if (type !== v) {
      this.props.changeTask(subModule, {'sourceType': v, 'page': 1})
    }
  }
  changePending = (v) => {
    let {assigned} = this.props
    if (v !== assigned) {
      this.props.changeTask(subModule, {'pending': v, page: 1})
    }
  }
  toNa = (e) => {
    e.preventDefault()
    let {assigned} = this.props
    if (assigned) {
      this.props.changeTask(subModule, {'assigned': false, page: 1})
    }
  }
  toAssigned = (e) => {
    e.preventDefault()
    let {assigned} = this.props
    if (!assigned) {
      this.props.changeTask(subModule, {'assigned': true, page: 1})
    }
  }
  changePage = (pageObj) => {
    let page = pageObj.current
    this.props.changeTask(subModule, {'page': page})
  }
  changeSchool = (v) => {
    let {schoolId} = this.props
    if (v === schoolId) {
      return
    }
    this.props.changeTask(subModule, {'schoolId': v})
  }
  render () {
    const {all, pending, sourceType, page, assigned, schoolId} = this.props
    const {dataSource, total, loading} = this.state

    return (
      <div className='taskPanelWrapper'>
        <div className='phaseLine'>
          <div className='block'>        
            <div className='navLink'>
              <a href='' className={assigned ? '' : 'active'} onClick={this.toNa} >待处理</a>
              <a href='' className={assigned ? 'active' : ''} onClick={this.toAssigned} >处理中</a>
              <a href='' className={assigned ? 'active' : ''} onClick={this.toAssigned} >已完结</a>
            </div>
            <div className='task-select'>
              <SchoolSelector
                className='select-item'
                selectedSchool={schoolId}
                changeSchool={this.changeSchool}
              />
              <BasicSelectorWithoutAll 
                className='select-item'
                selectedOpt={all} 
                staticOpts={TARGETS} 
                changeOpt={this.changeDivision} 
              />
            </div>
          </div>
          <div className='block'>
            <Button type='primary' className='rightBtn'>创建工单</Button>
          </div>
        </div>

        <div className='task-queryPanel'>
          <div className='task-queryLine'>
            <div className='block'>
              <span>等待时间:</span>
              <ul className='checkSelect'>
                <li className='active'>不限</li>
                <li>1天以内</li>
                <li>7天以内</li>
                <li>超过1天</li>
                <li>超过2天</li>
                <li>超过5天</li>
              </ul>
              <RangeSelect
                className='task-rangeSelect'
              />
            </div>
            <div className='block'>
              <SearchInput
                placeHolder='工单编号'
                searchingText=''
                pressEnter={this.searchEnter}
                changeSearch={this.changeSearch}
              />
            </div>
          </div>

          <div className='task-queryLine'>
            <div className='block'>
              <span>任务类型:</span>
              <ul  className='checkSelect'>
                <li>不限</li>
                <li>报修</li>
                <li>账单投诉</li>
                <li>意见反馈</li>
              </ul>
            </div>
            <div className='block'>
              <span>当前工单总条数:</span>
            </div>
          </div>
        </div>



        <div className='navLink'>
          <a href='' className={assigned ? '' : 'active'} onClick={this.toNa} >待处理的任务</a>
          <a href='' className={assigned ? 'active' : ''} onClick={this.toAssigned} >已指派的任务</a>
        </div>
        <SearchLine 
          selector1={
            <SchoolSelector
              selectedSchool={schoolId}
              changeSchool={this.changeSchool}
            />
          }
          selector2={<BasicSelector selectedOpt={sourceType} staticOpts={TYPES} allTitle='所有任务类型' changeOpt={this.changeType} />}
          selector3={<BasicSelector selectedOpt={pending} staticOpts={PENDINGS} allTitle='所有等待时长' changeOpt={this.changePending} />}
          selector4={<BasicSelectorWithoutAll selectedOpt={all} staticOpts={TARGETS} changeOpt={this.changeDivision} />} 
        />

        <div className='tableList'>
          <Table 
            bordered
            loading={loading}
            rowKey={(record)=>(record.id)} 
            pagination={{pageSize: SIZE, current: page, total: total}}  
            dataSource={dataSource} 
            columns={this.columns} 
            onChange={this.changePage}
          />
        </div>
      </div>
    )
  }
}

// export default TaskList

const mapStateToProps = (state, ownProps) => ({
  assigned: state.changeTask[subModule].assigned,
  all: state.changeTask[subModule].all,
  pending: state.changeTask[subModule].pending,
  sourceType: state.changeTask[subModule].sourceType,
  page: state.changeTask[subModule].page,
  schoolId: state.changeTask[subModule].schoolId
})

export default withRouter(connect(mapStateToProps, {
  changeTask
})(TaskList))