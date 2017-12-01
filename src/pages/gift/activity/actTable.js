import React from 'react'
import { Link} from 'react-router-dom'

import Table from 'antd/lib/table'
import Select from 'antd/lib/select'
import Badge from 'antd/lib/badge'
import Popconfirm from 'antd/lib/popconfirm'

import Noti from '../../noti'
import AjaxHandler from '../../ajax'
import CONSTANTS from '../../component/constants'
import SearchLine from '../../component/searchLine'
import SchoolSelector from '../../component/schoolSelector'
import Time from '../../component/time'


import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeGift } from '../../../actions'
const subModule = 'act'

const Option = Select.Option
const typeName = CONSTANTS.GIFTACTTYPE
const STATUS ={
  3:'是',
  2:'否',
  1:'已过期'
}
const HINTSTATUS ={
  3:'success',
  2:'default',
  1:'error'
}
const SIZE = CONSTANTS.PAGINATION

class ActTable extends React.Component {
  static propTypes = {
    schoolId: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired
  }
  constructor(props){
    super(props)
    let dataSource=[]
    this.state = {
      dataSource,
      loading: false,
      total: 0
    }

    this.columns = [{
      title: '学校名称',
      dataIndex: 'schoolName',
      width: '21%',
      className: 'firstCol'
    }, {
      title: (<p >活动名称</p>),
      dataIndex: 'name',
      width: '12%'
    }, {
      title: (<p >活动类型</p>),
      dataIndex: 'type',
      width: '12%',
      render:(text)=>(typeName[text])
    }, {
      title: (<p >活动创建日期</p>),
      dataIndex: 'updateTime',
      width: '15%',
      render: (text,record,index) => {
        return Time.getTimeStr(record.updateTime)
      }
    }, {
      title: (<p >活动截止日期</p>),
      dataIndex: 'endTime',
      width: '15%',
      render: (text,record,index) => {
        return Time.getDayFormat(record.endTime)
      }
    },{
      title: (<p >上线状态</p>),
      dataIndex: 'online',
      width: '10%',
      render: (text,record,index) => (
        <Badge status={HINTSTATUS[record.online]} text={STATUS[record.online]} />
      )
    },{
      title: (<p >操作</p>),
      dataIndex: 'operation',
      render: (text, record, index) => (
        <div className='editable-row-operations'>
            <Link to={`/gift/act/actInfo/:${record.id}`} >编辑</Link>
            <span className='ant-divider' />
            <Popconfirm title="确定要删除此任务么?" onConfirm={(e) => {this.delete(e,record.id)}} okText="确认" cancelText="取消">
              <a href="#">删除</a>
            </Popconfirm>
        </div>
      ),
      className: 'lastCol'
    }]
  }
  fetchData = (body) => {
    this.setState({
      loading: true
    })
    let resource='/api/gift/activity/list'
    const cb = (json) => {
      let nextState = {loading: false}
      if(json.error){
        throw new Error(json.error.displayMessage || json.error)
      }else{
        /*--------redirect --------*/
        if(json.data){
          nextState.dataSource = json.data.giftActivities
          nextState.total = json.data.total
        }else{
          this.setState(nextState)
          throw new Error('网络出错，请稍后重试～')
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

    let {page, schoolId} = this.props
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    this.fetchData(body)
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  componentWillReceiveProps (nextProps) {
    let {page, schoolId} = nextProps
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    this.fetchData(body)
  }
  changeSchool = (value) => {
    let {schoolId} = this.props
    if (schoolId === value) {
      return
    }
    this.props.changeGift(subModule, {page: 1, schoolId: value})
  }

  delete = (e,id) => {
    e.preventDefault()
    let url = '/api/gift/activity/delete'
    const body = {
      id:id
    }
    const cb = (json) => {
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
          if(json.data){
            const body={
              page: this.props.page,
              size: SIZE
            }
            if(this.state.selectedSchool !== 'all'){
              body.schoolId=parseInt(this.state.selectedSchool, 10)
            }
            this.fetchData(body)
          }else{
            Noti.hintError()
          }   
        }
    }
    AjaxHandler.ajax(url, body, cb)
  }
  changePage = (pageObj) => {
    let page = pageObj.current
    this.props.changeGift(subModule, {page: page})
  }


  render () {
    const {dataSource, total, loading} = this.state
    const {page, schoolId} = this.props

    return (
      <div className='contentArea'>
        <SearchLine addTitle='创建红包活动' addLink='/gift/act/addAct' selector1={<SchoolSelector selectedSchool={schoolId} changeSchool={this.changeSchool} />} />

        <div className='tableList'>
          <Table bordered 
            loading={loading} rowKey={(record)=>(record.id)} 
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

const mapStateToProps = (state, ownProps) => ({
  schoolId: state.changeGift[subModule].schoolId,
  page: state.changeGift[subModule].page
})

export default withRouter(connect(mapStateToProps, {
  changeGift
})(ActTable))

