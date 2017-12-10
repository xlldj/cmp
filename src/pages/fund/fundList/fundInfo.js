import React from 'react'
import {Link } from 'react-router-dom'

import {Button, Popconfirm, Modal} from 'antd'

import Time from '../../component/time'
import Noti from '../../noti'
import CONSTANTS from '../../component/constants'
import AjaxHandler from '../../ajax'

const BACKTITLE = {
  fromTask:'返回客服工单',
  fromDevice:'返回设备详情'
}
const classOfType = {
  1: 'shalowRed',
  2: '',
  3: 'warning',
  4: 'success',
  5: ''
}

const FUNDTYPE = CONSTANTS.FUNDTYPE
const WITHDRAWSTATUS = CONSTANTS.WITHDRAWSTATUS
const ACCOUNTTYPE = CONSTANTS.ACCOUNTTYPE

class FundInfo extends React.Component {
  constructor (props) {
    super(props)
    const data = {
        "createTime": 4534534534543,
        "deviceId": 0,
        "deviceLocation": "",
        "deviceNo": "",
        "deviceType": "SHOWER",
        "id": 0,
        "orderNo": "",
        "paymentType": "",
        "preAmount": 0,
        "realAmount": 0,
        "schoolId": 0,
        "schoolName": "",
        "status": "USING",
        "usageAmount": 0
    }
    this.state = {
      data: data,
      showCensor: false,
      failedReason: '',
      reasonError: false,
      posting: false
    }
  }
  fetchData = (body) => {
    let resource='/api/funds/details'
    const cb = (json) => {
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
          /*--------redirect --------*/
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
    let id = this.props.match.params.id.slice(1) 
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
  censorPass = (e) => {
    /*---------post data to change status-----*/
    e.preventDefault()
    let id = this.props.match.params.id.slice(1)
    const censor = {
      pass: 1
    }
    this.postCensor(censor)
  }
  censorFail = () => {
    this.setState({
      showCensor: true
    })
  }
  cancelCensor = () => {
    this.setState({
      showCensor: false,
      failedReason: ''
    })
  }
  changeFailReason = (e) => {
    this.setState({
      failedReason: e.target.value
    })
  }
  confirmCensor = () => {
    if (this.state.posting) {
      return
    }

    let reason = this.state.failedReason.trim()
    if (!reason) {
      return this.setState({
        reasonError: true
      })
    }
    if (this.state.reasonError) {
      this.setState({
        reasonError: false
      })
    }
    const censor = {
      pass: 2,
      reason: this.state.failedReason
    }
    this.postCensor(censor)
  }
  postCensor = (censor) => {
    if (this.state.posting) {
      return
    }
    this.setState({
      posting: true
    })

    let id = this.state.data.id
    let resource = '/api/work/sheet/censor'
    const body = {
      sourceId: id,
      sourceType: 1,
      pass: censor.pass
    }
    if (censor.reason) {
      body.reason = censor.reason
    }
    const cb = (json) => {
      const nextState = {
        posting: false
      }
      if(json.error){
        this.hintServiceError(json.error.displayMessage)
      } else {
        if (json.data.result) {
          if (this.state.showCensor) {
            nextState.showCensor = false
          }
          const body = {
            id: id
          }
          this.fetchData(body)
        } else {
          let reason = json.data.failReason
          Noti.hintAndClick('审核出错', reason, null)
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  render () {
    let {operationType, schoolName, mobile, userId, remarks, thirdAccountType, thirdAccountName, 
      createTime, orderNo, status, amount} = this.state.data
    let {failedReason, showCensor, reasonError} = this.state
    let dStr = Time.getTimeStr(createTime)

    const censorBtn = (
      <div className='btnArea'>
        <Button onClick={this.censorFail}>审核未通过</Button>
        <Popconfirm title="确定要通过么?" onConfirm={this.censorPass} okText="确认" cancelText="取消">
          <Button type='primary'>审核通过</Button>
        </Popconfirm>        
        <span className='divider'></span>
        <Button onClick={this.back}>{this.props.location.state?BACKTITLE[this.props.location.state]:'返回'}</Button>
      </div>
    )
    const backBtn = (
      <div className='btnArea'>
        <Button onClick={this.back}>{this.props.location.state?BACKTITLE[this.props.location.state]:'返回'}</Button>
      </div>
    )

    return (
      <div className='infoList' >
        <ul>
          <li><p>学校:</p>{schoolName}</li>
          <li>
            <p >手机号:</p><span className='padR20'>{mobile}</span>
            <Link className='' to={{pathname:`/user/userInfo/:${userId}`,state:{path: 'fromFund'}}} >查看用户详情</Link>
          </li>
          <li><p>{FUNDTYPE[operationType]}金额:</p>¥{amount}</li>
          <li><p>活动福利:</p>{remarks || '无'}</li>
          <li><p>{FUNDTYPE[operationType]}方式:</p>{ACCOUNTTYPE[thirdAccountType]} ({thirdAccountName || '暂无'})</li>
          <li><p>{FUNDTYPE[operationType]}时间:</p>{dStr}</li>
          <li><p>流水号:</p>{orderNo || '暂无'}</li>
          <li><p>{FUNDTYPE[operationType]}状态:</p><span className={classOfType[status]} >{WITHDRAWSTATUS[status]}</span></li>
        </ul>

        {operationType===2 && status===1 ? censorBtn : backBtn}



        <Modal wrapClassName='censorModal' title='未通过原因' maskClosable={true} visible={showCensor} onCancel={this.cancelCensor} onOk={this.confirmCensor} okText='确认'>
            <textarea className='censorInput' value={failedReason} placeholder='' onChange={this.changeFailReason} />
            {reasonError ? <span className='checkInvalid'>原因不能为空！</span> : null}
        </Modal>

      </div>
    )
  }
}

export default FundInfo
