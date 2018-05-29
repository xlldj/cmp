import React, { Fragment } from 'react'

import AjaxHandler from '../../../util/ajax'
import { Map, Marker } from 'react-amap'
import Noti from '../../../util/noti'
import PicturesWall from '../../component/picturesWall'

import { Cascader, Button, Upload, Icon, Popconfirm, Checkbox } from 'antd'
import CONSTANTS from '../../../constants'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { setSchoolList } from '../../../actions'

const CheckboxGroup = Checkbox.Group
const {
  FILEADDR,
  WXCERTSIZE,
  ACCOUNT_ENVS,
  ACCOUNT_ENV_ALI_YUNWEI,
  ACCOUNT_ENV_ALI_USER_RECHARGE,
  ACCOUNT_ENV_ALI_USER_CASH
} = CONSTANTS
const options = [
  {
    value: '浙江',
    label: '浙江',
    children: [
      {
        value: '杭州',
        label: '杭州'
      }
    ]
  },
  {
    value: '湖北',
    label: '湖北',
    children: [
      {
        value: '武汉',
        label: '武汉'
      }
    ]
  },
  {
    value: '江西',
    label: '江西',
    children: [
      {
        value: '南昌',
        label: '南昌'
      }
    ]
  },
  {
    value: '河南',
    label: '河南',
    children: [
      {
        value: '郑州',
        label: '郑州'
      }
    ]
  },
  {
    value: '山东',
    label: '山东',
    children: [
      {
        value: '济南',
        label: '济南'
      }
    ]
  },
  {
    value: '上海',
    label: '上海'
  },
  {
    value: '重庆',
    label: '重庆'
  },
  {
    value: '广东',
    label: '广东',
    children: [
      {
        value: '广州',
        label: '广州'
      },
      {
        value: '深圳',
        label: '深圳'
      }
    ]
  },
  {
    value: '江苏',
    label: '江苏',
    children: [
      {
        value: '南京',
        label: '南京'
      }
    ]
  },
  {
    value: '湖南',
    label: '湖南',
    children: [
      {
        value: '长沙',
        label: '长沙'
      }
    ]
  },
  {
    value: '安徽',
    label: '安徽',
    children: [
      {
        value: '合肥',
        label: '合肥'
      }
    ]
  },
  {
    value: '四川',
    label: '四川',
    children: [
      {
        value: '成都',
        label: '成都'
      }
    ]
  },
  {
    value: '陕西',
    label: '陕西',
    children: [
      {
        value: '西安',
        label: '西安'
      }
    ]
  }
]

class Loc extends React.Component {
  constructor() {
    super()
    const _this = this
    this.map = null
    this.marker = null
    this.geocoder = null
    this.mapEvents = {
      created(map) {
        _this.map = map
        window.AMap.plugin('AMap.Geocoder', () => {
          _this.geocoder = new window.AMap.Geocoder({})
        })
      }
    }
    this.markerEvents = {}
    this.state = {
      position: { longitude: 120, latitude: 30 },
      zoom: 10
    }
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.searchAddr !== nextProps.searchAddr) {
      this.geocoder &&
        this.geocoder.getLocation(nextProps.searchAddr, (status, result) => {
          if (status === 'complete' && result.info === 'OK') {
            this.props.setLngLat({
              longitude: result.geocodes[0].location.lng,
              latitude: result.geocodes[0].location.lat
            })
            this.setState({
              position: {
                longitude: result.geocodes[0].location.lng,
                latitude: result.geocodes[0].location.lat
              },
              zoom: 13
            })
          }
        })
    }
    if (
      this.props.lnglat.longitude !== nextProps.lnglat.longitude ||
      this.props.lnglat.latitude !== nextProps.lnglat.latitude
    ) {
      this.setState({
        position: nextProps.lnglat
      })
    }
  }
  render() {
    return (
      <div className="mapContainer">
        <Map
          className="map"
          zoom={this.state.zoom}
          center={this.state.position}
          events={this.mapEvents}
        >
          <Marker position={this.state.position} events={this.markerEvents} />
        </Map>
      </div>
    )
  }
}

