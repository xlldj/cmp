import React from 'react'
import {Link} from 'react-router-dom'
import {Popconfirm, Table} from 'antd'
import AjaxHandler from '../../ajax'
import Time from '../../component/time'
import Noti from '../../noti'
import CONSTANTS from '../../component/constants'
import SearchLine from '../../component/searchLine'
import BasicSelectorWithoutAll from '../../component/basicSelectorWithoutAll'

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
    page: PropTypes.number.isRequired
  }
  constructor(props){
    super(props)
    let workNotes = []
    this.state = {workNotes, 
      loading: false,
      total: 0
    }
    this.columns = [{
      title: '任务类型',
      className: 'firstCol',
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
      width: '20%'
    }, {
      title: '任务状态',
      dataIndex: 'status',
      width: '20%',
      render: (text, record) => {
        if (record.type === 1) {
          return '无'
        } else {
          return CONSTANTS.REPAIRSTATUS[record.status]
        }
      }
    }, {
      title: '操作',
      dataIndex: 'operation',
      width: '10%',
      className: 'lastCol',
      render: (text, record, index) => {
        return (
          <div className='editable-row-operations'>
      <span>
        <Link to={`/task/log/detail/:${record.id}`}>编辑</Link>
        <span className='ant-divider' />
        <Popconfirm title="确定要删除此么?" onConfirm={(e) => {this.delete(e,record.id)}} okText="确认" cancelText="取消">
          <a href="#">删除</a>
        </Popconfirm>
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
    let {page, all} = this.props
    const body = {
      page: page,
      size: SIZE
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
    let {page, all} = nextProps
    const body = {
      page: page,
      size: SIZE
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
  render(){
    const {workNotes, total, loading} = this.state
    const {page, all} = this.props

    return (
        <div className='contentArea'>

          <SearchLine 
            addTitle='添加工作记录'
            addLink='/task/log/add'
            selector1={<BasicSelectorWithoutAll selectedOpt={all} staticOpts={TARGETS} changeOpt={this.changeDivision} />} 
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
  all: state.changeTask[subModule].all
})

export default withRouter(connect(mapStateToProps, {
 changeTask 
})(TaskLogList))


