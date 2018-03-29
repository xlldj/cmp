import React from 'react'
import moment from 'moment'
import {
  Button,
  Radio,
  Modal,
  Table,
  notification,
  Select,
  DatePicker
} from 'antd'
import AjaxHandler from '../../../util/ajax'
import Noti from '../../../util/noti'
import CONSTANTS from '../../../constants'
import Time from '../../../util/time'
import PicturesWall from '../../component/picturesWall'
import SchoolSelector from '../../component/schoolSelectorWithoutAll'
import BasicSelectorWithoutAll from '../../component/basicSelectorWithoutAll'
const {
  FILEADDR,
  GIFT_ACT_CODE,
  GIFT_ACT_H5,
  GIFT_ACT_NEW,
  RELEASE_RANDOM
} = CONSTANTS
const Option = Select.Option

const RadioGroup = Radio.Group

const deviceName = CONSTANTS.DEVICETYPE
const BACKTITLE = {
  fromInfoSet: '返回学校信息设置'
}

/* state explanation */
/* released: 活动是否发布，即是否在发挥作用(判断标准：1. 在有效期内；2. online为1) */
/* online: 是否上线。默认新建时不论是否在有效期内，都置位true。编辑时如果在有效期内根据返回的字段置位 */
class ActInfo extends React.Component {
  constructor(props) {
    super(props)
    let fileList = []
    this.state = {
      id: '',
      selectedSchool: '',
      originalSchool: '',
      schoolError: false,
      type: '',
      originalType: '',
      typeError: false,
      name: '',
      originalName: '',
      nameError: false,
      endTime: moment(),
      endTimeError: false,
      online: true,
      onlineError: false,
      amount: 0,
      amountError: false,
      releaseMethod: '',
      releaseMethodError: false,
      releaseMethodLock: false,
      releaseMethodLockHint: false,
      amountRandom: '',
      amountRandomError: false,
      randomErrorMessage: '',
      imageEntrance: '',
      url: '',
      urlError: false,
      code: '',
      originalCode: '',
      codeError: false,
      inventory: '',
      inventoryError: false,
      remainInventory: '',
      usedInventory: 0,
      inventoryErrorMsg: '',

      schools: [],
      gifts: [],
      fileList: fileList,
      imageError: false,

      released: false,
      startTime: moment(),
      startTimeError: '',

      posting: false,
      checking: false
    }
  }
  fetchGifts = () => {
    let resource = '/api/gift/list'
    const body = {
      page: 1,
      size: 100
    }
    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data) {
          this.setState({
            gifts: json.data.gifts
          })
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
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  fetchSchools = () => {
    let resource = '/api/school/list'
    const body = {
      page: 1,
      size: 100
    }
    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data) {
          this.setState({
            schools: json.data.schools
          })
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  fetchData = body => {
    let resource = '/api/gift/activity/details'
    const cb = json => {
      if (json.error) {
        throw new Error(json.error)
      } else {
        if (json.data) {
          let d = json.data
          let gifts = JSON.parse(JSON.stringify(this.state.gifts)) //this is the denominations for update state.denominations
          let newState = {} //this is the state for update
          newState.selectedSchool = d.schoolId.toString()
          newState.originalSchool = d.schoolId
          newState.name = d.name.trim()
          newState.originalName = d.name.trim()
          newState.type = d.type.toString()
          newState.originalType = d.type
          if (d.type === GIFT_ACT_NEW) {
            newState.releaseMethodLock = true
          }
          newState.amount = d.amount ? d.amount : ''
          newState.releaseMethod = d.releaseMethod
            ? d.releaseMethod.toString()
            : ''
          if (d.releaseMethod === RELEASE_RANDOM && d.amountRandom) {
            newState.amountRandom = d.amountRandom
          }
          if (d.type === GIFT_ACT_CODE) {
            newState.inventory = d.planInventory
            newState.remainInventory = d.inventory
            newState.usedInventory = d.planInventory - d.inventory
            newState.code = d.code.trim()
            newState.originalCode = d.code
          } else {
            if (d.imageEntrance) {
              newState.fileList = [
                {
                  uid: -22,
                  status: 'done',
                  url: FILEADDR + d.imageEntrance
                }
              ]
            }
            newState.url = d.url ? d.url : ''
          }
          newState.startTime = d.startTime
          newState.endTime = d.endTime
          let timeValid =
            Date.parse(new Date()) >= d.startTime &&
            Date.parse(new Date()) <= d.endTime
          newState.online = d.online === 1 ? true : false
          if (timeValid && d.online === 1) {
            newState.released = true
          } else {
            newState.released = false
          }
          d.gifts &&
            d.gifts.forEach((g, i) => {
              let gift = gifts.find((r, ind) => r.id === g.giftId)
              if (!!gift) {
                gift.count = g.quantity
              }
            })
          newState.gifts = gifts
          this.setState(newState)
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  componentDidMount() {
    this.props.hide(false)
    this.fetchSchools()
    this.fetchGifts()
  }
  componentWillUnmount() {
    this.props.hide(true)
  }

  handleBack = () => {
    this.props.history.push('/gift/act')
  }
  changeSchool = v => {
    this.setState({
      selectedSchool: v
    })
  }
  checkSchool = v => {
    if (v === 'all') {
      return this.setState({
        schoolError: true
      })
    }
    if (this.state.schoolError) {
      this.setState({
        schoolError: false
      })
    }
  }
  changeName = e => {
    this.setState({
      name: e.target.value
    })
  }
  checkName = e => {
    let v = e.target.value.trim()
    if (!v) {
      return this.setState({
        name: v,
        nameError: true
      })
    }
    let nextState = {
      name: v
    }
    if (this.state.nameError) {
      nextState.nameError = false
    }
    this.setState(nextState)
  }
  hintLock = () => {
    notification.open({
      message: '当前类型只能选择全部发放！',
      description: '请继续选择其他项，或选择其他活动类型！'
    })
  }
  changeType = v => {
    let newState = {}
    newState.type = v
    if (v === '1') {
      newState.releaseMethod = '1'
      newState.releaseMethodLock = true
    } else {
      if (this.state.releaseMethodLock) {
        newState.releaseMethodLock = false
      }
    }
    this.setState(newState)
  }
  checkType = v => {
    if (v === '0' || !v) {
      return this.setState({
        typeError: true
      })
    }
    if (this.state.typeError) {
      this.setState({
        typeError: false
      })
    }
  }
  handleSubmit = () => {
    /*-------------need to check the data here---------------*/
    let {
      id,
      selectedSchool,
      name,
      type,
      amount,
      online,
      releaseMethod,
      inventory,
      usedInventory,
      code,
      released,
      fileList,
      imageError,
      posting,
      checking
    } = this.state
    if (!selectedSchool) {
      return this.setState({
        schoolError: true
      })
    }
    if (!name) {
      return this.setState({
        nameError: true
      })
    }
    if (!type) {
      return this.setState({
        typeError: true
      })
    }
    if (type !== GIFT_ACT_H5.toString() && !amount) {
      return this.setState({
        amountError: true
      })
    }
    if (type !== GIFT_ACT_H5.toString() && !releaseMethod) {
      return this.setState({
        releaseMethodError: true
      })
    }
    if (type === GIFT_ACT_CODE.toString()) {
      if (!code) {
        return this.setState({
          codeError: true
        })
      }
      if (!inventory) {
        return this.setState({
          inventoryError: true,
          inventoryErrorMsg: '库存不能为空'
        })
      }
      if (usedInventory && inventory < usedInventory) {
        return this.setState({
          inventoryError: true,
          inventoryErrorMsg: '库存不能小于已发个数'
        })
      }
    } else {
      if (fileList.length < 1) {
        return this.setState({
          imageError: true
        })
      } else if (imageError) {
        this.setState({
          imageError: false
        })
      }
    }
    if (released && online) {
      return this.props.history.push('/gift/act')
    }
    /* 如果是在编辑，没有改变学校和关键字段, 执行下线操作
    (在以后的版本中，只有在有效期内才能操作online。为了兼容之前的版本，这里对是否在有效期内进行检测，只有在有效期内且是下线操作才不用查重-2017/12/6 v1.0.1)
    ，不需要查重 */
    // let start = parseInt(moment(startTime).valueOf(), 10)
    // let end = parseInt(moment(endTime).valueOf(), 10)
    // let timeValid = Date.parse(new Date()) >= start && Date.parse(new Date()) <= end
    if (posting || checking) {
      return
    }
    if (id && this.checkSame()) {
      this.postInfo()
    } else {
      this.checkExist(this.postInfo)
    }
    // this.postInfo()
  }
  checkSame = () => {
    let {
      selectedSchool,
      name,
      type,
      code,
      originalSchool,
      originalName,
      originalType,
      originalCode
    } = this.state
    if (parseInt(selectedSchool, 10) !== originalSchool) {
      return false
    }
    if (name !== originalName) {
      return false
    }
    if (parseInt(type, 10) !== originalType) {
      return false
    }
    if (type === GIFT_ACT_CODE.toString() && code !== originalCode) {
      return false
    }
    return true
  }
  checkExist = callback => {
    let { selectedSchool, type, code, name, checking } = this.state
    let url = '/gift/activity/check'
    const body = {
      schoolId: parseInt(selectedSchool, 10),
      name: name,
      type: parseInt(type, 10)
    }
    if (type === GIFT_ACT_CODE.toString()) {
      body.code = code
    }
    const cb = json => {
      this.setState({
        checking: false
      })
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data.result) {
          Noti.hintLock(
            '请求出错',
            '已存在与当前设置重复的红包活动，请勿重复提交'
          )
        } else {
          if (callback) {
            callback()
          }
        }
      }
    }
    if (checking) {
      return
    } else {
      this.setState({
        checking: true
      })
    }
    AjaxHandler.ajax(url, body, cb, null, {
      clearChecking: true,
      thisObj: this
    })
  }
  postInfo = () => {
    let resource = '/api/gift/activity/save'
    let {
        gifts,
        type,
        name,
        selectedSchool,
        amount,
        releaseMethod,
        amountRandom,
        startTime,
        endTime,
        fileList,
        url,
        inventory,
        code,
        online,
        posting
      } = this.state,
      items = []
    gifts.forEach((g, i) => {
      if (g.count) {
        items.push({
          giftId: g.id,
          quantity: g.count
        })
      }
    })
    let start = parseInt(moment(startTime).valueOf(), 10)
    let end = parseInt(moment(endTime).valueOf(), 10)
    const body = {
      schoolId: parseInt(selectedSchool, 10),
      name: name,
      type: parseInt(type, 10),
      startTime: start,
      endTime: end,
      online: online
    }
    if (type !== GIFT_ACT_H5.toString()) {
      body.amount = amount
      body.releaseMethod = +releaseMethod
      body.gifts = items
    }
    if (releaseMethod === RELEASE_RANDOM.toString()) {
      // depracated.
      body.amountRandom = parseInt(amountRandom, 10)
    }
    if (type === GIFT_ACT_CODE.toString()) {
      body.inventory = inventory
      body.code = code
    } else {
      if (fileList.length > 0) {
        body.imageEntrance = fileList[0].url.replace(FILEADDR, '')
      }
      body.url = url
    }
    if (this.props.match.params.id) {
      body.id = parseInt(this.props.match.params.id.slice(1), 10)
    }
    const cb = json => {
      let nextState = {
        posting: false
      }
      if (json.error) {
        Noti.hintLock(
          '请求出错',
          json.error.displayMessage || '请求出错, 请稍后刷新重试'
        )
      } else {
        if (json.data) {
          if (this.state.released && !this.state.online) {
            // this.openNotificationWithIcon('info')
            Noti.hintOk('当前活动已下线', '您可以对此活动继续编辑！')
            nextState.released = false
          } else {
            let timeValid =
              Date.parse(new Date()) >= start && Date.parse(new Date()) <= end
            if (this.state.online && timeValid) {
              return Noti.hintAndRoute(
                '当前活动已上线',
                '将返回活动列表！',
                this.props.history,
                '/gift/act'
              )
            }
            Noti.hintSuccess(this.props.history, '/gift/act')
          }
        } else {
          Noti.hintLock('请求出错', '网络出错, 请稍后刷新重试')
        }
      }
      this.setState(nextState)
    }
    if (posting) {
      return
    } else {
      this.setState({
        posting: true
      })
    }
    AjaxHandler.ajax(resource, body, cb, null, {
      clearPosting: true,
      thisObj: this
    })
  }
  openNotification = () => {
    notification.open({
      message: '当前活动已上线',
      description: '将返回活动列表！',
      onClose: () => {
        this.props.history.push('/gift/act')
      },
      duration: 2
    })
  }
  openNotificationWithIcon = type => {
    notification['info']({
      message: '当前活动已下线',
      description: '您可以对此活动继续编辑！',
      duration: 2
    })
  }
  changeEndTime = v => {
    this.setState({
      endTime: v
    })
  }
  changeStartTime = t => {
    this.setState({
      startTime: t
    })
  }
  chooseGifts = (e, i) => {
    e.preventDefault()
    this.setState({
      editingDenomination: i,
      showGifts: true
    })
  }
  setGift = (gifts, total) => {
    if (!total) {
      return this.setState({
        amountError: true
      })
    }
    let newState = {}
    if (this.state.amountError) {
      newState.amountError = false
    }
    let oriGifts = JSON.parse(JSON.stringify(this.state.gifts))
    newState.amount = total
    gifts.forEach((g, i) => {
      if (g.count) {
        let editGift = oriGifts.find((r, i) => r.id === g.id)
        if (!!editGift) {
          editGift.count = g.count
        }
      }
    })
    newState.gifts = oriGifts
    this.setState(newState)
  }
  closeModal = () => {
    this.setState({
      showGifts: false
    })
  }
  changeOnline = v => {
    let nextState = {
      online: v.target.value
    }
    this.setState(nextState)
  }
  checkOnline = v => {
    this.setState({
      onlineError: false
    })
  }
  changeReleaseMethod = e => {
    let newState = {}
    let v = e.target.value
    let { releaseMethodLock } = this.state
    if (releaseMethodLock) {
      return this.hintLock()
    }
    if (!v) {
      return this.setState({
        releaseMethodError: true
      })
    }
    if (this.state.releaseMethodError) {
      newState.releaseMethodError = false
    }
    newState.releaseMethod = e.target.value
    if (v === '1' && this.state.amountRandomError) {
      newState.amountRandomError = false
    }
    this.setState(newState)
  }
  handleLogo = e => {
    var data = new FormData()
    data.append('file', e.target.files[0])
    const cb = json => {
      this.setState({
        imageEntrance: json.data
      })
    }
    AjaxHandler.uploadFile(data, cb)
  }
  changeAmountRandom = e => {
    this.setState({
      amountRandom: e.target.value
    })
  }
  checkAmountRandom = e => {
    if (!e.target.value) {
      return this.setState({
        amountRandomError: true,
        randomErrorMessage: '请输入随机红包个数！'
      })
    }
    if (e.target.value > this.state.amount) {
      return this.setState({
        amountRandomError: true,
        randomErrorMessage: '随机红包个数越界！'
      })
    }
    if (this.state.amountRandomError) {
      this.setState({
        amountRandomError: false
      })
    }
  }
  changeCode = e => {
    this.setState({
      code: e.target.value
    })
  }
  checkCode = e => {
    let v = e.target.value
    if (!v) {
      return this.setState({
        code: v,
        codeError: true
      })
    }
    let nextState = {
      code: v
    }
    if (this.state.codeError) {
      nextState.codeError = false
    }
    this.setState(nextState)
  }
  changeInventory = e => {
    this.setState({
      inventory: e.target.value
    })
  }
  checkInventory = e => {
    let v = parseInt(e.target.value, 10)
    if (!v) {
      return this.setState({
        inventoryError: true,
        inventoryErrorMsg: '库存不能为空'
      })
    }
    let { usedInventory } = this.state
    if (usedInventory && v < this.state.usedInventory) {
      return this.setState({
        inventoryError: true,
        inventoryErrorMsg: '库存不能小于已发个数'
      })
    }
    if (this.state.inventoryError) {
      this.setState({
        inventoryError: false
      })
    }
  }
  changeUrl = e => {
    this.setState({
      url: e.target.value
    })
  }
  checkUrl = e => {
    let v = e.target.value.trim()
    if (!v) {
      return this.setState({
        url: v,
        urlError: true
      })
    }
    let nextState = {
      url: v
    }
    if (this.state.urlError) {
      nextState.urlError = false
    }
    this.setState(nextState)
  }
  setImages = fileList => {
    let nextState = {}
    if (fileList.length > 0 && this.state.imageError) {
      nextState.imageError = false
    }
    nextState.fileList = JSON.parse(JSON.stringify(fileList))
    this.setState(nextState)
  }
  cancelSubmit = () => {
    this.props.history.goBack()
  }
  render() {
    let {
      id,
      selectedSchool,
      schoolError,
      type,
      typeError,
      name,
      nameError,
      endTime,
      endTimeError,
      online,
      amount,
      amountError,
      releaseMethod,
      releaseMethodError,
      amountRandom,
      amountRandomError,
      randomErrorMessage,
      url,
      urlError,
      code,
      codeError,
      inventory,
      inventoryError,
      remainInventory,
      usedInventory,
      inventoryErrorMsg,
      gifts,
      fileList,
      released,
      imageError,
      startTime,
      startTimeError
    } = this.state

    let timeValid =
      Date.parse(new Date()) >= parseInt(moment(startTime).valueOf(), 10) &&
      Date.parse(new Date()) <= parseInt(moment(endTime).valueOf(), 10)

    const selectRandomGift = (
      <span>
        {amount}个红包随机选择
        <input
          disabled={released ? true : false}
          className={released ? 'disabled' : ''}
          type="number"
          min="0"
          max={amount}
          style={{ width: '50px', marginLeft: '5px', marginRight: '5px' }}
          value={amountRandom}
          onChange={this.changeAmountRandom}
          onBlur={this.checkAmountRandom}
        />
        个发放
      </span>
    )

    return (
      <div className="infoList">
        <ul>
          <li>
            <p>学校名称：</p>
            <SchoolSelector
              disabled={id}
              className={id ? 'disabled' : ''}
              width={CONSTANTS.SELECTWIDTH}
              selectedSchool={selectedSchool}
              checkSchool={this.checkSchool}
              changeSchool={this.changeSchool}
            />
            {schoolError ? (
              <span className="checkInvalid">请选择学校！</span>
            ) : null}
          </li>
          <li>
            <p>活动名称：</p>
            <input
              disabled={released ? true : false}
              className={released ? 'disabled' : ''}
              value={name}
              onChange={this.changeName}
              onBlur={this.checkName}
              placeholder=""
            />
            {nameError ? (
              <span className="checkInvalid">活动名称不能为空！</span>
            ) : null}
          </li>
          <li>
            <p>活动类型：</p>
            <BasicSelectorWithoutAll
              staticOpts={CONSTANTS.GIFTACTTYPE}
              selectedOpt={type}
              disabled={released ? true : false}
              width={CONSTANTS.SELECTWIDTH}
              changeOpt={this.changeType}
              invalidTitle="选择类型"
              checkOpt={this.checkType}
              className={released ? 'disabled' : ''}
            />
            {typeError ? (
              <span className="checkInvalid">请选择活动类型！</span>
            ) : null}
          </li>

          {type && type !== GIFT_ACT_H5.toString() ? (
            <li>
              <p>红包数量：</p>
              <input
                disabled
                className={released ? 'center disabled' : 'center'}
                value={amount ? `已选择${amount}个红包` : '未选择'}
              />
              <a
                className="mgl10"
                disabled={released ? true : false}
                href=""
                onClick={this.chooseGifts}
              >
                选择红包
              </a>
              {amountError ? (
                <span className="checkInvalid">
                  未选择红包,已选择后不能清零！
                </span>
              ) : null}
            </li>
          ) : null}
          {type && type !== GIFT_ACT_H5.toString() ? (
            <li>
              <p>红包发放方式：</p>
              <RadioGroup
                disabled={released ? true : false}
                onChange={this.changeReleaseMethod}
                value={releaseMethod}
              >
                <Radio value="1">全部发放</Radio>
                <Radio value="2">随机发放</Radio>
              </RadioGroup>
              {releaseMethod === '2' ? selectRandomGift : null}
              {releaseMethodError ? (
                <span className="checkInvalid">请选择发放方式！</span>
              ) : null}
              {amountRandomError ? (
                <span className="checkInvalid">{randomErrorMessage}</span>
              ) : null}
            </li>
          ) : null}
          {type && type === GIFT_ACT_CODE.toString() ? (
            <li>
              <p>红包库存：</p>
              <input
                type="number"
                min={id ? usedInventory : 0}
                disabled={released ? true : false}
                className={released ? 'disabled' : ''}
                value={inventory}
                onChange={this.changeInventory}
                onBlur={this.checkInventory}
                placeholder=""
              />
              {id ? (
                <span className="mgl10">
                  (已发个数:{usedInventory}/剩余库存:{remainInventory})
                </span>
              ) : null}
              {inventoryError ? (
                <span className="checkInvalid">{inventoryErrorMsg}</span>
              ) : null}
            </li>
          ) : null}
          {type && type === GIFT_ACT_CODE.toString() ? (
            <li>
              <p>兑换码内容：</p>
              <input
                disabled={released ? true : false}
                className={released ? 'disabled' : ''}
                value={code}
                onChange={this.changeCode}
                onBlur={this.checkCode}
                placeholder=""
              />
              {codeError ? (
                <span className="checkInvalid">请输入兑换码！</span>
              ) : null}
            </li>
          ) : null}
          {type && type !== GIFT_ACT_CODE.toString() ? (
            <li className="imgWrapper">
              <p>活动入口图：</p>
              <span className="noPadding">
                <PicturesWall
                  limit={1}
                  setImages={this.setImages}
                  fileList={fileList}
                  dir="bonus-act"
                  disabled={released ? true : false}
                />
              </span>
              {imageError ? (
                <span className="checkInvalid">请选择活动入口图！</span>
              ) : null}
            </li>
          ) : null}
          {type && type !== GIFT_ACT_CODE.toString() ? (
            <li>
              <p>活动地址：</p>
              <input
                disabled={released ? true : false}
                className={released ? 'disabled longInput' : 'longInput'}
                value={url}
                onChange={this.changeUrl}
                onBlur={this.checkUrl}
                placeholder=""
              />
              {urlError ? (
                <span className="checkInvalid">请输入活动地址！</span>
              ) : null}
            </li>
          ) : null}
          {type ? (
            <li>
              <p>活动上线时间:</p>
              <DatePicker
                disabled={released ? true : false}
                showTime
                className="timePicker"
                allowClear={false}
                value={moment(startTime)}
                format="YYYY-MM-DD HH:mm"
                onChange={this.changeStartTime}
              />
              {startTimeError ? (
                <span className="checkInvalid">请选择上线时间！</span>
              ) : null}
            </li>
          ) : null}
          {type ? (
            <li>
              <p>活动截至时间:</p>
              <DatePicker
                showTime
                disabled={released ? true : false}
                className="timePicker"
                allowClear={false}
                value={moment(endTime)}
                format="YYYY-MM-DD HH:mm"
                onChange={this.changeEndTime}
              />
              {endTimeError ? (
                <span className="checkInvalid">请选择截止时间！</span>
              ) : null}
            </li>
          ) : null}
          {id && type && timeValid ? (
            <li>
              <p>活动是否上线：</p>
              <RadioGroup onChange={this.changeOnline} value={online}>
                <Radio value={true}>是</Radio>
                <Radio value={false}>否</Radio>
              </RadioGroup>
              {released ? (
                <span className="checkInvalid">
                  上线活动不能编辑，请您先将活动下线！
                </span>
              ) : null}
            </li>
          ) : null}
        </ul>

        {type ? (
          <div className="btnArea">
            <Button type="primary" onClick={this.handleSubmit}>
              确认
            </Button>
            <Button onClick={this.cancelSubmit}>
              {this.props.location.state
                ? BACKTITLE[this.props.location.state.path]
                : '返回'}
            </Button>
          </div>
        ) : this.props.location.state ? (
          <div className="btnArea">
            <Button onClick={this.cancelSubmit}>
              {this.props.location.state
                ? BACKTITLE[this.props.location.state.path]
                : '返回'}
            </Button>
          </div>
        ) : null}

        <div>
          <GiftTable
            closeModal={this.closeModal}
            setGift={this.setGift}
            showModal={this.state.showGifts}
            confirm={this.confirm}
            total={amount}
            gifts={JSON.parse(JSON.stringify(gifts))}
          />
        </div>
      </div>
    )
  }
}

class GiftTable extends React.Component {
  constructor(props) {
    super(props)
    let dataSource = [],
      allTypeData = [],
      selectedDevice = 'all'
    this.state = {
      allTypeData,
      dataSource,
      selectedDevice,
      total: 0
    }
  }
  componentWillReceiveProps(nextProps) {
    let nextState = {}
    if (
      JSON.stringify(nextProps.gifts) !== JSON.stringify(this.state.dataSource)
    ) {
      let dataSource = JSON.parse(JSON.stringify(nextProps.gifts)),
        all = JSON.parse(JSON.stringify(nextProps.gifts))
      if (all.length > 0) {
        dataSource.forEach((r, i) => {
          if (!r.count) {
            r.count = 0
          }
        })
        all.forEach((r, i) => (r.count = 0))
        nextState.allTypeData = all
        nextState.dataSource = dataSource
      }
    }
    if (nextProps.total !== this.state.total) {
      nextState.total = nextProps.total
    }
    this.setState(nextState)
  }
  changeDevice = v => {
    let data = JSON.parse(JSON.stringify(this.state.allTypeData))
    if (v === 'all') {
      return this.setState({
        dataSource: data,
        selectedDevice: 'all',
        total: 0
      })
    }
    let newData = data.filter((r, i) => r.deviceType === parseInt(v, 10))

    this.setState({
      dataSource: newData,
      selectedDevice: v,
      total: 0
    })
  }
  add = (e, id) => {
    /*
    let gifts = JSON.parse(JSON.stringify(this.state.dataSource)),
      total = this.state.total,
      all = JSON.parse(JSON.stringify(this.state.allTypeData)),
      editingGift = all.filter((r, ind) => r.id === gifts[i].id)
    editingGift[0].count++
    gifts[i].count++
    total++
    this.setState({
      allTypeData: all,
      dataSource: gifts,
      total: total
    })
    */
    let gifts = JSON.parse(JSON.stringify(this.state.dataSource)),
      total = this.state.total,
      gift = gifts.find(r => r.id === id)
    if (gift) {
      gift.count++
      total++
      this.setState({
        dataSource: gifts,
        total: total
      })
    }
  }
  minus = (e, id) => {
    let gifts = JSON.parse(JSON.stringify(this.state.dataSource)),
      total = this.state.total,
      gift = gifts.find(r => r.id === id)
    if (gift) {
      gift.count--
      total--
      this.setState({
        dataSource: gifts,
        total: total
      })
    }
  }
  confirm = () => {
    this.setState({
      selectedDevice: 'all',
      total: 0
    })
    this.props.closeModal()
    this.props.setGift(
      JSON.parse(JSON.stringify(this.state.dataSource)),
      this.state.total
    )
  }
  cancel = () => {
    //clear all the data
    let all = JSON.parse(JSON.stringify(this.state.allTypeData))
    all.forEach((r, i) => {
      r.count = 0
    })
    this.setState({
      allTypeData: all,
      dataSource: JSON.parse(JSON.stringify(all)),
      total: 0,
      selectedDevice: 'all'
    })
    this.props.closeModal()
  }
  render() {
    const { dataSource } = this.state

    let ds = Object.keys(deviceName)
    const deviceOptions = ds.map((d, i) => (
      <Option style={{ textAlign: 'center' }} value={d} key={d}>
        {deviceName[d]}
      </Option>
    ))

    const columns = [
      {
        title: (
          <div style={{ textAlign: 'center' }}>
            <Select
              value={this.state.selectedDevice}
              onChange={this.changeDevice}
            >
              <Option style={{ textAlign: 'center' }} value="all">
                全部类型
              </Option>
              {deviceOptions}
            </Select>
          </div>
        ),
        width: '25%',
        dataIndex: 'deviceType',
        render: (text, record, index) => deviceName[record.deviceType],
        className: 'center'
      },
      {
        title: <p style={{ textAlign: 'center' }}>红包名称</p>,
        dataIndex: 'name',
        width: '18%',
        className: 'center'
      },
      {
        title: <p style={{ textAlign: 'center' }}>红包金额</p>,
        dataIndex: 'amount',
        width: '15%',
        render: text => `¥${text}`,
        className: 'center'
      },
      {
        title: <p style={{ textAlign: 'center' }}>使用期限（领取日起）</p>,
        dataIndex: 'timeLimit',
        render: (text, record) => {
          if (record.type === 1) {
            return (
              <span>
                {Time.showDate(record.startTime)}~{Time.showDate(
                  record.endTime
                )}
              </span>
            )
          } else {
            return <span>{record.timeLimit}天</span>
          }
        },
        className: 'center'
      },
      {
        title: <p style={{ textAlign: 'center' }}>操作</p>,
        dataIndex: 'operation',
        width: '100px',
        render: (text, record, index) => {
          return (
            <div
              style={{ textAlign: 'center' }}
              className="editable-row-operations optInDeposit"
            >
              <div>
                {record.count > 0 ? (
                  <Button
                    onClick={e => this.minus(e, record.id)}
                    type="primary"
                    size="small"
                  >
                    -
                  </Button>
                ) : null}
              </div>
              <div className="giftCount">{record.count}</div>
              <Button
                onClick={e => this.add(e, record.id)}
                type="primary"
                size="small"
              >
                +
              </Button>
            </div>
          )
        }
      }
    ]
    return (
      <Modal
        wrapClassName="modal"
        width={800}
        title=""
        visible={this.props.showModal}
        onCancel={this.cancel}
        onOk={this.confirm}
        okText=""
        footer={null}
      >
        <div className="giftStatus">
          <p>
            当前已经选中<span>{this.state.total}</span>个红包
          </p>
          <Button type="primary" onClick={this.confirm}>
            确定
          </Button>
        </div>
        <div className="depositGiftTable">
          <Table
            rowKey={record => record.id}
            // pagination={false}
            dataSource={dataSource}
            columns={columns}
          />
        </div>
      </Modal>
    )
  }
}
export default ActInfo