class SchoolInfoEdit extends React.Component {
  static propTypes = {
    schools: PropTypes.array.isRequired
  }
  constructor(props) {
    super(props)
    this.state = {
      name: '',
      nameError: false,
      nameErrorMessage: '',
      city: ['浙江', '杭州'],
      cityError: false,

      location: '',
      searchAddr: '',
      locationError: false,
      lnglat: { longitude: 120, latitude: 30 },
      fileList: [],
      id: 0,
      initialName: 0,

      accountName: '',
      accountNameError: false,
      accountNameErrorMsg: '',

      accountType: 1,

      appId: '',
      appIdError: false,
      appIdErrorMsg: 'app_id不能为空！',

      pid: '',
      pidError: false,
      pidErrorMsg: 'pid不能为空！',

      appPrivateKey: '',
      appPrivateKeyError: false,
      appPrivateKeyErrorMsg: 'app_private_key不能为空！',

      appPublicKey: '',
      appPublicKeyError: false,
      appPublicKeyErrorMsg: 'app_public_key不能为空！',

      alipayPublicKey: '',
      alipayPublicKeyError: false,
      alipayPublicKeyErrorMsg: 'alipay_public_key不能为空！',

      accountComplete: false,
      accountEditing: true,
      validateSuccess: false,
      validateFailure: false,

      checking: false,

      posting: false,
      serverResponsed: false,
      serverReloaded: false,
      clientResponsed: false,
      clientReloaded: false,

      initialAccount: false, // when edit a school info, show the account info has not been changed

      hasWxAccount: true,

      wxpayAccountName: '',
      wxpayAccountNameError: false,
      wxpayAccountNameErrorMsg: '',
      wxpayAppId: '',
      wxpayAppidError: false,
      wxpayAppidErrorMsg: '',
      wxpayMchId: '',
      wxpayMchIdError: false,
      wxpayMchIdErrorMsg: '',
      wxpayApiKey: '',
      wxpayApiKeyError: false,
      wxpayApiKeyErrorMsg: '',
      wxpayCertId: '',
      wxpayCertIdError: false,
      wxpayCertIdErrorMsg: '',
      wxpayCertFile: [],
      wxCertFileError: false,

      wxAccountComplete: false,
      wxpayAccountEditing: true,
      initialWxpayAccount: false,
      wxValidateSuccess: false,
      wxValidateFailure: false,

      has2Accounts: false, // editing, and has both accounts, this will be true
      deletedOneAccountInTow: false, // when editing, and original has both alipay and wx, and deleted one of them, this will be true.

      accountEnv: [ACCOUNT_ENV_ALI_YUNWEI] // 账户环境，默认运维端必须选择支付宝
    }
  }
  fetchData = body => {
    let resource = '/api/school/one'
    const cb = json => {
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else {
        let {
          name,
          city,
          location,
          lon,
          lat,
          logo,
          accountName,
          wxpayAccountName,
          accountEnv
        } = json.data
        let nextState = {
          name: name,
          city: city.split('-'),
          location: location,
          lnglat: { longitude: lon, latitude: lat },
          initialName: name
        }
        if (accountEnv) {
          nextState.accountEnv = accountEnv
        }
        if (logo) {
          nextState.fileList = [
            {
              uid: -9,
              url: FILEADDR + logo,
              status: 'done'
            }
          ]
        }
        if (accountName) {
          nextState = {
            ...nextState,
            ...{
              accountName: accountName,
              appId: '********',
              pid: '********',
              appPrivateKey: '********',
              appPublicKey: '********',
              alipayPublicKey: '********'
            }
          }
          nextState.accountEditing = false
          nextState.validateSuccess = true
          nextState.initialAccount = true
        }
        if (wxpayAccountName) {
          nextState = {
            ...nextState,
            ...{
              wxpayAccountName,
              wxpayApiKey: '********',
              wxpayAppId: '********',
              wxpayMchId: '********'
            }
          }
          nextState.wxpayAccountEditing = false
          nextState.wxValidateSuccess = true
          nextState.initialWxpayAccount = true
        }
        if (accountName && wxpayAccountName) {
          nextState.has2Accounts = true
        }
        this.setState(nextState)
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  componentDidMount() {
    this.props.hide(false)
    /*----------fetch after mount , avoid state chaos-------------------------------------------------------------*/
    /*----------if params.id exists, this is a edit ,else is a add----------*/
    if (this.props.match.params.id) {
      let body = {
        id: parseInt(this.props.match.params.id.slice(1), 10)
      }
      this.fetchData(body)
      this.setState({
        id: parseInt(this.props.match.params.id.slice(1), 10)
      })
    }
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  postInfo = () => {
    let {
      id,
      name,
      city,
      lnglat,
      location,
      accountName,
      validateSuccess,
      posting,
      appId,
      pid,
      appPrivateKey,
      appPublicKey,
      alipayPublicKey,
      wxpayAccountName,
      wxpayAppId,
      wxpayApiKey,
      wxpayMchId,
      wxpayCertId,
      wxValidateSuccess,
      accountEnv
    } = this.state
    if (posting) {
      return
    }
    this.setState({
      posting: true
    })

    let url = '/school/save'
    let body = {
      name: name,
      city: city.join('-'),
      lat: lnglat.latitude,
      lon: lnglat.longitude,
      location: location,
      accountEnv
    }
    if (validateSuccess && accountName) {
      body.accountName = accountName
      if (appId !== '********') {
        body.appId = appId
        body.pid = pid
        body.appPrivateKey = appPrivateKey
        body.appPublicKey = appPublicKey
        body.alipayPublicKey = alipayPublicKey
      }
    }

    // if has wxaccount, and validate success, post it. Or else just ignore it.
    if (wxValidateSuccess && wxpayAccountName) {
      body.wxpayAccountName = wxpayAccountName
      body.hasWxAccount = true
      if (wxpayAppId !== '********') {
        // has wx account, and changed
        body = {
          ...body,
          ...{
            wxpayAppId,
            wxpayApiKey,
            wxpayMchId,
            wxpayCertId
          }
        }
      }
    }

    if (this.state.fileList.length > 0 && this.state.fileList[0].url) {
      body.logo = this.state.fileList[0].url.replace(FILEADDR, '')
    }
    if (id) {
      body.id = parseInt(id, 10)
    }
    AjaxHandler.fetch(url, body).then(json => {
      const nextState = { posting: false }
      if (json && json.data) {
        let school = {
          id: json.data.id,
          name: name
        }
        this.addSchoolToReducer(school)
        // always reload when confirm
        this.reloadAccount()
      }
      this.setState(nextState)
    })
  }

  addSchoolToReducer = school => {
    let { schools } = this.props
    schools.push(school)
    this.props.setSchoolList({ schools })
  }

  clearReloadStatus = () => {
    this.setState({
      posting: false,
      serverResponsed: false,
      serverReloaded: false,
      clientResponsed: false,
      clientReloaded: false
    })
  }

  reloadAccount = () => {
    Promise.all([
      this.tellServerAccount(),
      this.tellClientAccount(),
      this.tellServerWxAccount(),
      this.tellClientWxAccount()
    ])
      .then(json => {
        const {
          serverReloaded,
          clientReloaded,
          wxServerReloaded,
          wxClientReloaded
        } = this.state
        if (
          serverReloaded &&
          clientReloaded &&
          wxServerReloaded &&
          wxClientReloaded
        ) {
          // check wx account here
          this.hintSuccess()
        } else {
          Noti.hintWarning('', '账号绑定失败，请稍后重试')
        }
      })
      .catch(err => {
        Noti.hintWarning('', '账号绑定失败，请稍后重试')
      })
  }

  tellServerAccount = () => {
    // 管理端reload
    const resource = '/api/alipay/trade/client/reload'
    return AjaxHandler.fetch(resource, null).then(json => {
      if (json && json.data && json.data.result) {
        this.setState({
          serverReloaded: true
        })
      }
    })
  }
  tellClientAccount = () => {
    // 用户端reload
    const resource = '/api/alipay/trade/client/reload'
    return AjaxHandler.fetch(resource, null, null, { userPort: true }).then(
      json => {
        if (json && json.data && json.data.result) {
          this.setState({
            clientReloaded: true
          })
        }
      }
    )
  }
  tellServerWxAccount = () => {
    const resource = '/api/wxpay/trade/client/reload'
    return AjaxHandler.fetch(resource, null).then(json => {
      if (json && json.data && json.data.result) {
        this.setState({
          wxServerReloaded: true
        })
      }
    })
  }
  tellClientWxAccount = () => {
    const resource = '/api/wxpay/trade/client/reload'
    return AjaxHandler.fetch(resource, null, null, { userPort: true }).then(
      json => {
        if (json && json.data && json.data.result) {
          this.setState({
            wxClientReloaded: true
          })
        }
      }
    )
  }

  hintSuccess = () => {
    this.clearReloadStatus()
    Noti.hintSuccess(this.props.history, '/school')
  }

  handleSubmit = () => {
    /*-------------need to check the data here---------------*/
    let {
        id,
        name,
        initialName,
        city,
        location,
        validateSuccess,
        wxValidateSuccess,
        accountEnv
      } = this.state,
      nextState = {}
    if (!name) {
      nextState.nameError = true
      nextState.nameErrorMessage = '学校名字不能为空'
      return this.setState(nextState)
    }
    if (!city) {
      nextState.cityError = true
      return this.setState(nextState)
    }
    if (!location) {
      nextState.locationError = true
      return this.setState(nextState)
    }
    // 支付宝必填
    if (!validateSuccess) {
      return Noti.hintWarning('', '支付宝账号必填！')
    }
    // 如果用户端没选支付宝充值，则微信账户必填
    const aliForUserRecharge =
      accountEnv && accountEnv.indexOf(ACCOUNT_ENV_ALI_USER_RECHARGE) !== -1
    if (!aliForUserRecharge && !wxValidateSuccess) {
      return Noti.hintWarning('', '用户端支付宝充值和微信请至少选中一个！')
    }

    if (id && initialName === name) {
      this.postInfo()
    } else {
      this.checkExist(this.postInfo)
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
        nameError: true,
        nameErrorMessage: '学校名称不能为空'
      })
    }
    let nextState = { name: v }
    if (this.state.nameError) {
      nextState.nameError = false
      nextState.nameErrorMessage = ''
    }
    this.setState(nextState)
    if (this.state.id && this.state.initialName === e.target.value) {
      return
    } else {
      this.checkExist(null)
    }
  }
  checkExist = callback => {
    let url = '/api/school/check'
    const body = {
      name: this.state.name
    }
    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (!json.data) {
          Noti.hintOccupied()
          this.setState({
            nameError: true,
            nameErrorMessage: '学校名称已被占用'
          })
        } else {
          if (this.state.nameError) {
            this.setState({
              nameError: false,
              nameErrorMessage: ''
            })
          }
          if (callback) {
            callback()
          }
        }
      }
    }
    AjaxHandler.ajax(url, body, cb)
  }
  setLocation = e => {
    this.setState({
      location: e.target.value
    })
  }
  checkLocation = e => {
    let v = e.target.value.trim(),
      location = this.state.location
    if (v !== location) {
      this.setState({
        location: v
      })
    }
  }
  setLngLat = l => {
    this.setState({
      lnglat: l
    })
  }
  changeCity = v => {
    this.setState({
      city: v
    })
  }
  changeLoc = e => {
    let addr = this.state.location
    this.setState({
      searchAddr: addr
    })
  }
  enterSearch = e => {
    let k = e.key.toLowerCase()
    if (k.toLowerCase() === 'enter') {
      this.changeLoc()
    }
  }
  handleBack = () => {
    this.props.history.push('/school/list')
  }
  add = () => {
    const tradeAccounts = JSON.parse(JSON.stringify(this.state.tradeAccounts))
    tradeAccounts.push({})
    this.setState({
      tradeAccounts: tradeAccounts
    })
  }
  abstract = () => {
    const tradeAccounts = JSON.parse(JSON.stringify(this.state.tradeAccounts))
    tradeAccounts.pop()
    this.setState({
      tradeAccounts: tradeAccounts
    })
  }
  setImages = fileList => {
    this.setState({
      fileList: JSON.parse(JSON.stringify(fileList))
    })
  }
  changeAccount = e => {
    this.setState({
      accountName: e.target.value
    })
    let state = {
      accountName: e.target.value
    }
    if (this.checkAccountComplete(state)) {
      this.setState({
        accountComplete: true
      })
    } else if (this.state.accountComplete) {
      this.setState({
        accountComplete: false
      })
    }
    if (this.state.validateFailure) {
      this.setState({
        validateFailure: false
      })
    }
  }
  checkAccount = e => {
    let v = e.target.value
    if (!v) {
      return this.setState({
        accountNameError: true,
        accountName: v,
        accountNameErrorMsg: '学校账号不能为空'
      })
    }

    let { accountNameError } = this.state
    const nextState = {
      accountName: v,
      accountNameErrorMsg: ''
    }
    if (accountNameError) {
      nextState.accountNameError = false
    }
    this.setState(nextState)
  }
  checkAccountComplete = state => {
    let {
      accountName,
      pid,
      appId,
      appPrivateKey,
      appPublicKey,
      alipayPublicKey
    } = { ...this.state, ...state }
    if (
      accountName &&
      pid &&
      appId &&
      appPrivateKey &&
      appPublicKey &&
      alipayPublicKey
    ) {
      return true
    } else {
      return false
    }
  }

