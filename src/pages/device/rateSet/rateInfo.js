import React from 'react'

import { Button } from 'antd'

import AjaxHandler from '../../../util/ajax'
import Noti from '../../../util/noti'
import AddPlusAbs from '../../component/addPlusAbs'
import CONSTANTS from '../../../constants'
import SchoolSelector from '../../component/schoolSelectorWithoutAll'
import DeviceWithoutAll from '../../component/deviceWithoutAll'
import BasicSelectorWithoutAll from '../../component/basicSelectorWithoutAll'
import { mul, div } from '../../../util/numberHandle'

const Fragment = React.Fragment
const {
  DEVICE_TYPE_HEATER,
  DEVICE_TYPE_DRINGKER,
  DEVICE_TYPE_BLOWER,
  DEVICE_TYPE_WASHER,
  HEATER_BILLING_OPTIONS,
  DRINKER_BILLING_OPTIONS,
  BLOWER_BILLING_OPTIONS,
  WASHER_BILLING_OPTIONS
} = CONSTANTS

const billingOptions = {}
billingOptions[DEVICE_TYPE_HEATER] = HEATER_BILLING_OPTIONS
billingOptions[DEVICE_TYPE_DRINGKER] = DRINKER_BILLING_OPTIONS
billingOptions[DEVICE_TYPE_BLOWER] = BLOWER_BILLING_OPTIONS
billingOptions[DEVICE_TYPE_WASHER] = WASHER_BILLING_OPTIONS

const BACKTITLE = {
  fromInfoSet: '返回学校信息设置'
}

