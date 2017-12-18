import React from 'react'
import {Link} from 'react-router-dom'

import {Table, Popconfirm, Modal, Carousel, Badge} from 'antd'

import Noti from '../../noti'
import Time from '../../component/time'
import AjaxHandler from '../../ajax'
import CONSTANTS from '../../component/constants'
import SearchLine from '../../component/searchLine'
import SchoolSelector from '../../component/schoolSelector'
import BasicSelector from '../../component/basicSelector'
import {checkObject} from '../../util/checkSame'


import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeTask } from '../../../actions'
const subModule = 'complaint'

const HANDLESTATUS = {
  2: '已回复',
  1: '未回复'
}
const STATUSCLASS = {
  1: 'error',
  2: 'success'
}
const ORDERTYPES = {
  1: '热水器',
  2: '饮水机',
  3: '充值',
  4: '提现'
}

const whr = window.screen.height / window.screen.width
const SIZE = CONSTANTS.PAGINATION
//const Table = asyncComponent(() => import(/* webpackChunkName: "table" */ "antd/lib/table"))
//const Button = asyncComponent(() => import(/* webpackChunkName: "button" */ "antd/lib/button"))
//const Popconfirm = asyncComponent(() => import(/* webpackChunkName: "popconfirm" */ "antd/lib/popconfirm"))
//const Modal = asyncComponent(() => import(/* webpackChunkName: "modal" */ "antd/lib/modal"))

