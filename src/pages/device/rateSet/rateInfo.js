import React from 'react'

import { Button } from 'antd'

import AjaxHandler from '../../ajax'
import Noti from '../../noti'
import AddPlusAbs from '../../component/addPlusAbs'
import CONSTANTS from '../../component/constants'
import SchoolSelector from '../../component/schoolSelectorWithoutAll'
import DeviceWithoutAll from '../../component/deviceWithoutAll'
import BasicSelectorWithoutAll from '../../component/basicSelectorWithoutAll'
import { mul, div } from '../../util/numberHandle'
const Fragment = React.Fragment
const {
  DEVICE_TYPE_HEATER,
  DEVICE_TYPE_DRINGKER,
  DEVICE_TYPE_BLOWER,
  DEVICE_TYPE_WASHER,
  HEATER_BILLING_OPTIONS,
  DRINKER_BILLING_OPTIONS,
  BLOWER_BILLING_OPTIONS,
  WASHER_BILLING_OPTIONS,
  SELECTWIDTH
} = CONSTANTS

const BACKTITLE = {
  fromInfoSet: '返回学校信息设置'
}
const billingOptions = {}
billingOptions[DEVICE_TYPE_HEATER] = HEATER_BILLING_OPTIONS
billingOptions[DEVICE_TYPE_DRINGKER] = DRINKER_BILLING_OPTIONS
billingOptions[DEVICE_TYPE_BLOWER] = BLOWER_BILLING_OPTIONS
billingOptions[DEVICE_TYPE_WASHER] = WASHER_BILLING_OPTIONS

