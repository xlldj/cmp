import React from 'react'
import {Link} from 'react-router-dom'
import {Button} from 'antd'
import AjaxHandler from '../../ajax'
import CONSTANTS from '../../component/constants'
import Time from '../../component/time'
import Noti from '../../noti'

const STATUSCLASS = {
  1: 'warning',
  2: 'success',
  4: ''
}

class AbnormalInfo extends React.Component {
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
      data: data,
      modalClosable: true,
      modalVisible: false,
      modalMessage: ''
    }
  }
  fetchData = (body) => {
    let resource='/api/order/details'
    const cb = (json) => {
        if(json.error){
          Noti.hintServiceError(json.error.displayMessage)
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
  render () {
    let {data} = this.state


    return (
      <div className='infoList' >
        <ul>
          <li><p>订单号:</p>{data.orderNo || '暂无'}</li>
          <li><p>设备类型:</p>{CONSTANTS.DEVICETYPE[data.deviceType] || '暂无'}</li>
          <li><p>设备ID:</p>{data.macAddress || '暂无'}</li>
          <li><p>设备位置:</p>{data.deviceLocation || '暂无'}</li>
          <li><p>所在学校:</p>{data.schoolName || '暂无'}</li>

          <li>
            <p>用户手机:</p>
            <span className='padR20'>{data.mobile||'暂无'}</span>
            <Link to={{pathname:`/user/userInfo/:${data.userId}`,state:{path: 'fromOrder'}}} >查看用户详情</Link>
          </li>
          <li><p>开始时间:</p>{Time.getTimeStr(data.createTime)}</li>
          <li><p>结束时间:</p>{data.finishTime ? Time.getTimeStr(data.finishTime) : ''}</li>
          <li><p>结账方式:</p>{data.checkoutByOther ? '代结账' : '自结账'}</li>
          <li><p>预付金额:</p><span>{`${data.prepay}`}</span></li>
          <li><p>实际消费:</p><span className='shalowRed'>{`${data.consume}`}</span></li>
          {
            data.bonusAmount ?
              <li><p>代金券抵扣:</p>
                <span>{data.bonusAmount}</span>
              </li>
            : null
          }
          {
            data.actualDebit ?
              <li><p>实际扣款</p>
                <span>{data.actualDebit}</span>
              </li>
            : null
          }
          {
            data.odd ?
              <li><p>找零金额:</p>
                <span>{data.odd}</span>
              </li>
            : null
          }
          
          {
            data.chargebackReason ?
              <li><p>退单原因:</p>
                <span>{data.chargebackReason}</span>
              </li>
            : null
          }
          {
            data.chargebackMoney ?
              <li><p>退还金额:</p>
                <span>{data.chargebackMoney}</span>
              </li>
            : null
          }
          {
            data.chargebackBonus ?
              <li><p>退还代金券:</p>
                <span>{data.chargebackBonus}</span>
              </li>
            : null
          }
        </ul>
        <div className='btnArea'>
          <Button onClick={this.back}>返回</Button>
        </div>

      </div>
    )
  }
}

export default AbnormalInfo