class ComplaintTable extends React.Component {
  static propTypes = {
    status: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired,
    selectKey: PropTypes.string.isRequired,
    schoolId: PropTypes.string.isRequired
  }
  constructor (props) {
    super(props)
    const dataSource = []
    this.state = {
      dataSource: dataSource,
      showImgs: false,
      editing: 0,
      initialSlide: 0,
      messageVisible: false,
      message: '',
      messageEmpty: false,
      orderId: 0,
      loading: false,
      total: 0,
      settleStatus: 1,
      searchingText: '',
      confirmClickable: true,
      replying: false
    }
    this.columns = [{
      title: '学校',
      className: 'firstCol',
      dataIndex: 'schoolName',
      width: '10%'
    }, {
      title: '投诉类型',
      dataIndex: 'orderType',
      width: '8%',
      render: (text,record)=>(CONSTANTS.COMPLAINTTYPES[record.orderType])
    }, {
      title: '订单/流水号',
      dataIndex: 'orderNo',
      width: '10%',
      render: (text, record) => {
        if (record.orderType === 1 || record.orderType === 2) {
          return (
            <Link className='outLink' to={{pathname:`/order/list/orderInfo/:${record.orderId}`,state:{path: 'fromComplaint'}}} >{text}</Link> 
          )
        } else {
          return (
            <Link className='outLink' to={{pathname:`/fund/list/fundInfo/:${record.orderId}`,state:{path: 'fromComplaint'}}} >{text}</Link>
          )
        }
      }
    }, {
      title: '投诉用户',
      dataIndex: 'mobile',
      width: '10%',
      render: (text, record) => (
        <Link className='outLink' to={{pathname:`/user/userInfo/:${record.userId}`,state:{path: 'fromComplaint'}}} >{text}</Link>
      )
    },{
      title: '投诉内容',
      dataIndex: 'content',
      width: '12%'
    },{
      title: '图片',
      dataIndex: 'images',
      width: '13%',
      render: (text, record, index) => {
        let imagelis = record.images.map((r, i) => (
          <li className='thumbnail' key={i} >
            <img src={CONSTANTS.FILEADDR + r} alt='' onClick={() => {this.showModel(index, i)}} onLoad={this.setWH} />
          </li>
        ))
        return (
          <ul className='thumbnailWrapper'>
            {imagelis}
          </ul>
        )
      }
    },{
      title: '投诉时间',
      dataIndex: 'createTime',
      width: '12%',
      render: (text, record) => (record.createTime ? Time.getTimeStr(record.createTime) : '暂无')
    },{
      title: '客服操作状态',
      dataIndex: 'status',
      width: '10%',
      render: (text, record) => (<Badge text={(record.settleStatus && HANDLESTATUS[record.settleStatus]) || '暂无'} status={record.settleStatus&&STATUSCLASS[record.settleStatus]} />)
    },{
      title: (<p className='lastCol'>操作</p>),
      dataIndex: 'operation',
      render: (text, record, index) => (
        <div className='editable-row-operations lastCol operationCol'>
          <a onClick={() => {this.replyMessage(record.id)}} className={record.settleStatus === 2 ? 'inactive' : ''}>消息回复</a>
          <span className='ant-divider' />
          <Popconfirm title="确定已回复么?" onConfirm={(e) => {this.setReply(e,record.id)}} okText="确认" cancelText="取消">
            <a href=""  className={record.settleStatus === 2 ? 'inactive' : ''}>电话回复</a>
          </Popconfirm>
        </div>
      )
    }]
  }
  showModel = (index, i) => {
    this.setState({
      editing: index,
      initialSlide: i,
      showImgs: true
    })
  }
  setReply = (e, id) => {
    if (this.state.replying) {
      return
    }

    this.setState({
      replying: true
    })
    let dataSource = JSON.parse(JSON.stringify(this.state.dataSource))
    let order = dataSource.find((r) => (r.id === id))
    let resource = '/complaint/settle'
    const body = {
      id: id,
      settleType: 2
    }
    const cb = (json) => {
      const nextState = {
        replying: false
      }
      if (json.data.result) {
        order.settleStatus = 2
        nextState.dataSource = dataSource
      } else {
        Noti.hintServiceError(json.data.failReason)
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  fetchData = (body) => {
    this.setState({
      loading: true
    })
    let resource='/complaint/list'
    const cb = (json) => {
      let nextState = {
        loading: false
      }
      if(json.error){
        this.setState(nextState)
        throw new Error(json.error.displayMessage || json.error)
      }else{
        /*--------redirect --------*/
        if(json.data){
          nextState.dataSource = json.data.complaints
          nextState.total = json.data.total
          if (body.page === 1) {
            nextState.page = 1
          }
        }else{
          throw new Error('网络出错，请稍后重试～')
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  componentDidMount(){
    this.props.hide(false)
    let {page, status, type, selectKey, schoolId} = this.props
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if (status !== 'all') {
      body.status = parseInt(status, 10)
    }
    if (type !== 'all') {
      body.type = parseInt(type, 10)
    }
    if (selectKey) {
      body.selectKey = selectKey
      this.setState({
        searchingText: selectKey
      })
    }
    this.fetchData(body)
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  componentWillReceiveProps (nextProps) {
    if (checkObject(this.props, nextProps, ['page', 'status', 'type', 'selectKey', 'schoolId'])) {
      return
    }
    let {page, status, type, selectKey, schoolId} = nextProps
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if (type !== 'all') {
      body.orderType = parseInt(type, 10)
    }
    if (status !== 'all') {
      body.settleStatus = parseInt(status, 10)
    }
    if (selectKey) {
      body.selectKey = selectKey
    }
    this.fetchData(body)
  }
  setWH = (e) => {
    let img = e.target
    let w = parseInt(window.getComputedStyle(img).width, 10)
    let h = parseInt(window.getComputedStyle(img).height, 10)
    if (w < h) {
      img.style.width = '100%'
    } else {
      img.style.height = '100%'
    }
  }
  loadImgDetail = (e) => {
    let img = e.target
    let w = parseInt(window.getComputedStyle(img).width, 10)
    let h = parseInt(window.getComputedStyle(img).height, 10)
    let imgWhr = h / w
    if (imgWhr < whr) {
      img.style.width = '100%'
    } else {
      img.style.height = '100%'
    }
  }
  closeImgs = (e) => {
    this.setState({
      showImgs: false,
      initialSlide: 0
    })
  }
  replyMessage = (id) => {
    this.setState({
      messageVisible: true,
      orderId: id
    })
  }
  changeMessage = (e) => {
    this.setState({
      message: e.target.value
    })
  }
  checkMessage = (e) => {
    let v = e.target.value.trim()
    if (!v) {
      this.setState({
        messageEmpty: true
      })
    } else {
      this.setState({
        message: v,
        messageEmpty: false
      })
    }
  }
  postMessage = (e) => {
    // post the message to server
    let {message, messageEmpty, orderId, confirmClickable} = this.state 

    /* if confirmClickable is false, do nothing */
    if (!confirmClickable) {
      return
    }

    if (messageEmpty || !message) {
      return this.setState({
        messageEmpty: true
      })
    }
    let dataSource = JSON.parse(JSON.stringify(this.state.dataSource))
    let order = dataSource.find((r) => (r.id === orderId))
    let resource = '/complaint/settle'
    const body = {
      content: message,
      id: orderId,
      settleType: 1
    }
    const cb = (json) => {
      const nextState = {
        confirmClickable: true
      }
      if (json.error) {
        Noti.hintAndClick('回复出错', json.error.displayMessage || '请稍后重试', null)
      } else {
        if (json.data.result) {
          order.settleStatus = 2
          nextState.messageVisible = false
          nextState.dataSource = dataSource
          nextState.message = ''
          Noti.hintOk('回复成功', '回复成功')
        } else {
          Noti.hintAndClick('回复出错', json.data.failReason || '请稍后重试', null)
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
    /* forbid repeatly send message */
    this.setState({
      confirmClickable: false
    })
  }
  cancelPost = () => {
    this.setState({
      messageVisible: false,
      message: '',
      messageEmpty: false
    })
  }
  changePage = (pageObj) => {
    let page = pageObj.current
    this.props.changeTask('complaint', {'page': page})
  }
  changeType = (v) => {
    let {type} = this.props
    if (type === v) {
      return
    }
    this.props.changeTask('complaint', {'type': v, page: 1})
  }
  changeStatus = (v) => {
    let {status} = this.props
    if (status === v) {
      return
    }
    this.props.changeTask('complaint', {'status': v, page: 1})
  }
  changeSearch = (e) => {
    this.setState({
      searchingText: e.target.value
    })
  }
  pressEnter = () => {
    let {selectKey} = this.props
    let searchingText = this.state.searchingText.trim()
    if (selectKey !== searchingText) {
      this.props.changeTask('complaint', {selectKey: searchingText, page: 1})
    }
  }
  changeSchool = (v) => {
    let schoolId = this.props.schoolId
    if (v !== schoolId) {
      this.props.changeTask('complaint', {schoolId: v})
    }
  }
  
  render () {
    let {dataSource, showImgs, editing, initialSlide, total, loading, searchingText} = this.state
    let {page, type, status, schoolId} = this.props

    const carouselItems = (dataSource[editing]&&dataSource[editing].images&&dataSource[editing].images.length>0)&&(dataSource[editing].images.map((r,i) => {
      return <img key={i} alt='' src={CONSTANTS.FILEADDR + r} className='carouselImg' />
    }))

    const carousel = (
      <Carousel dots={true} accessibility={true}  className='carouselItem' autoplay={false} arrows={true} initialSlide={initialSlide} >
        {carouselItems}
      </Carousel>
    )

    return (
      <div className='contentArea'>

        <SearchLine
          searchInputText='订单/流水号' 
          searchingText={searchingText} 
          pressEnter={this.pressEnter} 
          changeSearch={this.changeSearch} 

          selector1={
            <SchoolSelector
              selectedSchool={schoolId}
              changeSchool={this.changeSchool}
            />
          }
          selector2={<BasicSelector allTitle='全部类型' staticOpts={ORDERTYPES} selectedOpt={type} changeOpt={this.changeType} />} 
          selector3={<BasicSelector allTitle='全部状态' staticOpts={HANDLESTATUS} selectedOpt={status} changeOpt={this.changeStatus} />} 
        />

        <div className='tableList complaint'>
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

        <Modal  visible={showImgs}  title='' closable={false} onCancel={this.closeImgs}  className='carouselModal' okText='' footer={null} >
          <div className='carouselContainer' >{ showImgs ? carousel : null}</div>
        </Modal>

        <div>
          <Modal
            title="发送消息"
            visible={this.state.messageVisible}
            onOk={this.postMessage}
            onCancel={this.cancelPost}
            maskClosable={false}
            className='addSupplierModal'
          >
            <textarea style={{width:'100%',height:'100px'}} value={this.state.message} onBlur={this.checkMessage} onChange={this.changeMessage} />
            { this.state.messageEmpty ? <p className='checkInvalid'>消息不能为空！</p> : null }
          </Modal>
        </div>
      </div>
    )
  }
}

// export default ComplaintTable
const mapStateToProps = (state, ownProps) => ({
  type: state.changeTask[subModule].type,
  page: state.changeTask[subModule].page,
  status: state.changeTask[subModule].status,
  selectKey: state.changeTask[subModule].selectKey,
  schoolId: state.changeTask[subModule].schoolId
})

export default withRouter(connect(mapStateToProps, {
  changeTask
})(ComplaintTable))