class RateInfo extends React.Component {
  constructor(props) {
    super(props)
    let id = 0,
      deviceType = '',
      schoolId = '',
      billingMethod = '',
      originalDT = 0,
      originalSchool = 0
    let rateGroups = [{}],
      deviceTypeError = false,
      schoolError = false,
      billError = false,
      closeTapGroups = [{}]
    this.state = {
      id,
      deviceType,
      billingMethod,
      schoolId,
      schoolError,
      rateGroups,
      deviceTypeError,
      billError,
      closeTapGroups,
      originalDT,
      originalSchool,
      posting: false,
      checking: false,
      dryPrice: '',
      dryPriceError: false,
      oneWashPrice: '',
      oneWashPricePriceError: false,
      twoWashPrice: '',
      twoWashPricePriceError: false,
      twoCleanPrice: '',
      twoCleanPriceError: false
    }
  }
  /*
  fetchSuppliers = ()=>{
    let resource='/api/supplier/query/list'
    const body={
      page: 1,
      size: 100
    }
    const cb = (json) => {
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
          if(json.data){
            const suppliers = {}
            for(let i=0;i<json.data.total;i++){
              suppliers[json.data.supplierEntities[i].id] = json.data.supplierEntities[i].name
            }
            this.setState({
              suppliers: suppliers
            })
          }else{
            throw new Error('网络出错，获取供应商列表失败，请稍后重试～')
          }        
        }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  */
  fetchData = body => {
    let resource = '/api/rate/one'
    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        try {
          if (json.data) {
            let r = json.data
            const taps = r.timeLimit && r.timeLimit.map(r => ({ value: r }))

            let nextState = {
              deviceType: r.deviceType.toString(),
              originalDT: r.deviceType,
              schoolId: r.schoolId,
              originalSchool: r.schoolId,
              billingMethod: r.billingMethod.toString()
            }
            if (r.deviceType === DEVICE_TYPE_WASHER) {
              let dryPrice =
                r.rateGroups &&
                r.rateGroups.find(rate => rate.pulse === 1).price
              let oneWashPrice =
                r.rateGroups &&
                r.rateGroups.find(rate => rate.pulse === 2).price
              let twoWashPrice =
                r.rateGroups &&
                r.rateGroups.find(rate => rate.pulse === 3).price
              let twoCleanPrice =
                r.rateGroups &&
                r.rateGroups.find(rate => rate.pulse === 4).price
              nextState.dryPrice = dryPrice ? dryPrice : ''
              nextState.oneWashPrice = oneWashPrice ? oneWashPrice : ''
              nextState.twoWashPrice = twoWashPrice ? twoWashPrice : ''
              nextState.twoCleanPrice = twoCleanPrice ? twoCleanPrice : ''
            } else {
              const rateGroups =
                r.rateGroups &&
                r.rateGroups.map(rate => ({
                  price: mul(rate.price, 100),
                  pulse: rate.pulse
                }))
              nextState.rateGroups = rateGroups
            }
            if (taps) {
              nextState.closeTapGroups = taps
            }
            this.setState(nextState)
          }
        } catch (e) {
          console.log(e)
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  componentDidMount() {
    this.props.hide(false)
    if (this.props.match.params.id) {
      let id = parseInt(this.props.match.params.id.slice(1), 10)
      const body = {
        id: id
      }
      this.fetchData(body)
      this.setState({
        id: id
      })
    }
  }
  componentWillUnmount() {
    this.props.hide(true)
  }

  changeDevice = v => {
    let nextState = { deviceType: v }
    nextState.billingMethod = '' // clear 'billingMethod' also
    let rateGroups = [{}]
    if (v === '2') {
      rateGroups.push({})
      rateGroups.push({})
      nextState.rateGroups = rateGroups
    } else {
      nextState.rateGroups = rateGroups
    }
    this.setState(nextState)
  }
  checkDevice = v => {
    if (v === '0' || !v) {
      return this.setState({
        deviceTypeError: true
      })
    }
    this.setState({
      deviceTypeError: false
    })
    let { id, deviceType, originalDT, schoolId, originalSchool } = this.state
    if (!schoolId) {
      // 如果没有供应商选项，不去查重
      return
    }
    if (
      !(
        id &&
        parseInt(deviceType, 10) === originalDT &&
        parseInt(schoolId, 10) === originalSchool
      )
    ) {
      this.checkExist(null)
    }
  }
  changeSchool = v => {
    this.setState({
      schoolId: v
    })
  }
  checkSchool = v => {
    if (!v) {
      return this.setState({
        schoolError: true
      })
    }
    this.setState({
      schoolError: false
    })
    let { id, deviceType, originalDT, schoolId, originalSchool } = this.state
    if (!deviceType) {
      // 如果没有供应商选项，不去查重
      return
    }
    if (
      !(
        id &&
        parseInt(deviceType, 10) === originalDT &&
        parseInt(schoolId, 10) === originalSchool
      )
    ) {
      this.checkExist(null)
    }
  }
  checkExist = callback => {
    if (this.state.checking) {
      return
    }
    this.setState({
      checking: true
    })
    let resource = '/rate/check'
    const { deviceType, schoolId, supplierId } = this.state
    const body = {
      deviceType: parseInt(deviceType, 10),
      schoolId: parseInt(schoolId, 10)
    }
    if (supplierId) {
      body.supplierId = supplierId
    }
    const cb = json => {
      this.setState({
        checking: false
      })
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else {
        if (json.data.result) {
          Noti.hintLock(
            '添加出错',
            '当前学校的该类型设备已有费率选项，请勿重复添加'
          )
        } else {
          if (callback) {
            callback()
          }
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  changePrice = (e, i) => {
    const rateGroups = JSON.parse(JSON.stringify(this.state.rateGroups))
    rateGroups[i].price = parseInt(e.target.value, 10)
    this.setState({
      rateGroups: rateGroups
    })
  }
  checkPrice = (e, i) => {
    const rateGroups = JSON.parse(JSON.stringify(this.state.rateGroups))
    if (!rateGroups[i].price) {
      rateGroups[i].error = true
      return this.setState({
        rateGroups: rateGroups
      })
    }
    rateGroups[i].error = false
    this.setState({
      rateGroups: rateGroups
    })
  }
  changePulse = (e, i) => {
    const rateGroups = JSON.parse(JSON.stringify(this.state.rateGroups))
    rateGroups[i].pulse = parseInt(e.target.value, 10)
    this.setState({
      rateGroups: rateGroups
    })
  }
  checkPulse = (e, i) => {
    const rateGroups = JSON.parse(JSON.stringify(this.state.rateGroups))
    if (!rateGroups[i].pulse) {
      rateGroups[i].error = true
      return this.setState({
        rateGroups: rateGroups
      })
    }
    rateGroups[i].error = false
    this.setState({
      rateGroups: rateGroups
    })
  }
  checkInput = () => {
    let {
      rateGroups,
      deviceType,
      billingMethod,
      schoolId,
      closeTapGroups,
      dryPrice,
      oneWashPrice,
      twoWashPrice,
      twoCleanPrice
    } = this.state
    if (!deviceType || deviceType === '0') {
      this.setState({
        deviceTypeError: true
      })
      return false
    }
    let nextState = { deviceTypeError: false }
    if (!schoolId || schoolId === '0') {
      nextState.schoolError = true
      this.setState(nextState)
      return false
    }
    nextState.schoolError = false
    if (!billingMethod || billingMethod === '0') {
      nextState.billError = true
      this.setState(nextState)
      return false
    }
    nextState.billError = false
    console.log(deviceType)
    if (deviceType === DEVICE_TYPE_WASHER.toString()) {
      console.log('why')
      if (!dryPrice) {
        return this.setState({
          dryPriceError: true
        })
      }
      if (!oneWashPrice) {
        return this.setState({
          oneWashPriceError: true
        })
      }
      if (!twoWashPrice) {
        return this.setState({
          twoWashPriceError: true
        })
      }
      if (!twoCleanPrice) {
        return this.setState({
          twoCleanPriceError: true
        })
      }
    } else {
      let rates = JSON.parse(JSON.stringify(rateGroups))
      for (let i = 0; i < rates.length; i++) {
        if (!rates[i].price || !rates[i].pulse) {
          rates[i].error = true
          nextState.rateGroups = rates
          this.setState(nextState)
          return false
        }
        delete rates[i].error
      }
      let taps = JSON.parse(JSON.stringify(closeTapGroups))
      for (let i = 0; i < taps.length; i++) {
        if (!taps[i].value) {
          taps[i].error = true
          nextState.closeTapGroups = taps
          this.setState(nextState)
          return false
        }
        if (taps[i].error) {
          delete taps[i].error
        }
      }
    }
    this.setState(nextState)
    return true
  }
  comleteEdit = () => {
    if (!this.checkInput()) {
      return
    }
    console.log('complete')

    let {
      id,
      deviceType,
      originalDT,
      schoolId,
      originalSchool,
      checking,
      posting
    } = this.state
    if (checking || posting) {
      return
    }
    if (
      !(
        id &&
        parseInt(deviceType, 10) === originalDT &&
        parseInt(schoolId, 10) === originalSchool
      )
    ) {
      this.checkExist(this.postInfo)
    } else {
      this.postInfo()
    }
  }
  postInfo = () => {
    if (this.state.posting) {
      return
    }
    this.setState({
      posting: true
    })
    const rateGroups = JSON.parse(JSON.stringify(this.state.rateGroups))
    const taps = this.state.closeTapGroups.map(r => r.value)
    let {
      id,
      deviceType,
      billingMethod,
      schoolId,
      dryPrice,
      oneWashPrice,
      twoWashPrice,
      twoCleanPrice
    } = this.state
    const body = {
      billingMethod: parseInt(billingMethod, 10),
      deviceType: parseInt(deviceType, 10),
      schoolId: parseInt(schoolId, 10)
    }
    if (deviceType === DEVICE_TYPE_WASHER.toString()) {
      // washer's denomination is 'YUAN', does not need to div by 100.
      let rates = [
        {
          pulse: 1,
          price: +dryPrice
        },
        {
          pulse: 2,
          price: +oneWashPrice
        },
        {
          pulse: 3,
          price: +twoWashPrice
        },
        {
          pulse: 4,
          price: +twoCleanPrice
        }
      ]
      body.rates = rates
    } else {
      rateGroups.forEach(r => {
        r.price = div(r.price, 100)
      })
      body.rates = rateGroups
      body.timeLimit = taps
    }
    if (id) {
      body.id = parseInt(id, 10)
    }
    let resource = '/api/rate/save'
    const cb = json => {
      this.setState({
        posting: false
      })
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          Noti.hintSuccess(this.props.history, '/device/rateSet')
        } else {
          Noti.hintServiceError()
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb, null, {
      clearPosting: true,
      thisObj: this
    })
  }
  back = () => {
    this.props.history.goBack()
  }
  add = () => {
    const rateGroups = JSON.parse(JSON.stringify(this.state.rateGroups))
    rateGroups.push({})
    this.setState({
      rateGroups: rateGroups
    })
  }
  abstract = () => {
    const rateGroups = JSON.parse(JSON.stringify(this.state.rateGroups))
    rateGroups.pop()
    this.setState({
      rateGroups: rateGroups
    })
  }
  changeBilling = v => {
    this.setState({
      billingMethod: v
    })
  }
  checkBilling = v => {
    if (!v || v === '0') {
      return this.setState({
        billError: true
      })
    }
    this.setState({
      billError: false
    })
  }
  addTime = e => {
    let closeTapGroups = JSON.parse(JSON.stringify(this.state.closeTapGroups))
    closeTapGroups.push({})
    this.setState({
      closeTapGroups: closeTapGroups
    })
  }
  abstractTime = e => {
    let closeTapGroups = JSON.parse(JSON.stringify(this.state.closeTapGroups))
    closeTapGroups.pop()
    this.setState({
      closeTapGroups: closeTapGroups
    })
  }
  changeTime = (e, i) => {
    let closeTapGroups = JSON.parse(JSON.stringify(this.state.closeTapGroups))
    closeTapGroups[i].value = parseInt(e.target.value, 10)
    this.setState({
      closeTapGroups: closeTapGroups
    })
  }
  checkTime = (e, i) => {
    const closeTapGroups = JSON.parse(JSON.stringify(this.state.closeTapGroups))
    if (!closeTapGroups[i].value) {
      closeTapGroups[i].error = true
      return this.setState({
        closeTapGroups: closeTapGroups
      })
    }
    closeTapGroups[i].error = false
    this.setState({
      closeTapGroups: closeTapGroups
    })
  }

  changePriceForDryer = e => {
    this.setState({
      dryPrice: e.target.value
    })
  }
  checkPriceForDryer = e => {
    let v = e.target.value
    if (!v) {
      return this.setState({
        dryPriceError: true,
        dryPrice: v
      })
    }
    if (this.state.dryPriceError) {
      this.setState({
        dryPriceError: false,
        dryPrice: v
      })
    }
  }
  changePriceForOneWash = e => {
    this.setState({
      oneWashPrice: e.target.value
    })
  }
  checkPriceForOneWash = e => {
    let v = e.target.value
    if (!v) {
      return this.setState({
        oneWashPriceError: true,
        oneWashPrice: v
      })
    }
    if (this.state.oneWashPriceError) {
      this.setState({
        oneWashPriceError: false,
        oneWashPrice: v
      })
    }
  }
  changePriceForTwoWash = e => {
    this.setState({
      twoWashPrice: e.target.value
    })
  }
  checkPriceForTwoWash = e => {
    let v = e.target.value
    if (!v) {
      return this.setState({
        twoWashPriceError: true,
        twoWashPrice: v
      })
    }
    if (this.state.twoWashPrice) {
      this.setState({
        twoWashPriceError: false,
        twoWashPrice: v
      })
    }
  }
  changePriceForTwoClean = e => {
    this.setState({
      twoCleanPrice: e.target.value
    })
  }
  checkPriceForTwoClean = e => {
    let v = e.target.value
    if (!v) {
      return this.setState({
        twoCleanPriceError: true,
        twoCleanPrice: v
      })
    }
    if (this.state.twoCleanPriceError) {
      this.setState({
        twoCleanPriceError: false,
        twoCleanPrice: v
      })
    }
  }

  render() {
    let {
      id,
      schoolId,
      schoolError,
      deviceType,
      deviceTypeError,
      billingMethod,
      billError,
      rateGroups,
      closeTapGroups,
      dryPrice,
      dryPriceError,
      oneWashPrice,
      oneWashPriceError,
      twoWashPrice,
      twoWashPriceError,
      twoCleanPrice,
      twoCleanPriceError
    } = this.state
    let denomination =
      parseInt(deviceType, 10) === DEVICE_TYPE_BLOWER ? '秒' : '脉冲'

    const rateItems =
      rateGroups &&
      rateGroups.map((r, i) => {
        return (
          <li className="rateSets" key={i}>
            <input
              type="number"
              className="shortInput"
              onChange={e => {
                this.changePrice(e, i)
              }}
              onBlur={e => {
                this.checkPrice(e, i)
              }}
              key={`input${i}`}
              value={r.price ? r.price : ''}
            />
            <span key={`span2${i}`}>分钱/</span>
            <input
              type="number"
              className="shortInput"
              onChange={e => {
                this.changePulse(e, i)
              }}
              onBlur={e => {
                this.checkPulse(e, i)
              }}
              key={`pulse${i}`}
              value={r.pulse ? r.pulse : ''}
            />
            <span key={`span3${i}`}>{denomination}</span>
            {r.error ? <span className="checkInvalid">输入不完整</span> : null}
          </li>
        )
      })
    const tapItems =
      closeTapGroups &&
      closeTapGroups.map((r, i) => {
        return (
          <li className="rateSets" key={i}>
            <input
              type="number"
              className="shortInput"
              onChange={e => {
                this.changeTime(e, i)
              }}
              onBlur={e => {
                this.checkTime(e, i)
              }}
              key={`input${i}`}
              value={r.value ? r.value : ''}
            />
            <span key={`time${i}`}>分钟</span>
            {r.error ? <span className="checkInvalid">输入不完整</span> : null}
          </li>
        )
      })
    return (
      <div className="infoList rateInfo">
        <ul>
          <li>
            <p>学校:</p>
            <SchoolSelector
              disabled={id}
              width={SELECTWIDTH}
              className={id ? 'disabled' : ''}
              invalidTitle="选择学校"
              selectedSchool={schoolId}
              changeSchool={this.changeSchool}
              checkSchool={this.checkSchool}
            />
            {schoolError ? (
              <span className="checkInvalid">请选择学校！</span>
            ) : null}
          </li>
          <li>
            <p>设备类型:</p>
            <DeviceWithoutAll
              selectedDevice={deviceType}
              changeDevice={this.changeDevice}
              checkDevice={this.checkDevice}
              disabled={id}
              width={SELECTWIDTH}
              className={id ? 'disabled' : ''}
            />
            {deviceTypeError ? (
              <span className="checkInvalid">请选择设备类型！</span>
            ) : null}
          </li>
          <li>
            <p>计费方式:</p>
            <BasicSelectorWithoutAll
              invalidTitle="选择计费方式"
              staticOpts={
                deviceType ? billingOptions[parseInt(deviceType, 10)] : {}
              }
              width={SELECTWIDTH}
              selectedOpt={billingMethod.toString()}
              changeOpt={this.changeBilling}
              checkOpt={this.checkBilling}
            />
            {billError ? (
              <span className="checkInvalid">请选择计费方式！</span>
            ) : null}
          </li>
          {deviceType !== DEVICE_TYPE_WASHER.toString() ? (
            <li className="itemsWrapper">
              <p>费率组:</p>
              <div>
                <ul>{rateItems}</ul>
                <AddPlusAbs
                  count={rateGroups.length}
                  add={this.add}
                  min={deviceType === '2' ? 3 : 1}
                  abstract={this.abstract}
                />
              </div>
            </li>
          ) : (
            <Fragment>
              <li>
                <p>单脱水:</p>
                <input
                  value={dryPrice}
                  type="number"
                  key="xxx"
                  onChange={this.changePriceForDryer}
                  onBlur={this.checkPriceForDryer}
                />
                <span>元</span>
                {dryPriceError ? (
                  <span className="checkInvalid">内容不能为空</span>
                ) : null}
              </li>
              <li>
                <p>一洗一漂一脱水:</p>
                <input
                  value={oneWashPrice}
                  type="number"
                  onChange={this.changePriceForOneWash}
                  onBlur={this.checkPriceForOneWash}
                />
                <span>元</span>
                {oneWashPriceError ? (
                  <span className="checkInvalid">内容不能为空</span>
                ) : null}
              </li>
              <li>
                <p>两洗一漂一脱水:</p>
                <input
                  value={twoWashPrice}
                  type="number"
                  onChange={this.changePriceForTwoWash}
                  onBlur={this.checkPriceForTwoWash}
                />
                <span>元</span>
                {twoWashPriceError ? (
                  <span className="checkInvalid">内容不能为空</span>
                ) : null}
              </li>
              <li>
                <p>两洗两漂一脱水:</p>
                <input
                  value={twoCleanPrice}
                  type="number"
                  onChange={this.changePriceForTwoClean}
                  onBlur={this.checkPriceForTwoClean}
                />
                <span>元</span>
                {twoCleanPriceError ? (
                  <span className="checkInvalid">内容不能为空</span>
                ) : null}
              </li>
            </Fragment>
          )}
          {deviceType !== DEVICE_TYPE_WASHER.toString() ? (
            <li className="itemsWrapper">
              <p>自动关阀时间:</p>
              <div>
                <ul>{tapItems}</ul>
                <AddPlusAbs
                  count={closeTapGroups.length}
                  add={this.addTime}
                  abstract={this.abstractTime}
                />
              </div>
            </li>
          ) : null}
        </ul>

        <div className="btnArea">
          <Button type="primary" onClick={this.comleteEdit}>
            确认
          </Button>
          <Button onClick={this.back}>
            {this.props.location.state
              ? BACKTITLE[this.props.location.state.path]
              : '返回'}
          </Button>
        </div>
      </div>
    )
  }
}

export default RateInfo
