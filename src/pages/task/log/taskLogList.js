import React from 'react'
import {Link} from 'react-router-dom'
import {Table, Badge} from 'antd'
import AjaxHandler from '../../ajax'
import Time from '../../component/time'
import Noti from '../../noti'
import CONSTANTS from '../../component/constants'
import SearchLine from '../../component/searchLine'
import SchoolSelector from '../../component/schoolSelector'
import BasicSelectorWithoutAll from '../../component/basicSelectorWithoutAll'
import {checkObject} from '../../util/checkSame'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeTask } from '../../../actions'
const subModule = 'log'

/*------后端接受的all为true/false,必传，post之前将0，1转为true/false---------*/
const TARGETS = {
  1: '我的任务',
  2: '所有客服任务'
}
const SIZE = CONSTANTS.PAGINATION
class TaskLogList extends React.Component {
  static propTypes = {
    all: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired,
    schoolId: PropTypes.string.isRequired
  }
  constructor(props){
    super(props)
    let workNotes = []
    this.state = {workNotes, 
      loading: false,
      total: 0
    }
    this.columns = [{
      title: '学校',
      className: 'firstCol',
      dataIndex: 'schoolName',
      width: '14%'
    }, {
      title: '任务类型',
      dataIndex: 'type',
      width: '10%',
      render: (text, record) => (CONSTANTS.CREATEWORKTYPE[record.type])
    },{
      title: '一句话描述',
      dataIndex: 'brief',
      width: '20%'
    }, {
      title: '创建时间',
      dataIndex: 'createTime',
      width: '20%',
      render:(text,record)=>(Time.showDate(text))
    }, {
      title: '创建人',
      dataIndex: 'username',
      width: '10%'
    }, {
      title: '任务状态',
      dataIndex: 'status',
      width: '10%',
      render: (text, record) => {
        if (record.type === 1) {
          return '无'
        } else {
          switch(record.status){
            case 7:
              return <Badge status='success' text='已完成' />
            case 3:
              return <Badge status='warning' text='已指派' />
            case 4:
              return <Badge status='warning' text='已接受' />
            case 1:
              return <Badge status='error' text='待审核' />
            case 2:
              return <Badge status='error' text='待指派' />
            case 5:
              return <Badge status='error' text='未通过' />
            case 6:
              return <Badge status='error' text='已指派被拒绝' />
          }
        }
      }
    }, {
      title: '操作',
      dataIndex: 'operation',
      className: 'lastCol',
      render: (text, record, index) => {
        return (
          <div className='editable-row-operations'>
      <span>
        <Link to={`/task/log/detail/:${record.id}`}>详情</Link>
      </span>
          </div>
        )
      }
    }]
  }
  fetchData = (body)=>{
    this.setState({
      loading: true
    })
    let resource = '/api/work/note/list'
    const cb = (json) => {
      let nextState = {loading: false}
      if(json.error){
        this.setState(nextState)
        throw new Error(json.error)
      }else{     
        let workNotes = json.data.workNotes
        nextState.workNotes = workNotes
        nextState.total = json.data.total
        if (body.page === 1) {
          nextState.page = 1
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource,body,cb, this.errorHandler)
  }
  errorHandler = () => {
    this.setState({
      loading: false
    })
  }
  componentDidMount(){
    this.props.hide(false)
    let {page, all, schoolId} = this.props
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if (all === '1') {
      body.all = false
    } else {
      body.all = true
    }
    this.fetchData(body)
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  componentWillReceiveProps (nextProps) {
    if (checkObject(this.props, nextProps, ['page', 'all', 'schoolId'])) {
      return
    }
    let {page, all, schoolId} = nextProps
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if (all === '1') {
      body.all = false
    } else {
      body.all = true
    }
    this.fetchData(body)
  }
  changeDivision = (v)=> {
    let {all} = this.props
    if (all === v) {
      return 
    }
    this.props.changeTask(subModule, {page: 1, all: v})
  }
  delete = (e,id) => {
    let resource = '/api/work/note/delete'
    const body = {
      id: id
    }
    const cb = (json) => {
      if(json.error){
        throw new Error(json.error)
      }else{
        if(json.data){
          let data = {
            page: this.props.page,
            size: SIZE
          }
          if (this.props.schoolId !== 'all') {
            data.schoolId = parseInt(this.props.schoolId, 10)
          }
          if (this.props.all === '1') {
            data.all = false
          } else {
            data.all = true
          }
          this.fetchData(data)
        }else{
          Noti.hintError(json.error.displayMessage || json.error)
        }
      }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  addWorkNote = () => {
    this.props.history.push('/task/log/add')
  }
  changePage = (pageObj) => {
    let page = pageObj.current
    this.props.changeTask(subModule, {page: page})
  }
  changeSchool = (v) => {
    let schoolId = this.props.schoolId
    if (v !== schoolId) {
      this.props.changeTask(subModule, {schoolId: v})
    }
  }
  render(){
    const {workNotes, total, loading} = this.state
    const {page, all, schoolId} = this.props

    return (
        <div className='contentArea'>

          <SearchLine 
            addTitle='添加工作记录'
            addLink='/task/log/add'
            selector1={
              <SchoolSelector
                selectedSchool={schoolId}
                changeSchool={this.changeSchool}
              />
            }
            selector2={<BasicSelectorWithoutAll selectedOpt={all} staticOpts={TARGETS} changeOpt={this.changeDivision} />} 
          />

          <div className='tableList'>
            <Table 
              bordered
              loading={loading}
              rowKey={(record)=>(record.id)} 
              pagination={{pageSize: SIZE, current: page, total: total}}  
              dataSource={workNotes} 
              columns={this.columns} 
              onChange={this.changePage}
            />
          </div>
        </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  page: state.changeTask[subModule].page,
  all: state.changeTask[subModule].all,
  schoolId: state.changeTask[subModule].schoolId
})

export default withRouter(connect(mapStateToProps, {
 changeTask 
})(TaskLogList))


