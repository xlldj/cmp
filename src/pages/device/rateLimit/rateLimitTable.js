import React from 'react'
import {Link} from 'react-router-dom'

import {Table, Popconfirm} from 'antd'

import Noti from '../../noti'
import AjaxHandler from '../../ajax'
import SearchLine from '../../component/searchLine'
import CONSTANTS from '../../component/constants'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeDevice } from '../../../actions'
const subModule = 'rateLimit'

const SIZE = CONSTANTS.PAGINATION

class RateLimitTable extends React.Component {
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
      className: 'firstCol',
      width: '25%'
    },{
      title: '设备类型',
      dataIndex: 'deviceType',
      width: '25%',
      render: (text,record) => (CONSTANTS.DEVICETYPE[record.deviceType])
    }, {
      title: '扣费速率',
      dataIndex: 'money',
      render: (text,record,index) => (`${record.time}秒/${record.money}`)
    }, {
      title: (<p className='lastCol'>操作</p>),
      dataIndex: 'operation',
      width: '25%',
      render: (text, record, index) => (
        <div className='editable-row-operations lastCol'>
          <span>
            <Link to={`/device/rateLimit/editRateLimit/:${record.id}`}>编辑</Link>
            <span className='ant-divider' />
            <Popconfirm title="确定要删除么?" onConfirm={(e) => {this.delete(e,record.id)}} onCancel={this.cancelDelete} okText="确认" cancelText="取消">
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
    let resource='/order/limit/list'
    const cb = (json) => {
      let nextState = {loading: false}
      if(json.error){
        Noti.hintServiceError(json.error.displayMessage)
      }else{
        if(json.data){
          let data = JSON.parse(JSON.stringify(json.data))
          nextState.dataSource = data
          nextState.total = json.data.total
        }else{
          this.setState(nextState)
          throw new Error('网络出错，请稍后重试～')
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  componentDidMount(){
    this.props.hide(false)
    let {page} = this.props
    const body = {
      page: page,
      size: SIZE
    }
    this.fetchData(body)
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  componentWillReceiveProps (nextProps) {
    let {page} = nextProps
    const body = {
      page: page,
      size: SIZE
    }
    this.fetchData(body)
  }
  delete = (e, id) => {
    e.preventDefault()
    let resource = ''
    const body = {
      id: id
    }
    const cb = (json) => {
      if(json.error){
        throw new Error(json.error.displayMessage || json.error)
      }else{
        /*--------redirect --------*/
        if(json.data){
          const body = {
            page: this.props.page,
            size: SIZE
          }
          this.fetchData(body)
        }else{
          Noti.hintLock('当前项不能被删除','请咨询相关人员！')
        }        
      }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  cancelDelete = () => {
    // nothing
  }
  changePage = (pageObj) => {
    let page = pageObj.current
    this.props.changeDevice(subModule, {page: page})
  }

  render () {
    let {loading, total} = this.state
    const {page} = this.props

    return (
      <div className='contentArea'>
        <SearchLine addTitle='添加扣费速率' addLink='/device/rateLimit/addRateLimit' />

          <div className='tableList'>
            <Table bordered loading={loading} rowKey={(record)=>(record.id)} pagination={{pageSize: SIZE, current: page, total: total}} onChange={this.changePage}  dataSource={this.state.dataSource} columns={this.columns} />
          </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  page: state.changeDevice[subModule].page
})

export default withRouter(connect(mapStateToProps, {
  changeDevice
})(RateLimitTable))