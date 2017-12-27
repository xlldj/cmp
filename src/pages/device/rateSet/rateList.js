import React from 'react'
import { Link} from 'react-router-dom'

import {Table, Popconfirm} from 'antd'

import AjaxHandler from '../../ajax'
import Noti from '../../noti'
import Time from '../../component/time'
import SearchLine from '../../component/searchLine'
import SchoolSelector from '../../component/schoolSelector'
import CONSTANTS from '../../component/constants'
import { checkObject } from '../../util/checkSame'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeDevice } from '../../../actions'
const subModule = 'rateSet'


const SIZE = CONSTANTS.PAGINATION

const typeName =CONSTANTS.DEVICETYPE

class RateList extends React.Component {
  static propTypes = {
    schoolId: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired
  }
  constructor (props) {
    super(props)
    this.state = {
      dataSource: [],
      loading: false,
      total: 0
    }
    this.columns = [{
      title: '学校',
      dataIndex: 'schoolName',
      className: 'firstCol',
      width: '17%'
    }, {
      title: '设备类型',
      dataIndex: 'deviceType',
      width: '17%',
      render: (text,r) => (typeName[r.deviceType])
    }, {
      title: '费率',
      dataIndex: 'rates',
      width: '32%',
      render: (text, record, index) => {
        const items = record.rateGroups.map((r, i) => (
          <li key={i}>
            <span key={i}>扣费：{r.price ? r.price : ''}分钱 脉冲数：{r.pulse ? r.pulse : ''}个</span>
          </li>
          )
        )
        return (<ul>{items}</ul>)
      }
    }, {
      title: '创建时间',
      dataIndex: 'createTime',
      width: '17%',
      render: (text,r,i) => {
        return Time.getTimeStr(r.createTime)
      }
    }, {
      title: (<p className='lastCol'>操作</p>),
      dataIndex: 'operation',
      width: '17%',
      render: (text, record, index) => (
        <div className='editable-row-operations lastCol'>
          <span>
            <Link to={`/device/rateSet/rateInfo/:${record.id}`}>编辑</Link>
            <span className='ant-divider' />
            <Popconfirm title="确定要删除此么?" onConfirm={(e) => { this.delete(e, record.id) }} okText="确认" cancelText="取消">
              <a href="">删除</a>
            </Popconfirm>
          </span>
        </div>
        )
    }]
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
    if (checkObject(this.props, nextProps, ['page', 'schoolId'])) {
      return
    }
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

  fetchData = (body) => {
    this.setState({
      loading: true
    })
    let resource='/rate/list'
    const cb = (json) => {
      let nextState = {loading: false}
      if(json.error){
        this.setState(nextState)
        throw new Error(json.error.displayMessage || json.error)
      }else{
        /*--------redirect --------*/
        if(json.data){
          nextState.dataSource = json.data.rateDetails
          nextState.total = json.data.total
        }       
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource,body,cb)
  } 
  delete = (e, id) => {
    let resource='/api/rate/delete'
    const body={
      id: id
    }
    const cb = (json) => {
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
          /*--------redirect --------*/
          if(json.data){
            const body={
              page: this.props.page,
              size: SIZE
            }
            this.fetchData(body)
          }else{
            Noti.hintError('当前费率不能被删除！','请联系管理员删除')
          }        
        }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  changePage = (pageObj) => {
    let page = pageObj.current
    this.props.changeDevice(subModule, {page: page})
  }
  changeSchool = (value) => {
    let {schoolId} = this.props
    if (schoolId === value) {
      return
    }
    this.props.changeDevice(subModule, {page: 1, schoolId: value})
  }
  render () {
    let {dataSource, loading, total} = this.state
    let {page, schoolId} = this.props
    return (
      <div className='contentArea'>
        <SearchLine 
          addTitle='创建费率' 
          addLink='/device/rateSet/addRate' 
          selector1={<SchoolSelector selectedSchool={schoolId} changeSchool={this.changeSchool} />} 
        />
        <div className='tableList'>
          <Table bordered loading={loading} rowKey={(record)=>(record.id)} pagination={{pageSize: SIZE, current: page, total: total}} onChange={this.changePage} dataSource={dataSource} columns={this.columns} />
        </div>
        <div />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  page: state.changeDevice[subModule].page,
  schoolId: state.changeDevice[subModule].schoolId
})

export default withRouter(connect(mapStateToProps, {
  changeDevice
})(RateList))
