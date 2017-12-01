import React from 'react'
import {Link} from 'react-router-dom'
import {Table, Badge} from 'antd'

import Time from '../component/time'
import AjaxHandler from '../ajax'
import CONSTANTS from '../component/constants'
import SearchLine from '../component/searchLine'
import BasicSelector from '../component/basicSelector'
import BasicSelectorWithoutAll from '../component/basicSelectorWithoutAll'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeTask } from '../../actions'
const subModule = 'taskList'

const TYPES = {
  3: '指派任务',
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

const DEVICETYPES = CONSTANTS.DEVICETYPE
const STATUS = CONSTANTS.REPAIRSTATUS
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
    page: PropTypes.number.isRequired
  }
  constructor (props) {
    super(props)
    let dataSource = []
    this.state = { dataSource, 
      loading: false,
      total: 0
    }
    this.columns = [{
      title: '任务类型',
      className: 'firstCol',
      dataIndex: 'sourceType',
      width: '10%',
      render: (text) => (TYPES[text])
    }, {
      title: '任务申请时间',
      dataIndex: 'createTime',
      width: '16%',
      render:(text,record)=>(Time.showDate(text))
    }, {
      title: '任务等待时间',
      dataIndex: 'id',
      width: '16%',
      render: (text,record,index) => (Time.getSpan(record.createTime))
    }, {
      title: '提醒次数',
      dataIndex: 'remind',
      width: '16%'
    },{
      title: '任务分工',
      dataIndex: 'assignName',
      width: '16%',
      render: (text, record) => {
        switch(record.status) {
          case 1:
          case 2:
          case 5:
          case 6:
            return record.csName;
            break;
          case 3:
          case 4:
          case 7:
            return record.assignName;
            break;
          default: 
            return record.csName || '暂无'
        }
      }
    },{
      title: '处理状态',
      dataIndex: 'status',
      width: '16%',
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
              return <Badge status='warning' text='未知' />
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
              <Link to={{pathname: addr, state: 'fromTask'}} >详情</Link>
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
    let {all, assigned, sourceType, pending, page} = this.props
    const body = {
      page: page,
      size: SIZE,
      assigned: assigned
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
    let {all, assigned, sourceType, pending, page} = this.props
    const body = {
      page: page,
      size: SIZE,
      assigned: assigned
    }
    // console.log(all === '1')
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
    let {all, assigned, sourceType, pending, page} = nextProps
    const body = {
      page: page,
      size: SIZE,
      assigned: assigned
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
  render () {
    const {all, pending, sourceType, page, assigned, test} = this.props
    const {dataSource, total, loading} = this.state

    return (
      <div className='contentArea'>
        <div className='navLink'>
          <a href='#' className={assigned ? '' : 'active'} onClick={this.toNa} >待处理的任务</a>
          <a href='#' className={assigned ? 'active' : ''} onClick={this.toAssigned} >已指派的任务</a>
        </div>
        <SearchLine 
          selector1={<BasicSelector selectedOpt={sourceType} staticOpts={TYPES} allTitle='所有任务类型' changeOpt={this.changeType} />}
          selector2={<BasicSelector selectedOpt={pending} staticOpts={PENDINGS} allTitle='所有等待时长' changeOpt={this.changePending} />}
          selector3={<BasicSelectorWithoutAll selectedOpt={all} staticOpts={TARGETS} changeOpt={this.changeDivision} />} 
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
  assigned: state.changeTask.taskList.assigned,
  all: state.changeTask.taskList.all,
  pending: state.changeTask.taskList.pending,
  sourceType: state.changeTask.taskList.sourceType,
  page: state.changeTask.taskList.page
})

export default withRouter(connect(mapStateToProps, {
  changeTask
})(TaskList))