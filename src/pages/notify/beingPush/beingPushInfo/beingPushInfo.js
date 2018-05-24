import React from 'react'
import moment from 'moment'
import 'rc-time-picker/assets/index.css'
import { Button, DatePicker } from 'antd'

import CONSTANTS from '../../../../constants'
import SchoolSelector from '../../../component/schoolSelector'
import BasicSelectorWithoutAll from '../../../component/basicSelectorWithoutAll'
import AjaxHandler from '../../../../mock/ajax'
import AddPlusAbs from '../../../component/addPlusAbs'
// import { connect } from 'react-redux'
// import { withRouter } from 'react-router-dom'
const {
  BEINGS_PUSH_EQUMENT,
  BEING_PUSH_METHON,
  BEINGS_PUSH_PERSON,
  BEINGS_PUSH_TARGET_PERSON,
  BEING_PUSH_METNON_WAITE
} = CONSTANTS
class BeingInfo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      schoolId: 'all',
      methon: '',
      mobile: [''],
      env: '',
      target: '',
      planPushTime: moment(),
      content: '',
      status: 2
    }
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
  fetchData(body) {
    const resource = 'beings/info'
    AjaxHandler.fetch(resource, body).then(json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data) {
          const {
            id,
            schoolId,
            methon,
            mobile,
            env,
            target,
            planPushTime,
            content
          } = json.data.detail
          const nextState = {
            id,
            schoolId,
            methon,
            mobile: mobile.length ? mobile : [''],
            env,
            target,
            planPushTime,
            content
          }
          this.setState(nextState)
        }
      }
    })
  }
  cancel = () => {
    this.props.history.goBack()
  }
  changeSchool = v => {
    this.setState({
      schoolId: v
    })
  }
  changeEqument = v => {
    this.setState({
      env: v
    })
  }
  changeMethon = v => {
    this.setState({
      methon: v
    })
  }
  changeObject = v => {
    this.setState({
      target: v
    })
  }
  addMobile = e => {
    const mobile = JSON.parse(JSON.stringify(this.state.mobile))
    mobile.push('')
    this.setState({
      mobile: mobile
    })
  }
  abstractMobile = e => {
    const mobile = JSON.parse(JSON.stringify(this.state.mobile))
    mobile.pop()
    this.setState({
      mobile: mobile
    })
  }
  changeMobile = (e, i) => {
    const mobile = JSON.parse(JSON.stringify(this.state.mobile))
    mobile[i] = e.target.value
    this.setState({
      mobile: mobile
    })
  }
  comleteEdit = () => {
    let { id } = this.state
    if (id) {
      this.postEditData()
    } else {
      this.addBeingInfo()
    }
  }
  addBeingInfo = () => {
    const {
      schoolId,
      methon,
      mobile,
      env,
      target,
      planPushTime,
      content
    } = this.state
    const body = {
      schoolId,
      methon,
      env: env,
      target,
      content
    }
    if (parseInt(target, 10) === BEINGS_PUSH_TARGET_PERSON) {
      body.mobile = mobile
    }
    if (parseInt(methon, 10) === BEING_PUSH_METNON_WAITE) {
      body.planPushTime = planPushTime
    }
    console.log(body)
  }
  changeContent = event => {
    this.setState({
      content: event.target.value
    })
  }
  postEditData = () => {
    const {
      id,
      schoolId,
      methon,
      mobile,
      env,
      target,
      planPushTime,
      content
    } = this.state
    const body = {
      id,
      schoolId,
      methon,
      env: env,
      target,
      content
    }
    if (parseInt(target, 10) === BEINGS_PUSH_TARGET_PERSON) {
      body.mobile = mobile
    }
    if (parseInt(methon, 10) === BEING_PUSH_METNON_WAITE) {
      body.planPushTime = planPushTime
    }
    console.log(body, 'edit')
  }
  render() {
    let {
      schoolId,
      methon,
      mobile,
      env,
      target,
      planPushTime,
      content
    } = this.state
    const mobileItems =
      mobile &&
      mobile.map((mobileItem, index) => {
        return (
          <li key={index}>
            <input
              placeholder="输入手机号"
              value={mobile[index]}
              onChange={e => {
                this.changeMobile(e, index)
              }}
            />
          </li>
        )
      })
    return (
      <div className="infoList notifyInfo">
        <ul>
          <li>
            <p>学校名称:</p>
            <SchoolSelector
              width={CONSTANTS.SELECTWIDTH}
              selectedSchool={schoolId}
              changeSchool={this.changeSchool}
            />
          </li>
          <li>
            <p>推送环境:</p>
            <BasicSelectorWithoutAll
              staticOpts={BEINGS_PUSH_EQUMENT}
              width={150}
              selectedOpt={env}
              changeOpt={this.changeEqument}
              invalidTitle="选择类型"
            />
            {/* {typeError ? (
              <span className="checkInvalid">公告类型不能为空！</span>
            ) : null} */}
          </li>
          <li className="itemsWrapper high">
            <p>推送内容:</p>
            <div>
              <textarea value={content} onChange={this.changeContent} />
              {/* {contentError ? (
                <span className="checkInvalid">公告内容不能为空！</span>
              ) : null} */}
            </div>
          </li>
          <li>
            <p>推送方式:</p>
            <BasicSelectorWithoutAll
              staticOpts={BEING_PUSH_METHON}
              width={150}
              selectedOpt={methon}
              changeOpt={this.changeMethon}
              invalidTitle="选择推送方式"
            />
          </li>
          {parseInt(methon, 10) === BEING_PUSH_METNON_WAITE ? (
            <li>
              <p>推送时间:</p>
              <DatePicker
                className="datePicker"
                style={{ height: '30px', width: 'auto' }}
                showTime
                allowClear={false}
                value={moment(planPushTime)}
                format="YYYY-MM-DD HH:mm"
              />
            </li>
          ) : null}

          <li>
            <p>推送对象:</p>
            <BasicSelectorWithoutAll
              staticOpts={BEINGS_PUSH_PERSON}
              width={150}
              selectedOpt={target}
              changeOpt={this.changeObject}
              invalidTitle="选择推送对象"
            />
          </li>
          {parseInt(target, 10) === BEINGS_PUSH_TARGET_PERSON ? (
            <li className="itemsWrapper">
              <p>用户手机:</p>
              <div>
                <ul>{mobileItems}</ul>
                <AddPlusAbs
                  count={mobile.length}
                  add={this.addMobile}
                  abstract={this.abstractMobile}
                />
              </div>
            </li>
          ) : null}
        </ul>

        <div className="btnArea">
          <Button type="primary" onClick={this.comleteEdit}>
            确定
          </Button>
          <Button onClick={this.cancel}>返回</Button>
        </div>
      </div>
    )
  }
}

export default BeingInfo