  checkWxAccountComplete = state => {
    let {
      wxpayAccountName,
      wxpayAppId,
      wxpayMchId,
      wxpayApiKey,
      wxpayCertId
    } = {
      ...this.state,
      ...state
    }
    if (
      wxpayAccountName &&
      wxpayAppId &&
      wxpayMchId &&
      wxpayApiKey &&
      wxpayCertId
    ) {
      this.setState({
        wxAccountComplete: true
      })
    } else {
      this.setState({
        wxAccountComplete: false
      })
    }
  }
  changeAppId = e => {
    this.setState({
      appId: e.target.value
    })
    let state = {
      appId: e.target.value
    }
    if (this.checkAccountComplete(state)) {
      this.setState({
        accountComplete: true
      })
    } else if (this.state.accountComplete) {
      this.setState({
        accountComplete: false
      })
    }
    if (this.state.validateFailure) {
      this.setState({
        validateFailure: false
      })
    }
  }

  changeWxInputWrapper = keyName => {
    return e => {
      const nextState = {}
      nextState[keyName] = e.target.value
      if (this.state.wxValidateFailure) {
        nextState.wxValidateFailure = false
      }
      this.setState(nextState, this.checkWxAccountComplete)
    }
  }
  checkInputWrapper = (keyName, keyErrorFlag, keyErrorMsg) => {
    return e => {
      let v = e.target.value
      if (!v) {
        const nextState = {}
        nextState[keyName] = v
        nextState[keyErrorFlag] = true
        nextState[keyErrorMsg] = `选项不能为空`
        return this.setState(nextState)
      }
      const nextState = {}
      nextState[keyName] = v
      nextState[keyErrorMsg] = ''
      if (this.state[keyErrorFlag]) {
        nextState[keyErrorFlag] = false
      }
      this.setState(nextState)
    }
  }
  checkAppId = e => {
    let v = e.target.value
    if (!v) {
      return this.setState({
        appIdError: true,
        appId: v,
        appIdErrorMsg: 'appId不能为空'
      })
    }
    let { appIdError } = this.state
    const nextState = {
      appId: v,
      appIdErrorMsg: ''
    }
    if (appIdError) {
      nextState.appIdError = false
    }
    this.setState(nextState)
  }
  changePid = e => {
    this.setState({
      pid: e.target.value
    })
    let state = {
      pid: e.target.value
    }
    if (this.checkAccountComplete(state)) {
      this.setState({
        accountComplete: true
      })
    } else if (this.state.accountComplete) {
      this.setState({
        accountComplete: false
      })
    }
    if (this.state.validateFailure) {
      this.setState({
        validateFailure: false
      })
    }
  }
  checkPid = e => {
    let v = e.target.value
    if (!v) {
      return this.setState({
        pidError: true,
        pid: v,
        pidErrorMsg: 'pid不能为空'
      })
    }
    let { pidError } = this.state
    const nextState = {
      pid: v,
      pidErrorMsg: ''
    }
    if (pidError) {
      nextState.pidError = false
    }
    this.setState(nextState)
  }
  changePrivateKey = e => {
    this.setState({
      appPrivateKey: e.target.value
    })
    let state = {
      appPrivateKey: e.target.value
    }
    if (this.checkAccountComplete(state)) {
      this.setState({
        accountComplete: true
      })
    } else if (this.state.accountComplete) {
      this.setState({
        accountComplete: false
      })
    }
    if (this.state.validateFailure) {
      this.setState({
        validateFailure: false
      })
    }
  }
  checkPrivateKey = e => {
    let v = e.target.value
    if (!v) {
      return this.setState({
        appPrivateKeyError: true,
        appPrivateKey: v,
        appPrivateKeyErrorMsg: 'app_private_key不能为空'
      })
    }
    let { appPrivateKeyError } = this.state
    const nextState = {
      appPrivateKey: v,
      appPrivateKeyErrorMsg: ''
    }
    if (appPrivateKeyError) {
      nextState.appPrivateKeyError = false
    }
    this.setState(nextState)
  }
  changePublicKey = e => {
    this.setState({
      appPublicKey: e.target.value
    })
    let state = {
      appPublicKey: e.target.value
    }
    if (this.checkAccountComplete(state)) {
      this.setState({
        accountComplete: true
      })
    } else if (this.state.accountComplete) {
      this.setState({
        accountComplete: false
      })
    }
    if (this.state.validateFailure) {
      this.setState({
        validateFailure: false
      })
    }
  }
  checkPublicKey = e => {
    let v = e.target.value
    if (!v) {
      return this.setState({
        appPublicKeyError: true,
        appPublicKey: v,
        appPublicKeyErrorMsg: 'app_public_key不能为空'
      })
    }
    let { appPublicKeyError } = this.state
    const nextState = {
      appPublicKey: v,
      appPublicKeyErrorMsg: ''
    }
    if (appPublicKeyError) {
      nextState.appPublicKeyError = false
    }
    this.setState(nextState)
  }
  changeAlipayPublicKey = e => {
    this.setState({
      alipayPublicKey: e.target.value
    })
    let state = {
      alipayPublicKey: e.target.value
    }
    if (this.checkAccountComplete(state)) {
      this.setState({
        accountComplete: true
      })
    } else if (this.state.accountComplete) {
      this.setState({
        accountComplete: false
      })
    }
    if (this.state.validateFailure) {
      this.setState({
        validateFailure: false
      })
    }
  }
  checkAlipayPublicKey = e => {
    let v = e.target.value
    if (!v) {
      return this.setState({
        alipayPublicKeyError: true,
        alipayPublicKey: v,
        alipayPublicKeyMsg: 'alipay_public_key不能为空'
      })
    }
    let { alipayPublicKeyError } = this.state
    const nextState = {
      alipayPublicKey: v,
      alipayPublicKeyErrorMsg: ''
    }
    if (alipayPublicKeyError) {
      nextState.alipayPublicKeyError = false
    }
    this.setState(nextState)
  }
  validateWxAccount = () => {
    let {
      wxpayAccountEditing,
      wxAccountComplete,
      wxpayApiKey,
      wxpayMchId,
      wxpayAppId,
      wxpayCertId,
      wxChecking
    } = this.state
    if (!wxAccountComplete || !wxpayAccountEditing || wxChecking) {
      return
    }
    this.setState({
      wxChecking: true
    })

    let resource = '/wxpay/trade/verification'
    const body = {
      apiKey: wxpayApiKey,
      appId: wxpayAppId,
      mchId: wxpayMchId,
      wxpayCertId
    }
    AjaxHandler.fetch(resource, body).then(json => {
      const nextState = {
        checking: false
      }
      if (json && json.data) {
        if (json.data.result) {
          nextState.wxValidateSuccess = true
          nextState.wxpayAccountEditing = false
        } else {
          nextState.wxValidateFailure = true
        }
      }
      this.setState(nextState)
    })
  }

