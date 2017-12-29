import React from 'react'
import {Button, Popconfirm, Radio} from 'antd'
import {Link} from 'react-router-dom'
import Noti from '../../noti'
import AjaxHandler from '../../ajax'
import Format from '../../component/format'
import CONSTANTS from '../../component/constants'
import {mul} from '../../util/numberHandle'

const RadioGroup = Radio.Group
const BUSINESS = CONSTANTS.BUSINESS

class InfoSet extends React.Component{
  constructor (props) {
    super(props)
    this.state = {
      schoolId: 0,
      schoolName: '',
      buildingNames: [],
      buildingNamesSet: false,
      businesses:[],
      businessSet: false,
      online: false,
      onlineError: false,
      prepayFunction: null,
      prepayFunctionSet: false,
      prepayOptions: [],
      prepayOptionsSet: false,
      waterTimeRanges: null,
      waterTimeRangeSet: false,
      repairCauses: [],
      repairCausesSet: false,
      rechargeAmount: [],
      rechargeAmountsSet: false,
      bonusActivity: '',
      bonusActivitySet: false,
      repairmans: [],
      repairmansSet: false,
      finished: false,
      finishError: false,
      onlineChanged: false,
      status: '',
      rateDetails: [],
      rateDetailsSet: false,
      prepayNotMatchBusiness: false,
      rateNotMatchBusiness: false
    }
  }
  fetchData = (body) => {
    this.setState({
      loading: true
    })
    let resource='/school/basicConfig'
    const cb = (json) => {
      let nextState = {loading: false}
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
          /*--------redirect --------*/
          if(json.data){
            let {schoolName, buildingNames, businesses, prepayFunction, prepayOptions,
             waterTimeRanges, repairCauses, rechargeAmount, bonusActivity, repairmans, finished, status, rateDetails} = json.data
            nextState.schoolName = schoolName
            nextState.buildingNamesSet = buildingNames ? true : false
            if (buildingNames) {
              nextState.buildingNames = buildingNames
            }
            nextState.businessSet = businesses ? true : false
            if (businesses) {
              nextState.businesses = businesses
              businesses.forEach((busi) => {
                let prepaySet = prepayOptions && prepayOptions.some((prepay) => (prepay.deviceType === busi))
                if (!prepaySet) {
                  nextState.prepayNotMatchBusiness = true
                }
                let rateSet = rateDetails && rateDetails.some((rate) => (rate.deviceType === busi))
                if (!rateSet) {
                  nextState.rateNotMatchBusiness = true
                }
              })
            }
            nextState.prepayFunctionSet = prepayFunction ? true : false
            if (prepayFunction) {
              nextState.prepayFunction = prepayFunction
            }
            nextState.prepayOptionsSet = prepayOptions ? true : false
            if (prepayOptions) {
              nextState.prepayOptions = prepayOptions
            }
            nextState.waterTimeRangeSet = waterTimeRanges && waterTimeRanges.length > 0 ? true : false
            if (waterTimeRanges) {
              nextState.waterTimeRanges = waterTimeRanges
            }
            nextState.repairCausesSet = repairCauses ? true : false
            if (repairCauses) {
              nextState.repairCauses = repairCauses
            }
            nextState.rechargeAmountsSet = rechargeAmount ? true : false
            if (rechargeAmount){
              nextState.rechargeAmount = rechargeAmount
            } 
            nextState.bonusActivitySet = bonusActivity ? true : false
            if (bonusActivity) {
              nextState.bonusActivity = bonusActivity
            }
            nextState.repairmansSet = repairmans ? true : false
            if (repairmans) {
              nextState.repairmans = repairmans
            }
            nextState.rateDetailsSet = rateDetails ? true : false
            if (rateDetails) {
              nextState.rateDetails = rateDetails
            }
            nextState.finished = finished
            nextState.status = status
            this.setState(nextState)
          }        
        }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  componentDidMount(){
    this.props.hide(false)
    let id = parseInt(this.props.match.params.id.slice(1), 10)
    this.setState({
      schoolId: id
    })
    const body={
      id: id
    }
    this.fetchData(body)
    // this.fetchSchoolInfo(body)
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  confirm=()=>{
    let {finished} = this.state
    if (!finished) {
      Noti.hintAndClick('请求出错', '当前学校还未设置完必选项，请全部添加后再')
      return 
    }
    this.postChange()
  }
  postChange = () => {
    let {status, finished} = this.state
    if (!finished) {
      return
    }
    if (!status) {
      return 
    }
    let resource
    if (status && status === 1) {
      resource = '/school/online'
    } else {
      resource = '/school/offline'
    }
    const body={
      id: parseInt(this.state.schoolId, 10)
    }
    const cb=(json)=>{
      if(json.error){
        Noti.hintServiceError(json.error.displayMessage)
      }else{
        if (json.data.result) {
          Noti.hintSuccess(this.props.history,'/school/list')
        } else {
          Noti.hintLock('请求出错','请稍后重试')
        }
      }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  back=()=>{
    this.props.history.goBack()
  }
  toBuildingSet = (e) => {
    let schoolId = this.state.schoolId
    this.props.history.push({pathname: `/school/list/blockManage/:${schoolId}`, state: {path: 'fromInfoSet'}})
  }
  toBusinessSet = (e) => {
    let schoolId = this.state.schoolId
    this.props.history.push({pathname: `/school/list/business/:${schoolId}`, state: {path: 'fromInfoSet'}})
  }
  toPrepayFunctionSet = (e) => {
    this.props.history.push({pathname: `/device/price/addPrice`, state: {path: 'fromInfoSet'}})
  }
  toPrepayOptionSet = (e) => {
    this.props.history.push({pathname: `/device/prepay/addPrepay`, state: {path: 'fromInfoSet'}})
  }
  toWaterTimeRangeSet = (e) => {
    this.props.history.push({pathname: `/device/timeset/addTimeset`, state: {path: 'fromInfoSet'}})
  }
  toBunusActSet = (e) => {
    this.props.history.push({pathname: `/gift/act/addAct`, state: {path: 'fromInfoSet'}})
  }
  toRepairmanSet = (e) => {
    this.props.history.push({pathname: `/employee`, state: {path: 'fromInfoSet'}})
  }
  toRechargeSet = (e) => {
    this.props.history.push({pathname: `/fund/charge/addCharge`, state: {path: 'fromInfoSet'}})
  }
  toRateSet = (e) => {
    this.props.history.push({pathname: `/device/rateSet/addRate`, state: {path: 'fromInfoSet'}})
  }
  online = (e) => {
    this.setState({
      status: 1,
      onlineChanged: true // 修改过之后'确认'按钮出现
    })
  }
  offline = (e) => {
    this.setState({
      status: 2,
      onlineChanged: true
    })
  }
  cancel = (e) => {
    // nothing
  }

  render(){
    let {schoolId, schoolName, buildingNames, buildingNamesSet, 
        businesses, businessSet, 
        prepayOptions, prepayOptionsSet,
        waterTimeRanges, waterTimeRangeSet, rechargeAmount,
        rechargeAmountsSet, bonusActivity, bonusActivitySet, repairmans, repairmansSet, 
        finished, finishError, onlineChanged, status, rateDetails, rateDetailsSet, prepayNotMatchBusiness, rateNotMatchBusiness} = this.state

    let building = buildingNames && buildingNames.map((r, i) => (<span className='inlineItem' key={`building${i}`}>{r.fullName}</span>))
    let businessContent = businessSet && businesses.map((r, i) => (<span className='inlineItem' key={`business${i}`}>{BUSINESS[r]}</span>))
    let prepayOptionsContent = prepayOptionsSet && prepayOptions.map((record, index) => {
      return (
        <li key={`other${index}`}>
          <p>{CONSTANTS.DEVICETYPE[record.deviceType]}</p>
          <span key={`prepay${index}`}>预付¥{record.prepay}</span>
          <Link className='mgl15' to={{pathname: `/device/prepay/editPrepay/:${record.id}`, state: {path: 'fromInfoSet'}}}>查看详情</Link>
        </li>
      )
    })
    let waterTimeRangeContent = waterTimeRangeSet && waterTimeRanges.map((record, index) => {
      let items = record.items
      let timeItem = items && items.map((r, i) => (
        <span key={i} className='inlineItem'>
          {Format.adding0(r.startTime.hour)}:{Format.adding0(r.startTime.minute)}~{Format.adding0(r.endTime.hour)}:{Format.adding0(r.endTime.minute)}
        </span>
      ))
      return (
        <li key={`wtitem${index}`}>
          <p>{CONSTANTS.DEVICETYPE[record.deviceType]}</p>
          <span>{timeItem}</span>
          <Link className='mgl15' key={`innerwtitem${index}`} to={{pathname: `/device/timeset/editTimeset/:${record.id}`, state: {path: 'fromInfoSet'}}}>查看详情</Link>
        </li>
      )
    })
    let repairmansContent = repairmansSet && repairmans.map((record, index) => (<span className='inlineItem' key={`repairman${index}`}>{record}</span>))

    let rateContent = rateDetailsSet && rateDetails.map((record, index) => {
      let deviceRate = record.rateGroups.map((r, i) => (<span key={i}>{mul(r.price, 100)}分钱/{r.pulse}脉冲</span>))

      return (
        <li key={`rateLi${index}`}>
          <p key={`deviceType${index}`}>{CONSTANTS.DEVICETYPE[record.deviceType]}</p>
          <span>{deviceRate}</span>
          <Link className='mgl15' key={`rateItem${index}`} to={{pathname: `/device/rateSet/rateInfo/:${record.id}`, state: {path: 'fromInfoSet'}}}>查看详情</Link>
        </li>
      )
    })

    let rechargeAmountsContent = rechargeAmountsSet && rechargeAmount.items.map((record, index) => (<span className='inlineItem' key={`recharge${index}`}>{record}</span>))

    const star = (<span className='red'>*</span>)
    /*
          <li>
            <p>{star}设备水量单价:</p>
            {prepayFunctionSet ? <span>{prepayFunction.money}元/{prepayFunction.amount}L水</span> : null}
            {prepayFunctionSet ?
              <Link className='mgl15' to={{pathname: `/device/price/detail/:${prepayFunction.id}`, state: {path: 'fromInfoSet'}}}>查看详情</Link>
              : 
              <Button onClick={this.toPrepayFunctionSet} type='primary'>前往设置</Button>
            }
          </li>
    */
    return (
      <div className='infoList infoSetInfo'>
        <ul>
          <li>
            <p>当前学校:</p>
            {schoolName}
          </li>
          <li>
            <p>{star}添加楼栋:</p>
            {buildingNamesSet ? <span >{building}</span> : null}
            {buildingNamesSet ? 
              <Link className='mgl15' to={{pathname: `/school/list/blockManage/:${schoolId}`, state: {path: 'fromInfoSet'}}}>查看详情</Link>
              : 
              <Button onClick={this.toBuildingSet} type='primary'>前往设置</Button>
            }
          </li>
          <li>
            <p>{star}用户端功能入口:</p>
            {businessSet ? <span>{businessContent}</span> : null}
            {businessSet ?
              <Link className='mgl15' to={{pathname: `/school/list/business/:${schoolId}`, state: {path: 'fromInfoSet'}}}>{businessSet ? '查看详情' : '前往设置'}</Link>
              : 
              <Button onClick={this.toBusinessSet} type='primary'>前往设置</Button>
            }
          </li>
          <li className='itemsWrapper ulWrapper'>
            <p>{star}设备预付选项:</p>
            {prepayOptionsSet ? 
              <ul>{prepayOptionsContent}</ul>
               : null
            }
            {prepayOptionsSet ?
              null
              : 
              <span><Button onClick={this.toPrepayOptionSet} type='primary'>前往添加</Button></span>
            }
            {
              prepayNotMatchBusiness ?
              <span className='checkInvalid'>设备预付与该学校功能入口项不匹配，请查看设置！</span>
              : null
            }
          </li>
          <li className='itemsWrapper  ulWrapper'>
            <p>设备供水时段:</p>
            {waterTimeRangeSet ? 
              <ul>{waterTimeRangeContent}</ul>
               : null
            }
            {waterTimeRangeSet ? null : 
              <span><Button onClick={this.toWaterTimeRangeSet} type='primary'>前往添加</Button></span>
            }
          </li>

          <li className='itemsWrapper  ulWrapper'>
            <p>{star}设备费率:</p>
            {rateDetailsSet ? 
              <ul>{rateContent}</ul>
               : null
            }
            {rateDetailsSet ? null : 
              <span><Button onClick={this.toRateSet} type='primary'>前往添加</Button></span>
            }
            {
              rateNotMatchBusiness ?
              <span className='checkInvalid'>设备费率与该学校功能入口项不匹配，请查看设置！</span>
              : null
            }
          </li>
          <li>
            <p>{star}充值面额设置:</p>
            {rechargeAmountsSet ? <span>{rechargeAmountsContent}</span> : null}
            {rechargeAmountsSet ?
                <Link className='mgl15' to={{pathname: `/fund/charge/editCharge/:${rechargeAmount.schoolId}`, state: {path: 'fromInfoSet'}}}>查看详情</Link>
              : 
              <Button onClick={this.toRechargeSet} type='primary'>前往添加</Button>
            }
          </li>
          <li>
            <p>新人红包活动:</p>
            {bonusActivitySet ? '已有新人红包活动' : null}
            {bonusActivitySet ?
              <Link className='mgl15' to={{pathname: `/gift/act/actInfo/:${bonusActivity}`, state: {path: 'fromInfoSet'}}}>查看详情</Link>
              : 
              <Button onClick={this.toBunusActSet} type='primary'>前往添加</Button>
            }
          </li>
          <li>
            <p>维修员:</p>
            {repairmansSet ? <span className='longItem'>{repairmansContent}</span> : 
              <Button type='primary' onClick={this.toRepairmanSet}>前往添加</Button>
            }
          </li>
          {
            finished ? 
            <li>
              <p>是否上线：</p>
              <RadioGroup  value={status}>
                <Popconfirm title="确定要上线么?" onConfirm={this.online} onCancel={this.cancel} okText="确认" cancelText="取消">
                  <Radio value={1}>是</Radio>
                </Popconfirm>
                <Popconfirm title="确定要下线么?" onConfirm={this.offline} onCancel={this.cancel} okText="确认" cancelText="取消">
                  <Radio value={2}>否</Radio>
                </Popconfirm>
              </RadioGroup>
              {finishError?<span className='checkInvalid'>未设置完必选设置的学校不能上线～</span>:null}
            </li>
            : null
          }
        </ul>
        <div className='btnArea'>
          打{star}的选项设置完成后，该学校才可正常上线
        </div>
        <div className='btnArea'>
          {onlineChanged && finished ? 
            <Popconfirm title="确定要提交么?" onConfirm={this.confirm} onCancel={this.cancel} okText="确认" cancelText="取消">
              <Button type='primary'>确认</Button>
            </Popconfirm>
            : null
          }
          <Button onClick={this.back}>返回</Button>
        </div>
      </div>
    )
  }
}

export default InfoSet
