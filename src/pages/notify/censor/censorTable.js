import React from 'react'
import {Link} from 'react-router-dom'

import {Table, Popconfirm} from 'antd'

import Noti from '../../noti'
import Time from '../../component/time'
import AjaxHandler from '../../ajax'
import SearchLine from '../../component/searchLine'
import BasicSelector from '../../component/basicSelector'
import CONSTANTS from '../../component/constants'
import Format from '../../component/format'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeNotify } from '../../../actions'
const subModule = 'censor'

const SIZE = CONSTANTS.PAGINATION
const NOTIFYTYPES = CONSTANTS.NOTIFYTYPES

//const Table = asyncComponent(() => import(/* webpackChunkName: "table" */ "antd/lib/table"))
//const Button = asyncComponent(() => import(/* webpackChunkName: "button" */ "antd/lib/button"))
//const Popconfirm = asyncComponent(() => import(/* webpackChunkName: "popconfirm" */ "antd/lib/popconfirm"))
//const Modal = asyncComponent(() => import(/* webpackChunkName: "modal" */ "antd/lib/modal"))

class NotifyTable extends React.Component {
  static propTypes = {
    page: PropTypes.number.isRequired
  }
  constructor (props) {
    super(props)
    const dataSource = []
    this.state = {
      dataSource: dataSource,
      loading: false,
      total: 0,
    }
    this.columns = [{
      title: '公告类型',
      dataIndex: 'type',
      width: '15%',
      className: 'firstCol',
      render: (text,record)=>(CONSTANTS.NOTIFYTYPES[record.type])
    }, {
      title: '公告内容',
      dataIndex: 'content',
    }, {
      title: '公告对象/期限',
      width: '18%',
      render: (text,record)=>{
        if (record.type === 3) {
          let listeners = `${record.mobiles[0]}等${record.mobiles.length}名用户`
          return listeners
        } else if (record.type === 2) {
          if (record.schoolRange === 1) {
            return '所有学校'
          } else {
            return (record.schoolNames && record.schoolNames[0]) || '暂无'
          }
        } else {
          if (record.schoolRange === 1) {
            return '所有学校/' + (record.endTime < Date.parse(new Date()) ? '已过期' : Time.showDate(record.endTime) )
          } else {
            let names = record.schoolNames.map((name, index) => (<span key='index'>{name}</span>))
            return (
              <span>
                {record.schoolNames ? names : '暂无'}
                <span>{'/' + Time.showDate(record.endTime)}</span>
              </span>
            )
          }
        }
      }
    }, {
      title: '创建时间',
      dataIndex: 'createTime',
      width: '12%',
      render: (text, record) => (Time.getTimeStr(record.createTime))
    }, {
      title: '创建人',
      dataIndex: 'creatorName',
      width: '10%',
      render: (text) => (text || '未知')
    }, {
      title: '公告状态',
      dataIndex: 'status',
      width: '10%',
      render: (text, record) => (CONSTANTS.NOTIFYSTATUS[record.status] || '未知')
    }, {
      title: (<p className='lastCol'>操作</p>),
      dataIndex: 'operation',
      width: '10%',
      render: (text, record, index) => (
        <div className='editable-row-operations lastCol'>
          <span>
            <Link to={`/notify/censor/info/:${record.id}`}>详情</Link>
          </span>
        </div>
      )
    }]
  }
  
  fetchData = (body) => {
    this.setState({
      loading: true
    })
    let resource='/api/notify/list'
    const cb = (json) => {
      let nextState = {loading: false}
      if(json.error){
        throw new Error(json.error.displayMessage || json.error)
      }else{
        /*--------redirect --------*/
        if(json.data){
          nextState.dataSource = json.data.notices
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
    let {page} = this.props
    const body={
      page: page,
      size: SIZE,
      status: [3, 4]
    }
    this.fetchData(body)
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  delete = (e,id) => {
    e.preventDefault()
    let resource='/api/notify/delete'
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
              size: SIZE,
              status: [3, 4]
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
      size: SIZE,
      status: [3, 4]
    }
    this.fetchData(body)
  }
  changePage = (pageObj) => {
    let page = pageObj.current
    this.props.changeNotify(subModule, {page: page})
  }
  render () {
    const {dataSource, total, loading} = this.state
    const {page} = this.props

    return (
      <div className='contentArea'>

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

const mapStateToProps = (state, ownProps) => {
  return {
    page: state.changeNotify[subModule].page
  }
}

export default withRouter(connect(mapStateToProps, {
 changeNotify 
})(NotifyTable))
// export default NotifyTable