  editWxAccount = () => {
    const { has2Accounts, initialWxpayAccount } = this.state
    /* 置位validateSuccess, validateFailure, accountComplete, accountEditing, 以及账户相关信息 */
    const nextState = {
      wxpayAccountEditing: true,
      wxValidateSuccess: false,
      wxValidateFailure: false,
      wxAccountComplete: false,
      wxpayAccountName: '',
      wxpayAppId: '',
      wxpayApiKey: '',
      wxpayMchId: '',
      wxpayCertId: ''
    }
    if (initialWxpayAccount) {
      nextState.initialWxpayAccount = false
    }
    // if has both and now editing, set 'deletedOneAccountInTow' to hint
    if (has2Accounts) {
      nextState.deletedOneAccountInTow = true
    }
    this.setState(nextState)
  }

  validateAccount = () => {
    let {
      accountEditing,
      accountComplete,
      appId,
      pid,
      appPrivateKey,
      appPublicKey,
      alipayPublicKey,
      checking
    } = this.state
    if (!accountComplete || !accountEditing || checking) {
      return
    }
    this.setState({
      checking: true
    })

    let resource = '/alipay/trade/verification'
    const body = {
      appId: appId,
      pid: pid,
      appPrivateKey: appPrivateKey,
      appPublicKey: appPublicKey,
      alipayPublicKey: alipayPublicKey
    }
    const cb = json => {
      const nextState = {
        checking: false
      }
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else if (json.data) {
        if (json.data.result) {
          nextState.validateSuccess = true
          nextState.accountEditing = false
        } else {
          nextState.validateFailure = true
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb, null, {
      clearChecking: true,
      thisObj: this
    })
  }
  editAccount = () => {
    const { initialAccount, has2Accounts } = this.state
    /* 置位validateSuccess, validateFailure, accountComplete, accountEditing, 以及账户相关信息 */
    const nextState = {
      accountEditing: true,
      validateSuccess: false,
      validateFailure: false,
      accountComplete: false,
      accountName: '',
      pid: '',
      appId: '',
      appPrivateKey: '',
      appPublicKey: '',
      alipayPublicKey: ''
    }
    if (initialAccount) {
      nextState.initialAccount = false
    }
    if (has2Accounts) {
      nextState.deletedOneAccountInTow = true
    }
    this.setState(nextState)
  }

  deleteCertAndReupload = () => {
    this.setState({
      wxpayCertId: ''
    })
  }
  uploadCertFile = event => {
    const { file } = event
    const { size } = file
    if (size > WXCERTSIZE) {
      return this.setState({
        wxCertFileError: true
      })
    }
    const resource = '/api/wxpay/trade/cert/upload'
    AjaxHandler.postFile(file, resource).then(json => {
      console.log(json)
      if (json.data && json.data.id) {
        this.setState(
          {
            postCertSuccess: true,
            wxpayCertId: json.data.id
          },
          this.checkWxAccountComplete
        )
      }
    })
  }
  hasAliAtYunwei = arr => {
    return arr.indexOf(ACCOUNT_ENV_ALI_YUNWEI) !== -1
  }
  changeAccountEnv = v => {
    // 如果取消了运维端的支付宝，不响应
    const { accountEnv } = this.state
    if (this.hasAliAtYunwei(accountEnv) && !this.hasAliAtYunwei(v)) {
      return
    }
    this.setState({
      accountEnv: v
    })
  }
  render() {
    const {
      id,
      name,
      nameError,
      nameErrorMessage,
      fileList,
      city,
      cityError,
      location,
      locationError,
      searchAddr,
      lnglat,
      accountName,
      accountNameError,
      accountNameErrorMsg,
      appId,
      appIdError,
      appIdErrorMsg,
      pid,
      pidError,
      pidErrorMsg,
      appPrivateKey,
      appPrivateKeyError,
      appPrivateKeyErrorMsg,
      appPublicKey,
      appPublicKeyError,
      appPublicKeyErrorMsg,
      alipayPublicKey,
      alipayPublicKeyError,
      alipayPublicKeyErrorMsg,
      accountComplete,
      accountEditing,
      validateSuccess,
      validateFailure,
      initialAccount,
      wxpayAccountEditing,
      wxpayAccountName,
      wxpayAccountNameError,
      wxpayAccountNameErrorMsg,
      wxpayAppId,
      wxpayAppidError,
      wxpayAppidErrorMsg,
      wxpayMchId,
      wxpayMchIdError,
      wxpayMchIdErrorMsg,
      wxpayApiKey,
      wxpayApiKeyError,
      wxpayApiKeyErrorMsg,
      wxCertFileError,

      wxAccountComplete,
      wxValidateSuccess,
      wxValidateFailure,
      initialWxpayAccount,

      wxpayCertFile,
      wxpayCertId,
      deletedOneAccountInTow,

      accountEnv
    } = this.state

    const alipayAccount = (
      <Fragment>
        <li>
          <p className="schoolinfo_blockTitle">支付宝信息</p>
        </li>
        <li>
          <p>收款账号:</p>
          <input
            disabled={accountEditing ? false : true}
            className={accountEditing ? 'longInput' : 'longInput disabled'}
            onChange={this.changeAccount}
            onBlur={this.checkAccount}
            value={accountName}
          />
          {accountNameError ? (
            <span className="checkInvalid">{accountNameErrorMsg}</span>
          ) : null}
        </li>
        <li>
          <p>app_id:</p>
          <input
            disabled={accountEditing ? false : true}
            onChange={this.changeAppId}
            onBlur={this.checkAppId}
            value={appId}
            className={accountEditing ? 'longInput' : 'longInput disabled'}
          />
          {appIdError ? (
            <span className="checkInvalid">{appIdErrorMsg}</span>
          ) : null}
        </li>
        <li>
          <p>pid:</p>
          <input
            onChange={this.changePid}
            onBlur={this.checkPid}
            value={pid}
            disabled={accountEditing ? false : true}
            className={accountEditing ? 'longInput' : 'longInput disabled'}
          />
          {pidError ? (
            <span className="checkInvalid">{pidErrorMsg}</span>
          ) : null}
        </li>
        <li>
          <p>app_private_key:</p>
          <input
            onChange={this.changePrivateKey}
            onBlur={this.checkPrivateKey}
            value={appPrivateKey}
            disabled={accountEditing ? false : true}
            className={accountEditing ? 'longInput' : 'longInput disabled'}
          />
          {appPrivateKeyError ? (
            <span className="checkInvalid">{appPrivateKeyErrorMsg}</span>
          ) : null}
        </li>
        <li>
          <p>app_public_key:</p>
          <input
            onChange={this.changePublicKey}
            onBlur={this.checkPublicKey}
            value={appPublicKey}
            disabled={accountEditing ? false : true}
            className={accountEditing ? 'longInput' : 'longInput disabled'}
          />
          {appPublicKeyError ? (
            <span className="checkInvalid">{appPublicKeyErrorMsg}</span>
          ) : null}
        </li>
        <li>
          <p>alipay_public_key:</p>
          <input
            onChange={this.changeAlipayPublicKey}
            onBlur={this.checkAlipayPublicKey}
            value={alipayPublicKey}
            disabled={accountEditing ? false : true}
            className={accountEditing ? 'longInput' : 'longInput disabled'}
          />
          {alipayPublicKeyError ? (
            <span className="checkInvalid">{alipayPublicKeyErrorMsg}</span>
          ) : null}
        </li>
        <li>
          <p />
          <Button
            type="primary"
            className={accountComplete && accountEditing ? '' : 'disabled'}
            onClick={this.validateAccount}
          >
            验证支付宝账号
          </Button>
          <Button
            type="primary"
            className={validateSuccess ? '' : 'disabled'}
            onClick={this.editAccount}
          >
            编辑支付宝账号
          </Button>
          {validateSuccess && !initialAccount ? (
            <span className="checkInvalid">验证通过，该支付宝账号可用</span>
          ) : null}
          {validateFailure ? (
            <span className="checkInvalid">验证失败，该支付宝账号不可用</span>
          ) : null}
        </li>
        <li>
          <p>选择支付环境:</p>
          <CheckboxGroup
            options={ACCOUNT_ENVS}
            value={accountEnv}
            onChange={this.changeAccountEnv}
          />
        </li>
      </Fragment>
    )
    const uploadButton = (
      <div className="uploadButton">
        <Icon type="plus" />
      </div>
    )
    const wxAccount = (
      <Fragment>
        <li>
          <p className="schoolinfo_blockTitle">微信支付信息</p>
        </li>
        <li>
          <p>收款账号:</p>
          <input
            onChange={this.changeWxInputWrapper('wxpayAccountName')}
            onBlur={this.checkInputWrapper(
              'wxpayAccountName',
              'wxpayAccountNameError',
              'wxpayAccountNameErrorMsg'
            )}
            value={wxpayAccountName}
            disabled={wxpayAccountEditing ? false : true}
            className={wxpayAccountEditing ? 'longInput' : 'longInput disabled'}
          />
          {wxpayAccountNameError ? (
            <span className="checkInvalid">{wxpayAccountNameErrorMsg}</span>
          ) : null}
        </li>
        <li>
          <p>appid:</p>
          <input
            onChange={this.changeWxInputWrapper('wxpayAppId')}
            onBlur={this.checkInputWrapper(
              'wxpayAppId',
              'wxpayAppidError',
              'wxpayAppidErrorMsg'
            )}
            value={wxpayAppId}
            disabled={wxpayAccountEditing ? false : true}
            className={wxpayAccountEditing ? 'longInput' : 'longInput disabled'}
          />
          {wxpayAppidError ? (
            <span className="checkInvalid">{wxpayAppidErrorMsg}</span>
          ) : null}
        </li>
        <li>
          <p>mchid:</p>
          <input
            onChange={this.changeWxInputWrapper('wxpayMchId')}
            onBlur={this.checkInputWrapper(
              'wxpayMchId',
              'wxpayMchIdError',
              'wxpayMchIdErrorMsg'
            )}
            value={wxpayMchId}
            disabled={wxpayAccountEditing ? false : true}
            className={wxpayAccountEditing ? 'longInput' : 'longInput disabled'}
          />
          {wxpayMchIdError ? (
            <span className="checkInvalid">{wxpayMchIdErrorMsg}</span>
          ) : null}
        </li>
        <li>
          <p>apikey:</p>
          <input
            onChange={this.changeWxInputWrapper('wxpayApiKey')}
            onBlur={this.checkInputWrapper(
              'wxpayApiKey',
              'wxpayApiKeyError',
              'wxpayApiKeyErrorMsg'
            )}
            value={wxpayApiKey}
            disabled={wxpayAccountEditing ? false : true}
            className={wxpayAccountEditing ? 'longInput' : 'longInput disabled'}
          />
          {wxpayApiKeyError ? (
            <span className="checkInvalid">{wxpayApiKeyErrorMsg}</span>
          ) : null}
        </li>
        <li className="imgWrapper">
          <p>certId:</p>
          {!wxpayAccountEditing ? (
            <span>********</span>
          ) : (
            <div>
              {wxpayCertId ? (
                <Fragment>
                  <span>{wxpayCertId}</span>
                  <Button type="primary" onClick={this.deleteCertAndReupload}>
                    重新上传
                  </Button>
                </Fragment>
              ) : (
                <Fragment>
                  <Upload
                    listType="picture-card"
                    fileList={wxpayCertFile}
                    customRequest={this.uploadCertFile}
                  >
                    {wxpayCertFile.length >= 1 ? null : uploadButton}
                  </Upload>
                  {wxCertFileError ? (
                    <span className="checkInvalid">
                      文件大小不应超过64k bytes
                    </span>
                  ) : null}
                </Fragment>
              )}
            </div>
          )}
        </li>
        <li>
          <p />
          <Button
            type="primary"
            className={
              wxAccountComplete && wxpayAccountEditing ? '' : 'disabled'
            }
            onClick={this.validateWxAccount}
          >
            验证微信账号
          </Button>
          <Button
            type="primary"
            className={wxValidateSuccess ? '' : 'disabled'}
            onClick={this.editWxAccount}
          >
            编辑微信账号
          </Button>
          {wxValidateSuccess && !initialWxpayAccount ? (
            <span className="checkInvalid">验证通过，该微信账号可用</span>
          ) : null}
          {wxValidateFailure ? (
            <span className="checkInvalid">验证失败，该微信账号不可用</span>
          ) : null}
        </li>
      </Fragment>
    )

    return (
      <div className="infoList schoolInfoEdit">
        <ul>
          <li className="imgWrapper">
            <p htmlFor="logo" className="schLabel">
              学校LOGO：
            </p>
            <span className="noPadding">
              <PicturesWall
                limit={1}
                setImages={this.setImages}
                fileList={fileList}
                dir="school-logo"
              />
            </span>
          </li>
          <li>
            <p>学校名称：</p>
            <input
              pattern={/\S+/}
              onChange={this.changeName}
              disabled={id ? true : false}
              className={id ? 'disabled' : ''}
              id="name"
              name="name"
              value={name}
              onBlur={this.checkName}
            />
            {nameError ? (
              <span className="checkInvalid">{nameErrorMessage}</span>
            ) : null}
          </li>

          <li>
            <p>所在城市：</p>
            <Cascader
              value={city}
              allowClear={false}
              className="citySelect"
              options={options}
              onChange={this.changeCity}
              placeholder="请选择城市"
            />
            {cityError ? (
              <span className="checkInvalid">请选择所在城市</span>
            ) : null}
          </li>

          <li>
            <p>学校位置：</p>
            <input
              onKeyDown={this.enterSearch}
              className="longInput"
              onChange={this.setLocation}
              onBlur={this.checkLocation}
              name="location"
              value={location}
            />
            <Button
              type="primary"
              className="confirmSearch"
              onClick={this.changeLoc}
            >
              确认
            </Button>
            {locationError ? (
              <span className="checkInvalid">学校位置不能为空</span>
            ) : null}
          </li>
          <li className="imgWrapper">
            <p />
            <Loc
              setLngLat={this.setLngLat}
              searchAddr={searchAddr}
              lnglat={lnglat}
            />
          </li>

          {alipayAccount}
          {wxAccount}
          <li>
            <p />
            <span className="hintText">
              *支付宝必须验证通过，且选中笑联运维端
            </span>
          </li>
          <li>
            <p />
            <span className="hintText">
              *微信支付选填，当前仅支持用户端使用
            </span>
          </li>
        </ul>

        <div className="btnArea">
          {deletedOneAccountInTow ? (
            <Popconfirm
              title="确认后会更新/删除对应账户，确定要进行此操作么?"
              onConfirm={this.handleSubmit}
              onCancel={this.cancelDelete}
              okText="确认"
              cancelText="取消"
            >
              <Button type="primary">确认</Button>
            </Popconfirm>
          ) : (
            <Button type="primary" onClick={this.handleSubmit}>
              确认
            </Button>
          )}
          <Button onClick={this.handleBack}>返回</Button>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    schools: state.setSchoolList.schools
  }
}

export default withRouter(
  connect(mapStateToProps, {
    setSchoolList
  })(SchoolInfoEdit)
)
