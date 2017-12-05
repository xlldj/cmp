import React from 'react'
import {Link} from 'react-router-dom'
import {Popconfirm, Button} from 'antd'
import AjaxHandler from '../ajax'
import CONSTANTS from '../component/constants'
import Time from '../component/time'
import Noti from '../noti'

const typeName ={
  1: '热水器',
  2: '饮水机',
  3: '洗衣机',
  4: '电吹风'
}
const STATUSCLASS = {
  1: 'warning',
  2: 'success',
  4: ''
}
const PAYMENT = CONSTANTS.PAYMENTTYPE

class OrderInfo extends React.Component {
  constructor (props) {
    super(props)
    const data = {
        "createTime": 4534534534543,
        "deviceId": 0,
        "deviceLocation": "",
        "macAddress": "",
        "deviceType": 1,
        "id": 0,
        "orderNo": "",
        "paymentType": "",
        "schoolId": 0,
        "schoolName": "",
        "status": 1,
        "waterUsage": 0,
        consume: 0
    }
    this.state = {
      data: data
    }
  }
  fetchData = (body) => {
    let resource='/api/order/details'
    const cb = (json) => {
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
          if(json.data){
            this.setState({
              data: json.data
            })
          }else{
            throw new Error('网络出错，请稍后重试～')
          }        
        }
    }
    AjaxHandler.ajax(resource,body,cb)
  }  

  componentDidMount(){
    this.props.hide(false)
    let id = parseInt(this.props.match.params.id.slice(1), 10)
    this.setState({
      id: id
    })
    const body={
      id: id
    }
    this.fetchData(body)
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  back = () => {
    this.props.history.goBack()
  }
  confirmSettle = () => {
    let resource = '/order/chargeback'
    const body = {
      id: this.state.id
    }
    const cb = (json) => {
      if (json.data && json.data.result) {
        Noti.hintSuccessWithoutSkip()
        this.fetchData({
          id: this.state.id
        })
      } else {
        throw {
          title: '请求出错',
          message: json.error.displayMessage || '网络请求出错'
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  render () {
    let data = this.state.data

    const popTitle = (<p className='popTitle'>退单后该笔订单的预付金额和代金券都将返还给用户，确定要退单么?</p>)

    return (
      <div className='infoList' >
        <ul>
          <li><p>订单号:</p>{data.orderNo || '暂无'}</li>
          <li><p>设备类型:</p>{typeName[data.deviceType] || '暂无'}</li>
          <li><p>设备ID:</p>{data.macAddress || '暂无'}</li>
          <li><p>设备位置:</p>{data.deviceLocation || '暂无'}</li>
          <li><p>所在学校:</p>{data.schoolName || '暂无'}</li>

          <li>
            <p>用户手机:</p>
            <span className='padR20'>{data.mobile||'暂无'}</span>
            <Link to={{pathname:`/user/userInfo/:${data.userId}`,state:{path: 'fromOrder'}}} >查看用户详情</Link>
          </li>
          <li><p>开始时间:</p>{Time.getTimeStr(data.createTime)}</li>
          {
            data.status !== 1 ?
              <li><p>结束时间:</p>{data.finishTime ? Time.getTimeStr(data.finishTime) : ''}</li>
            : null
          }
          <li><p>使用状态:</p><span className={STATUSCLASS[data.status]}>{CONSTANTS.ORDERSTATUS[data.status]}</span></li>
          <li><p>支付方式:</p>{PAYMENT[data.paymentType] || '暂无'}</li>
          <li><p>实际用水量:</p>{data.waterUsage||'待核算'}</li>
          <li><p>实际消费:</p><span className='shalowRed'>{data.status !== 1 ? `¥${data.consume}` : '待核算'}</span></li>
          {
            data.status !== 4 ?
              <li><p></p>
                <Popconfirm title={popTitle} onConfirm={this.confirmSettle} >
                  <Button >退单</Button>
                </Popconfirm>
              </li>
            : null
          }
        </ul>
        {
          data.status === 4 ?
            <div className='btnArea'>
              <p>该订单已手动退单</p>
            </div>
          : null
        }
        <div className='btnArea'>
          <Button onClick={this.back}>返回</Button>
        </div>
      </div>
    )
  }
}

export default OrderInfo
