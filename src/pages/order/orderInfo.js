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
        consume: 0,
        posting: false
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
    this.setState({
      posting: true
    })
    let resource = '/order/chargeback'
    const body = {
      id: this.state.id
    }
    const cb = (json) => {
      const nextState = {
        posting: false
      }
      if (json.data && json.data.result) {
        let data = JSON.parse(JSON.stringify(this.state.data))
        data.status = 4
        this.setState({
          data: data
        })
        Noti.hintSuccessWithoutSkip()
      } else {
        Noti.hintServiceError(json.data.failReason)
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  render () {
    let {data, posting} = this.state

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
          <li><p>实际用水量:</p>{data.waterUsage||'待核算'}</li>
          <li><p>预付金额:</p>{data.prepay || '未知'}</li>
          <li><p>实际消费:</p><span className='shalowRed'>{data.status !== 1 ? `¥${data.consume}` : '待核算'}</span></li>
          {
            data.bonusAmount ? 
              <li><p>代金券抵扣:</p>{data.bonusAmount}</li> 
            : null
          }
          {
            data.actualDebit ?
              <li><p>实际扣款:</p>{data.actualDebit}</li> 
            : null
          }
          {data.status !== 1 ?<li><p>找零金额:</p><span>{`¥${data.unknown}`}</span></li> : null}
          
          {
            data.status !== 4 ?
              <li>
                <p></p>
                {
                  posting ?
                    <Button>退单</Button>
                  : 
                  <Popconfirm title={popTitle} onConfirm={this.openChargeBackModal} >
                    <Button >退单</Button>
                  </Popconfirm>
                }
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
        
        <Modal
          title='退单'
          visible={this.state.'modalVisible'}
          onOk={this.'postMessage'}
          onCancel={this.''}
          maskClosable={''}
          className='$(6: popupModal)'
        >
          <textarea
            style={{width:'100%',height:'100px'}}
            value={this.state.''}
            onBlur={this.''}
            onChange={this.''}
          />
          {this.state.'' ? <p className='checkInvalid'>消息不能为空！</p> : null }
        </Modal>
      </div>
    )
  }
}

export default OrderInfo
