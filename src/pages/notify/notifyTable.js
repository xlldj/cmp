import React from 'react'
import {Link} from 'react-router-dom'

import {Table, Popconfirm} from 'antd'

import Noti from '../noti'
import Time from '../component/time'
import AjaxHandler from '../ajax'
import SearchLine from '../component/searchLine'
import BasicSelector from '../component/basicSelector'
import CONSTANTS from '../component/constants'
import {checkObject} from '../util/checkSame'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeNotify } from '../../actions'

const SIZE = CONSTANTS.PAGINATION
const NOTIFYTYPES = CONSTANTS.NOTIFYTYPES

//const Table = asyncComponent(() => import(/* webpackChunkName: "table" */ "antd/lib/table"))
//const Button = asyncComponent(() => import(/* webpackChunkName: "button" */ "antd/lib/button"))
//const Popconfirm = asyncComponent(() => import(/* webpackChunkName: "popconfirm" */ "antd/lib/popconfirm"))
//const Modal = asyncComponent(() => import(/* webpackChunkName: "modal" */ "antd/lib/modal"))

class NotifyTable extends React.Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
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
            let names = record.schoolNames.map((name, index) => (<span className={record.schoolNames.length > 1 ? 'inlineItem' : ''} key={index}>{name}</span>))
            return record.schoolNames ? names : '暂无'
          }
        } else {
          if (record.schoolRange === 1) {
            return '所有学校/' + (record.endTime < Date.parse(new Date()) ? '已过期' : Time.getDayFormat(record.endTime) )
          } else {
            let names = record.schoolNames.map((name, index) => (<span className={record.schoolNames.length > 1 ? 'inlineItem' : ''} key={index}>{name}</span>))
            return (
              <span>
                {record.schoolNames ? names : '暂无'}
                <span>{'/' + Time.getDayFormat(record.endTime)}</span>
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
      title: (<p className='lastCol'>操作</p>),
      dataIndex: 'operation',
      width: '10%',
      render: (text, record, index) => (
        <div className='editable-row-operations lastCol'>
          <span>
            <Link to={`/notify/list/notifyInfo/:${record.id}`}>编辑</Link>
            <span className='ant-divider' />
            <Popconfirm title="确定要删除此么?" onConfirm={(e) => {this.delete(e,record.id)}} okText="确认" cancelText="取消">
              <a href="">删除</a>
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
    let {page, type} = this.props
    const body={
      page: page,
      size: SIZE,
      status: [1, 2]
    }
    if (type !== 'all') {
      body.type = parseInt(type, 10)
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
              status: [1, 2]
            }
            if (this.props.type !== 'all') {
              body.type = parseInt(this.props.type, 10)
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
    if (checkObject(this.props, nextProps, ['page', 'type'])) {
      return
    }
    let {page, type} = nextProps
    const body = {
      page: page,
      size: SIZE,
      status: [1, 2]
    }
    if (type !== 'all') {
      body.type = type
    }
    this.fetchData(body)
  }
  changeType = (v) => {
    let {type} = this.props
    if (type === v) {
      return
    }
    this.props.changeNotify('notify', {type: v, page: 1})
  }
  changePage = (pageObj) => {
    let page = pageObj.current
    this.props.changeNotify('notify', {page: page})
  }
  render () {
    const {dataSource, total, loading} = this.state
    const {type, page} = this.props

    return (
      <div className='contentArea'>
        <SearchLine addTitle='发布公告/消息' addLink='/notify/list/addNotify'
          selector1={<BasicSelector selectedOpt={type} changeOpt={this.changeType} allTitle='全部类型' staticOpts={NOTIFYTYPES} />}
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

const mapStateToProps = (state, ownProps) => {
  return {
    type: state.changeNotify.notify.type,
    page: state.changeNotify.notify.page
  }
}

export default withRouter(connect(mapStateToProps, {
 changeNotify 
})(NotifyTable))
// export default NotifyTable
