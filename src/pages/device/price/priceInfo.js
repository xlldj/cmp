import React from 'react'

import {Button} from 'antd'

import AjaxHandler from '../../ajax'
import Noti from '../../noti'
import CONSTANTS from '../../component/constants'
import SchoolSelector from '../../component/schoolSelectorWithoutAll'
const BACKTITLE = {
  fromInfoSet: '返回学校信息设置'
}

const initialItems = [{amount: '', prepay: '', unit: 0}]
const initialDrinkItems =[[{amount: '', prepay: '', unit: 0, usefor: 0}],[{amount: '', prepay: '', unit: 0, usefor: 2}],[{amount: '', prepay: '', unit: 0, usefor: 3}]]
class PriceInfo extends React.Component {
  constructor (props) {
    super(props)
    this.state = { 
      id: 0,
      money: '',
      moneyError: false,
      amount: '',
      amountError: false,
      schoolId: '',
      schoolError: false
    }
  }
  fetchData =(body)=>{
    let resource='/device/prepay/function/one'
    const cb=(json)=>{
      if(json.error){
        throw {
          title: '请求出错',
          message: json.error.displayMessage || '网络出错，请稍后重试～'
        }
      }else{
        if(json.data){
          this.setState(json.data)
          this.setState({
            originalSchool: json.data.schoolId
          })
        }       
      }
    }
    AjaxHandler.ajax(resource,body,cb)
  }

  componentDidMount(){
    this.props.hide(false)
    if(this.props.match.params.id){
      const body={
        id:parseInt(this.props.match.params.id.slice(1), 10)
      }
      this.fetchData(body)
      this.setState({
        id: parseInt(this.props.match.params.id.slice(1), 10)
      })
    }
  }
  componentWillUnmount () {
    this.props.hide(true)
  }

  postInfo = () => {
    let {id, schoolId, money, amount} = this.state

    const body = {
      schoolId: schoolId,
      money: money,
      amount: amount
    }
    let resource
    if (id){
      body.id = id
      resource = '/api/device/prepay/function/update'
    } else {
      resource = '/api/device/prepay/function/add'
    }

    const cb = (json) => {
      if(json.error){
        throw {
          title: '请求出错',
          message: json.error.displayMessage || '网络出错，请稍后重试～'
        }
      }else{
        /*--------redirect --------*/
        if(json.data){
          Noti.hintSuccess(this.props.history,'/device/price')
        }       
      }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  confirm = () => {
    let {id, schoolId, money, amount, originalSchool} = this.state
    if (!schoolId) {
      return this.setState({
        schoolError: true
      })
    }
    if (!money) {
      return this.setState({
        moneyError: true
      })
    }
    if (!amount) {
      return this.setState({
        amountError: true
      })
    }

    if (id && originalSchool === schoolId) {
      this.postInfo()
    } else {
      this.checkExist(this.postInfo)
    }
  }
  back = () => {
    this.props.history.goBack()
  }

  checkExist = (callback) => {
    let resource = '/device/prepay/function/check'
    const body = {
      schoolId: this.state.schoolId
    }
    const cb = (json) => {
      if (json.error) {
        throw {
          title: '请求出错',
          message: json.error.displayMessage || '网络出错，请稍后重试～'
        }
      } else {
        if (json.data.result) {
          Noti.hintLock('添加出错', '当前设备已有单价选项，请勿重复添加')
        } else {
          if (callback) {
            callback()
          }
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  changeSchool = (v) => {
    this.setState({
      schoolId: parseInt(v, 10)
    })
  }
  checkSchool = (v) => {
    if (!v) {
      return this.setState({
        schoolError: true
      })
    }
    let {schoolError, id, originalSchool, schoolId} = this.state
    if (schoolError) {
      this.setState({
        schoolError: false
      })
    }
    if (!(id && originalSchool === schoolId)) {
      this.checkExist(null)
    }
  }
  changeMoney = (e) => {
    let v = e.target.value
    this.setState({
      money: v
    })
  }
  checkMoney = (e) => {
    let v = e.target.value
    if (!v) {
      return this.setState({
        moneyError: true
      })
    }
    if (this.state.moneyError) {
      this.setState({
        moneyError: false
      })
    }
  }
  changeAmount = (e) => {
    let v = e.target.value
    this.setState({
      amount: v
    })
  }
  checkAmount = (e) => {
    let v = e.target.value
    if (!v) {
      return this.setState({
        amountError: true
      })
    }
    if (this.state.amountError) {
      this.setState({
        amountError: false
      })
    }
  }

  render () {
    let {id, schoolId, schoolError, money, moneyError, amount, amountError} = this.state

    return (
      <div className='infoList priceInfo'>
        <ul>
          <li>
            <p>学校:</p>
            <SchoolSelector
              selectedSchool={schoolId}
              width={CONSTANTS.SELECTWIDTH}
              changeSchool={this.changeSchool} 
              checkSchool={this.checkSchool}
              disabled={id}
              className={id ? 'disabled' : ''}
            />
            {schoolError?<span className='checkInvalid'>学校不能为空！</span>:null}
          </li>
          <li>
            <p>水量单价:</p>
            <div>
              <input type='number' className='shortInput' onChange={this.changeMoney} onBlur={this.checkMoney} value={money} />
              <span>元</span>
              <input type='number' className='shortInput' onChange={this.changeAmount} onBlur={this.checkAmount} value={amount} />
              <span>L水</span>
              {moneyError?<span className='checkInvalid'>金额不能为空！</span>:null}
              {amountError?<span className='checkInvalid'>水量不能为空！</span>:null}
            </div>
          </li>
        </ul>

        <div className='btnArea'>
          <Button type='primary' onClick={this.confirm} >确认</Button>
          <Button onClick={this.back} >{this.props.location.state ? BACKTITLE[this.props.location.state.path] : '返回'}</Button>
        </div>
      </div>
    )
  }
}

export default PriceInfo