class RateInfo extends React.Component {
  constructor(props) {
    super(props)
    const id = 0,
      deviceType = '',
      schoolId = '',
      billingMethod = '',
      originalDT = 0,
      originalSchool = 0
    const rateGroups = [{}],
      deviceTypeError = false,
      schoolError = false,
      billError = false,
      closeTapGroups = [{}]
    let supplierId = '',
      supplierError = false,
      suppliers = {}
    const rateGroupsVersionB = [{}],
      currentAgreement = 1
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
      supplierId,
      originalSupplier: '',
      supplierError,
      suppliers,
      rateGroupsVersionB,
      currentAgreement,
      supplierData: [],
      posting: false,
      checking: false,
      dryPrice: '',
      dryPriceError: false,
      oneWashPrice: '',
      oneWashPricePriceError: false,
      twoWashPrice: '',
      twoWashPricePriceError: false,
      twoCleanPrice: '',
      twoCleanPriceError: false,
      unitPrice: '',
      unitPriceError: false,
      disabledSchDev: false // 从上线设置进入
    }
  }

  fetchSuppliers = () => {
    const resource = '/supplier/query/list'
    const body = {
      page: 1,
      size: 100
    }
    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data) {
          const suppliers = {},
            nextState = {}
          for (let i = 0; i < json.data.total; i++) {
            suppliers[json.data.supplierEntities[i].id] =
              json.data.supplierEntities[i].name
          }
          nextState.suppliers = suppliers
          nextState.supplierData = json.data.supplierEntities
          this.setState(nextState)
          if (this.state.id) {
            const body = {
              id: this.state.id
            }
            this.fetchData(body)
          }
        } else {
          throw new Error('网络出错，获取供应商列表失败，请稍后重试～')
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  fetchData = body => {
    const resource = '/api/rate/one'
    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data) {
          const r = json.data
          const nextState = {
            deviceType: r.deviceType.toString(),
            originalDT: r.deviceType,
            schoolId: r.schoolId,
            originalSchool: r.schoolId,
            billingMethod: r.billingMethod.toString()
          }
          if (json.data.unitPrice) {
            nextState.unitPrice = mul(json.data.unitPrice, 100)
          }

          const taps = r.timeLimit && r.timeLimit.map(r => ({ value: r }))
          if (taps) {
            nextState.closeTapGroups = taps
          }
          if (r.supplierId) {
            nextState.supplierId = r.supplierId
            nextState.originalSupplier = r.supplierId
          }
          if (r.deviceType === DEVICE_TYPE_WASHER) {
            const dryPrice =
              r.rateGroups && r.rateGroups.find(rate => rate.pulse === 1).price
            const oneWashPrice =
              r.rateGroups && r.rateGroups.find(rate => rate.pulse === 2).price
            const twoWashPrice =
              r.rateGroups && r.rateGroups.find(rate => rate.pulse === 3).price
            const twoCleanPrice =
              r.rateGroups && r.rateGroups.find(rate => rate.pulse === 4).price
            nextState.dryPrice = dryPrice ? dryPrice : ''
            nextState.oneWashPrice = oneWashPrice ? oneWashPrice : ''
            nextState.twoWashPrice = twoWashPrice ? twoWashPrice : ''
            nextState.twoCleanPrice = twoCleanPrice ? twoCleanPrice : ''
            if (r.supplierId) {
              nextState.supplierId = r.supplierId
            }
          } else {
            let setRateGroup = true // true时设置rateGroups, false设置rateGroupsVersionB
            if (r.supplierId) {
              // nextState.supplierId = r.supplierId;
              const supplier = this.state.supplierData.find(
                s => s.id === r.supplierId
              )
              if (
                supplier &&
                supplier.agreement === 2 &&
                r.deviceType !== DEVICE_TYPE_BLOWER
              ) {
                setRateGroup = false // 设置rateGroupsVersionB
                nextState.currentAgreement = 2
                nextState.rateGroupsVersionB =
                  r.rateGroups &&
                  r.rateGroups.map(rate => ({
                    price: rate.price ? mul(rate.price, 100) : '',
                    pulse: rate.pulse ? rate.pulse : '',
                    unitPulse: rate.unitPulse || ''
                  }))
              }
            }
            if (setRateGroup) {
              nextState.rateGroups =
                r.rateGroups &&
                r.rateGroups.map(rate => ({
                  price: rate.price ? mul(rate.price, 100) : '',
                  pulse: rate.pulse ? rate.pulse : ''
                }))
            }
          }
          this.setState(nextState)
        } else {
          throw new Error('网络出错，获取供应商列表失败，请稍后重试～')
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  componentDidMount() {
    this.props.hide(false)
    let data = this.props.location.query
    if (data) {
      let { schoolId, deviceType } = data
      this.setState({
        schoolId: schoolId,
        deviceType: deviceType.toString(),
        disabledSchDev: true
      })
    }
    if (this.props.match.params.id) {
      const id = parseInt(this.props.match.params.id.slice(1), 10)
      this.setState({
        id: id
      })
    }
    this.fetchSuppliers()
  }

  componentWillUnmount() {
    this.props.hide(true)
  }

  changeDevice = v => {
    const nextState = { deviceType: v }
    const rateGroups = [{}],
      rateGroupsVersionB = [{}]
    if (v === '2') {
      rateGroups.push({})
      rateGroups.push({})
      nextState.rateGroups = rateGroups

      rateGroupsVersionB.push({})
      rateGroupsVersionB.push({})
      nextState.rateGroupsVersionB = rateGroupsVersionB
    } else {
      nextState.rateGroups = rateGroups
      nextState.rateGroupsVersionB = rateGroupsVersionB
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
    /*
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
    */
  }
  checkExist = callback => {
    if (this.state.checking) {
      return
    }
    this.setState({
      checking: true
    })
    const resource = '/rate/check'
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
  changeUnitPrice = e => {
    this.setState({
      unitPrice: e.target.value
    })
  }
  checkUnitPrice = e => {
    const v = e.target.value.trim()
    const nextState = { unitPrice: v }
    if (!v) {
      nextState.unitPriceError = true
      return this.setState(nextState)
    }
    if (this.state.unitPriceError) {
      nextState.unitPriceError = false
    }
    this.setState(nextState)
  }
  checkInput = () => {
    debugger
    const {
      rateGroups,
      deviceType,
      billingMethod,
      schoolId,
      closeTapGroups,
      supplierId,
      supplierData,
      dryPrice,
      oneWashPrice,
      twoWashPrice,
      twoCleanPrice,
      unitPrice
    } = this.state
    if (!deviceType || deviceType === '0') {
      this.setState({
        deviceTypeError: true
      })
      return false
    }
    const nextState = { deviceTypeError: false }
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

    // if 'checkRateGroup' is true, means need to not versionB; else need to check 'rateGroupsVersionB'
    let checkRateGroups = true,
      rateGroupsVersionB = JSON.parse(
        JSON.stringify(this.state.rateGroupsVersionB)
      )

    if (deviceType === DEVICE_TYPE_WASHER.toString()) {
      // check washer, since it's different from other devices
      checkRateGroups = false
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
      // check device other than washer
      if (supplierId) {
        // this will always be true. The judge is based on the former rate set, which allowed supplilerId not set.
        let supplier = supplierData.find(r => r.id === supplierId)
        if (
          supplier &&
          supplier.agreement === 2 &&
          (deviceType === DEVICE_TYPE_HEATER.toString() ||
            deviceType === DEVICE_TYPE_DRINGKER.toString())
        ) {
          // this rate is set to versionB, need to check rateGroupsVersionB.
          checkRateGroups = false
          for (let i = 0; i < rateGroupsVersionB.length; i++) {
            const r = rateGroupsVersionB[i]
            if (!r.price || !r.pulse || !r.unitPulse) {
              r.error = true
              nextState.rateGroupsVersionB = rateGroupsVersionB
              this.setState(nextState)
              return false
            }
            // check if same to another rateset
            const same = rateGroupsVersionB.find((another, ind) => {
              // skip self
              if (ind === i) {
                return false
              }
              return (
                another.price === r.price &&
                another.pulse === r.pulse &&
                another.unitPulse === r.unitPulse
              )
            })
            if (same) {
              r.same = true
              nextState.rateGroupsVersionB = rateGroupsVersionB
              this.setState(nextState)
              return false
            }
            delete rateGroupsVersionB[i].error
            delete rateGroupsVersionB[i].same
          }
        }
      }
      if (checkRateGroups) {
        // 检查unitPrice是否填入
        if (
          (deviceType === DEVICE_TYPE_HEATER.toString() ||
            deviceType === DEVICE_TYPE_DRINGKER.toString()) &&
          !unitPrice
        ) {
          nextState.unitPriceError = true
          return this.setState(nextState)
        }
        const rates = JSON.parse(JSON.stringify(rateGroups))
        for (let i = 0; i < rates.length; i++) {
          const r = rates[i]
          if (!r.price || !r.pulse) {
            r.error = true
            nextState.rateGroups = rates
            this.setState(nextState)
            return false
          }
          // check if same to another rateset
          const same = rates.find((another, ind) => {
            // skip self
            if (ind === i) {
              return false
            }
            return another.price === r.price && another.pulse === r.pulse
          })
          if (same) {
            r.same = true
            nextState.rateGroups = rates
            this.setState(nextState)
            return false
          }
          delete r.same
          delete r.error
        }
      }

      // check close tap setting.
      const taps = JSON.parse(JSON.stringify(closeTapGroups))
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

    let { id, checking, posting } = this.state

    if (checking || posting) {
      return
    }
    /*
    if (
      !(
        id &&
        parseInt(deviceType, 10) === originalDT &&
        parseInt(schoolId, 10) === originalSchool &&
        parseInt(supplierId, 10) === originalSupplier
      )
    ) {
      this.checkExist(this.postInfo)
    } else {
      this.postInfo()
    }
    */
    // since 'schoolId', 'deviceType', and 'supplierId' can't be changed when editing, only check if editing is ok.
    if (id) {
      this.postInfo()
    } else {
      this.checkExist(this.postInfo)
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
    const rateGroupsVersionB = JSON.parse(
      JSON.stringify(this.state.rateGroupsVersionB)
    )
    const taps = this.state.closeTapGroups.map(r => r.value)
    let {
      id,
      deviceType,
      billingMethod,
      schoolId,
      supplierId,
      supplierData,
      dryPrice,
      oneWashPrice,
      twoWashPrice,
      twoCleanPrice,
      unitPrice
    } = this.state
    const body = {
      billingMethod: parseInt(billingMethod, 10),
      deviceType: parseInt(deviceType, 10),
      schoolId: parseInt(schoolId, 10)
    }
    if (id) {
      body.id = parseInt(id, 10)
    }
    if (supplierId) {
      body.supplierId = parseInt(supplierId, 10)
    }

    if (deviceType === DEVICE_TYPE_WASHER.toString()) {
      const rates = [
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
        if (r.price) {
          r.price = div(r.price, 100)
        }
      })
      let setRateGroups = true
      rateGroupsVersionB.forEach(r => {
        if (r.price) {
          r.price = div(r.price, 100)
          r.unitPulse = parseInt(r.unitPulse, 10)
        }
      })
      if (supplierId) {
        // body.supplierId = parseInt(supplierId, 10);
        const supplier = supplierData.find(r => r.id === supplierId)
        if (
          supplier &&
          supplier.agreement === 2 &&
          deviceType !== DEVICE_TYPE_BLOWER.toString()
        ) {
          // found, set rates to rateGroupsVersionB
          setRateGroups = false
          body.rates = rateGroupsVersionB
        }
      }
      if (setRateGroups) {
        // set rates to rateGroups
        body.rates = rateGroups
        if (
          deviceType === DEVICE_TYPE_HEATER.toString() ||
          deviceType === DEVICE_TYPE_DRINGKER.toString()
        ) {
          body.unitPrice = div(unitPrice, 100)
        }
      }
      body.timeLimit = taps
    }

    const resource = '/api/rate/save'
    const cb = json => {
      if (json.data) {
        Noti.hintSuccess(this.props.history, '/device/rateSet')
      } else {
        throw new Error('网络出错，请稍后重试～')
      }
    }
    AjaxHandler.ajax(resource, body, cb)
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
    const closeTapGroups = JSON.parse(JSON.stringify(this.state.closeTapGroups))
    closeTapGroups.push({})
    this.setState({
      closeTapGroups: closeTapGroups
    })
  }
  abstractTime = e => {
    const closeTapGroups = JSON.parse(JSON.stringify(this.state.closeTapGroups))
    closeTapGroups.pop()
    this.setState({
      closeTapGroups: closeTapGroups
    })
  }
  changeTime = (e, i) => {
    const closeTapGroups = JSON.parse(JSON.stringify(this.state.closeTapGroups))
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
  changeSupplier = v => {
    let id = parseInt(v, 10)
    const nextState = {
      supplierId: id
    }
    const supplier =
      this.state.supplierData && this.state.supplierData.find(r => r.id === id)
    console.log(supplier)
    if (supplier && supplier.agreement === 2) {
      nextState.currentAgreement = 2
    } else {
      nextState.currentAgreement = 1
    }
    this.setState(nextState)
  }
  changeWaterB = (e, i) => {
    const v = e.target.value
    const o = JSON.parse(JSON.stringify(this.state.rateGroupsVersionB))
    o[i].volume = parseFloat(v)
    this.setState({
      rateGroupsVersionB: o
    })
  }
  changePriceB = (e, i) => {
    const v = e.target.value
    const o = JSON.parse(JSON.stringify(this.state.rateGroupsVersionB))
    o[i].price = parseInt(v, 10)
    this.setState({
      rateGroupsVersionB: o
    })
  }
  changePulseB = (e, i) => {
    const v = e.target.value
    const o = JSON.parse(JSON.stringify(this.state.rateGroupsVersionB))
    o[i].pulse = parseInt(v, 10)
    this.setState({
      rateGroupsVersionB: o
    })
  }
  changeUnitPulseB = (e, i) => {
    const v = e.target.value
    const o = JSON.parse(JSON.stringify(this.state.rateGroupsVersionB))
    o[i].unitPulse = parseInt(v, 10)
    this.setState({
      rateGroupsVersionB: o
    })
  }
  addB = () => {
    const rateGroupsVersionB = JSON.parse(
      JSON.stringify(this.state.rateGroupsVersionB)
    )
    rateGroupsVersionB.push({})
    this.setState({
      rateGroupsVersionB: rateGroupsVersionB
    })
  }
  abstractB = () => {
    const rateGroupsVersionB = JSON.parse(
      JSON.stringify(this.state.rateGroupsVersionB)
    )
    rateGroupsVersionB.pop()
    this.setState({
      rateGroupsVersionB: rateGroupsVersionB
    })
  }
  changePriceForDryer = e => {
    this.setState({
      dryPrice: e.target.value
    })
  }
  checkPriceForDryer = e => {
    const v = e.target.value
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
    const v = e.target.value
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
    const v = e.target.value
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
    const v = e.target.value
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
      disabledSchDev,
      id,
      schoolId,
      schoolError,
      deviceType,
      deviceTypeError,
      billingMethod,
      billError,
      rateGroups,
      closeTapGroups,
      supplierId,
      suppliers,
      rateGroupsVersionB,
      currentAgreement,
      dryPrice,
      dryPriceError,
      oneWashPrice,
      oneWashPriceError,
      twoWashPrice,
      twoWashPriceError,
      twoCleanPrice,
      twoCleanPriceError,
      unitPrice, // 一升水的价格
      unitPriceError
    } = this.state

    const rateItems =
      rateGroups &&
      rateGroups.map((r, i) => {
        return (
          <li className="rateSets" key={`rateA${i}`}>
            <p>费率组{i + 1}:</p>
            <input
              type="number"
              className="shortInput"
              onChange={e => {
                this.changePrice(e, i)
              }}
              onBlur={e => {
                this.checkPrice(e, i)
              }}
              key={`priceA${i}`}
              value={r.price ? r.price : ''}
            />
            <span key={`spanA2${i}`}>分钱/</span>
            <input
              type="number"
              className="shortInput"
              onChange={e => {
                this.changePulse(e, i)
              }}
              onBlur={e => {
                this.checkPulse(e, i)
              }}
              key={`pulseA${i}`}
              value={r.pulse ? r.pulse : ''}
            />
            <span key={`spanA3${i}`}>
              {deviceType === DEVICE_TYPE_BLOWER.toString() ? '秒' : '脉冲'}
            </span>
            {r.error ? (
              <span key={`errorA${i}`} className="checkInvalid">
                输入不完整
              </span>
            ) : null}
            {r.same ? (
              <span key={`same${i}`} className="checkInvalid">
                请勿输入重复的费率设置
              </span>
            ) : null}
          </li>
        )
      })
    const rateItemsVersionB =
      rateGroupsVersionB &&
      rateGroupsVersionB.map((r, i) => {
        return (
          <li key={`rateB${i}`}>
            <p>费率组{i + 1}:</p>
            <span key={`spanVolume${i}`}>1升水 =</span>
            <input
              type="number"
              className="shortInput"
              onChange={e => {
                this.changeUnitPulseB(e, i)
              }}
              key={`unitPulseB${i}`}
              value={r.unitPulse || ''}
            />
            <span className="rightSeperatorBig" key={`spanUnitPulse${i}`}>
              脉冲
            </span>
            <input
              type="number"
              className="shortInput"
              onChange={e => {
                this.changePriceB(e, i)
              }}
              key={`priceB${i}`}
              value={r.price ? r.price : ''}
            />
            <span key={`spanPrice${i}`}>分钱 =</span>
            <input
              type="number"
              className="shortInput"
              onChange={e => {
                this.changePulseB(e, i)
              }}
              key={`pulseB${i}`}
              value={r.pulse ? r.pulse : ''}
            />
            <span key={`spanPulse${i}`}>脉冲</span>
            {r.error ? (
              <span key={`errorB${i}`} className="checkInvalid">
                输入不完整
              </span>
            ) : null}
            {r.same ? (
              <span key={`same${i}`} className="checkInvalid">
                请勿输入重复的费率设置
              </span>
            ) : null}
          </li>
        )
      })
    // if not washer: if blower, must be rateItems; else check if XINNA agreement
    const notWasherRates =
      currentAgreement === 2 && deviceType !== DEVICE_TYPE_BLOWER.toString() ? (
        <Fragment>
          {rateItemsVersionB}
          <li>
            <p />
            <AddPlusAbs
              count={rateGroupsVersionB.length}
              add={this.addB}
              min={deviceType === '2' ? 3 : 1}
              abstract={this.abstractB}
            />
          </li>
        </Fragment>
      ) : (
        <Fragment>
          {rateItems}
          <li>
            <p />
            <AddPlusAbs
              count={rateGroups.length}
              add={this.add}
              min={deviceType === '2' ? 3 : 1}
              abstract={this.abstract}
            />
          </li>

          {// 不是吹风机，则需要添加每升水的价格。2018/5/3
          deviceType !== DEVICE_TYPE_BLOWER.toString() ? (
            <li>
              <p />
              <span>1升水 =</span>
              <input
                type="number"
                className="shortInput"
                onChange={this.changeUnitPrice}
                onBlur={this.checkUnitPrice}
                value={unitPrice}
              />
              <span>分钱</span>
              {unitPriceError ? (
                <span className="checkInvalid">请输入水量单价</span>
              ) : null}
            </li>
          ) : null}
        </Fragment>
      )
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
            {r.error ? (
              <span key={`error${i}`} className="checkInvalid">
                输入不完整
              </span>
            ) : null}
          </li>
        )
      })
    return (
      <div className="infoList rateInfo">
        <ul>
          <li>
            <p>学校:</p>
            <SchoolSelector
              disabled={id || disabledSchDev}
              width={CONSTANTS.SELECTWIDTH}
              className={id || disabledSchDev ? 'disabled' : ''}
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
              disabled={id || disabledSchDev}
              width={CONSTANTS.SELECTWIDTH}
              className={id || disabledSchDev ? 'disabled' : ''}
            />
            {deviceTypeError ? (
              <span className="checkInvalid">请选择设备类型！</span>
            ) : null}
          </li>
          <li>
            <p>供应商:</p>
            <BasicSelectorWithoutAll
              invalidTitle="选择供应商"
              staticOpts={suppliers}
              width={CONSTANTS.SELECTWIDTH}
              selectedOpt={supplierId}
              changeOpt={this.changeSupplier}
              checkOpt={this.checkSupplier}
              disabled={id}
              className={id ? 'disabled' : ''}
            />
          </li>
          <li>
            <p>计费方式:</p>
            <BasicSelectorWithoutAll
              invalidTitle="选择计费方式"
              staticOpts={
                deviceType ? billingOptions[parseInt(deviceType, 10)] : {}
              }
              width={CONSTANTS.SELECTWIDTH}
              selectedOpt={billingMethod.toString()}
              changeOpt={this.changeBilling}
              checkOpt={this.checkBilling}
            />
            {billError ? (
              <span className="checkInvalid">请选择计费方式！</span>
            ) : null}
          </li>

          {deviceType !== DEVICE_TYPE_WASHER.toString() ? (
            notWasherRates
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
