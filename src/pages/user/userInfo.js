import React from 'react'
import {Button, Modal, Popconfirm} from 'antd'
import Time from '../component/time'
import Noti from '../noti'
import CONSTANTS from '../component/constants'
import AjaxHandler from '../ajax'


import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeOrder, changeFund } from '../../actions'


const SEX = {
  1:'男',
  2:'女'
}
const backTitle = {
  fromOrder: '返回订单详情',
  fromFund: '返回资金详情',
  fromRepair: '返回维修详情',
  fromRepairLog: '返回用户报修记录'
}

class UserInfo extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      data: {},
      addingName: '',
      empty: false,
      visible: false,
      cancelDefriending: false,
      messagePosting: false,
      reseting: false
    }
  }
  componentDidMount(){
    this.props.hide(false)
    this.fetchData()
  }
  fetchData = () => {
    let resource = '/api/user/one'
    let id = parseInt(this.props.match.params.id.slice(1), 10)
    const body = {
      id: id
    }
    const cb=(json)=>{
      if(json.error){
        throw new Error(json.error)
      }else{
        this.setState({
          data: json.data
        })
      }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  back = () => {
    this.props.history.goBack()
  }
  openMessage = () => {
    this.setState({
      visible: true
    })
  }
  changeAddingName = (e) => {
    this.setState({
      addingName: e.target.value
    })
  }
  checkAddingName = () => {
    if (!this.state.addingName) {
      return this.setState({
        empty: true
      })
    }
    this.setState({
      empty: false
    })
  }
  cancelPost = () => {
    this.setState({
      visible: false
    })
  }
  postMessage = () => {
    if (!this.state.addingName) {
      return this.setState({
        empty: true
      })
    }
    if (this.state.messagePosting) {
      return
    }
    this.setState({
      messagePosting: true
    })
    let resource = '/api/notify/add', mobile = this.state.data.mobile
    const body = {
      content: this.state.addingName,
      type: 3,
      mobiles: [mobile]
    }
    const cb = (json) => {
      const nextState = {
        messagePosting: false
      }
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else {
        if (json.data.id) {
          Noti.hintSuccessWithoutSkip('发送成功')
          nextState.visible = false
        } else {
          Noti.hintWarning('数据出错')
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  resetPwd = () => {
    if (this.state.reseting) {
      return
    }
    this.setState({
      reseting: true
    })
    let resource = '/user/password/reset'
    const body = {
      id: this.state.data.id
    }
    const cb = (json) => {
      this.setState({
        reseting: false
      })
      if (json.data) {
        Noti.hintOk('操作成功', '该用户密码已被重置为手机号末6位！')
      } else {
        Noti.hintServiceError(json.error ? json.error.displayMessage : '')
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  cancelDefriend = () => {
    if (this.state.cancelDefriending) {
      return
    }
    this.setState({
      cancelDefriending: true
    })
    let resource = '/lost/defriend/cancel'
    const body = {
      userId: this.state.data.id
    }
    const cb = (json) => {
      this.setState({
        cancelDefriending: false
      })
      if (json.data) {
        if (json.data.result) {
          Noti.hintOk('操作成功', '该用户已被取消拉黑！')
          this.fetchData()
        } else {
          Noti.hintLock('操作失败', json.data.failReason || '操作失败，请联系客服或相关人员')
        }
      } else {
        Noti.hintServiceError(json.error ? json.error.displayMessage : '')
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  toOrderOfUser = () => {
    this.props.changeOrder('orderList', 
      {
        page: 1, schoolId: 'all', deviceType: 'all', status: 'all', 
        selectKey: '', startTime: Time.get7DaysAgo(), endTime: Time.getNow()
      }
    )
    let id = this.state.data.id
    this.props.history.push({pathname: '/order/list', state: {path: 'fromUser', id: id}})
  }
  toFundOfUser = () => {
    let {mobile} = this.state.data
    this.props.changeFund('fundList', 
      {
        page: 1, selectKey: mobile.toString(), type: 'all', status: 'all', schoolId: 'all',
        startTime: Time.get7DaysAgo(), endTime: Time.getNow()
      }
    )
    this.props.history.push({pathname:'/fund/list',state:{path: 'fromUser', mobile: mobile}})
  }
  render () {
    let {data, cancelDefriending, reseting} = this.state
    let time = data.createTime ? Time.showDate(data.createTime) : '暂无'
    return (
      <div className='infoList'>
        <ul>
          <li className='imgWrapper'>
            <p>用户头像:</p>
            {data.pictureUrl ? <img className='userThumb' src={CONSTANTS.FILEADDR + data.pictureUrl} alt='用户头像' /> : null}
          </li>
          <li><p>用户昵称:</p>{data.nickName}</li>
          <li><p>用户性别:</p>{SEX[data.sex]}</li>
          <li><p>手机号:</p>{data.mobile}</li>
          <li><p>手机型号:</p>{data.mobileModel || '未知'}</li>
          <li><p>学校:</p>{data.schoolName}</li>
          <li><p>宿舍楼栋:</p>{data.buildingName}</li>
          <li><p>宿舍楼层:</p>{data.floorName}</li>
          <li><p>宿舍号:</p>{data.roomName}</li>
          <li><p>账户余额:</p>{data.balance ? '¥' + data.balance : '暂无'}</li>
          <li><p>注册时间:</p>{time}</li>
          <li><p>用户订单记录:</p><a onClick={this.toOrderOfUser} >查看详情</a></li>
          <li><p>充值提现记录:</p><a onClick={this.toFundOfUser}>查看详情</a></li>
          <li>
            <p>重置密码:</p>
            { reseting ?
              <a href=''>重置</a>
              :
              <Popconfirm title="确定要重置么?" onConfirm={this.resetPwd} okText="确认" cancelText="取消">
                <a href="">重置</a>
              </Popconfirm>
            }
          </li> 
          {data.blacklistInfo ?
            <li>
              <p></p>
              <span style={{marginRight: '20px'}}>{data.blacklistInfo}</span>
              { cancelDefriending ?
                <a href=''>取消拉黑</a>
                : 
                <Popconfirm title="确定要取消拉黑么?" onConfirm={this.cancelDefriend} okText="确认" cancelText="取消">
                  <a href="">取消拉黑</a>
                </Popconfirm>
              }
            </li>
            : null
          }
        </ul>

        <div>
          <Modal
            title="发送客服消息"
            visible={this.state.visible}
            onOk={this.postMessage}
            onCancel={this.cancelPost}
            maskClosable={false}
            className='addSupplierModal'
          >
            <textarea style={{width:'100%',height:'100px'}} value={this.state.addingName} onBlur={this.checkAddingName} onChange={this.changeAddingName} />
            { this.state.empty ? <p className='checkInvalid'>消息不能为空！</p> : null }
          </Modal>
        </div>

        <div className='btnArea'>
          <Button type='primary' onClick={this.openMessage}>发送客服消息</Button>
          <Button onClick={this.back}>{this.props.location.state?(backTitle[this.props.location.state.path]):'返回'}</Button>
        </div>
      </div>
    )
  }
}


export default withRouter(connect(null, {
  changeOrder, changeFund
})(UserInfo))