import React from 'react'
import {Link} from 'react-router-dom'
import {asyncComponent} from '../../component/asyncComponent'

import {Table, Popconfirm} from 'antd'

import Noti from '../../noti'
import Time from '../../component/time'
import AjaxHandler from '../../ajax'
import SearchLine from '../../component/searchLine'
import CONSTANTS from '../../component/constants'
import Format from '../../component/format'


import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeFund } from '../../../actions'
const subModule = 'cashtime'

const SIZE = CONSTANTS.PAGINATION

//const Table = asyncComponent(() => import(/* webpackChunkName: "table" */ "antd/lib/table"))
//const Button = asyncComponent(() => import(/* webpackChunkName: "button" */ "antd/lib/button"))
//const Popconfirm = asyncComponent(() => import(/* webpackChunkName: "popconfirm" */ "antd/lib/popconfirm"))
//const Modal = asyncComponent(() => import(/* webpackChunkName: "modal" */ "antd/lib/modal"))

class CashtimeTable extends React.Component {
  static propTypes = {
    page: PropTypes.number.isRequired
  }
  constructor (props) {
    super(props)
    const dataSource = []
    this.state = {
      dataSource: dataSource,
      loading: false,
      total: 0
    }
    this.columns = [{
      title: '学校',
      dataIndex: 'schoolName',
      width: '15%',
      className: 'firstCol'
    }, {
      title: '提现时间',
      render: (text,record) => {
        if (record.type === 1) {
          return (
            <span>每周{CONSTANTS.WEEKDAYS[record.fixedTime.startTime.weekday]}{Format.hourMinute(record.fixedTime.startTime.time)}~每周{CONSTANTS.WEEKDAYS[record.fixedTime.endTime.weekday]}{Format.hourMinute(record.fixedTime.endTime.time)}</span>
          )
        } else {
          return (
            <span>{Time.showDate(record.specificTime.startTime)}~{Time.showDate(record.specificTime.endTime)}</span>
          )
        }
      }
    }, {
      title: (<p className='lastCol'>操作</p>),
      dataIndex: 'operation',
      width: '10%',
      render: (text, record, index) => (
        <div className='editable-row-operations lastCol'>
          <span>
            <Link to={`/fund/cashtime/editCashtime/:${record.id}`}>编辑</Link>
            <span className='ant-divider' />
            <Popconfirm title="确定要删除此么?" onConfirm={(e) => {this.delete(e,record.id)}} okText="确认" cancelText="取消">
              <a href="#">删除</a>
            </Popconfirm>
          </span>
        </div>
      )
    }]
  }
  fetchData = (body) => {
    this.setState({
      loading: true
    })
    let resource='/api/time/range/withdraw/list'
    const cb = (json) => {
      let nextState = {loading: false}
      if(json.error){
        throw new Error(json.error.displayMessage || json.error)
      }else{
        /*--------redirect --------*/
        if(json.data){
          nextState.dataSource = json.data.withdrawTimeRanges
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
    const body={
      page: this.props.page,
      size: SIZE
    }
    this.fetchData(body)
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  delete = (e,id) => {
    e.preventDefault()
    let resource='/api/time/range/withdraw/delete'
    const body = {
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
            Noti.hintError('当前项不能被删除','请咨询相关人员！')
          }        
        }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  componentWillReceiveProps (nextProps) {
    let {page} = nextProps
    const body = {
      page: page,
      size: SIZE
    }
    this.fetchData(body)
  }
  changePage = (pageObj) => {
    let page = pageObj.current
    this.props.changeFund(subModule, {page: page})
  }
  render () {
    let {page, total, loading} = this.state
    return (
      <div className='contentArea'>
        <SearchLine addTitle='添加提现时间' addLink='/fund/cashtime/addCashtime' />

          <div className='tableList'>
            <Table bordered
              loading={loading} rowKey={(record)=>(record.id)} 
              pagination={{pageSize: SIZE, current: page, total: total}}    dataSource={this.state.dataSource} 
              columns={this.columns} 
              onChange={this.changePage} />
          </div>
      </div>
    )
  }
}


const mapStateToProps = (state, ownProps) => ({
  page: state.changeFund[subModule].page
})

export default withRouter(connect(mapStateToProps, {
  changeFund
})(CashtimeTable))
