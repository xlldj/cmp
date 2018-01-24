import React, { Component } from 'react'
import SchoolSelector from '../component/schoolSelector'
import OVDetail from './ovdetail'
import Time from '../../util/time'
import AjaxHandler from '../../util/ajax'
import userImg from '../assets/user2.png'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeStat } from '../../actions'
import { checkObject } from '../../util/checkSame'
const subModule = 'overview'

const initilaState = {
  units: []
}

class OverView extends Component {
  static propTypes = {
    schoolId: PropTypes.string.isRequired
  }
  state = initilaState

  fetchData = body => {
    let resource = '/api/statistics/overview'
    const cb = json => {
      if (json.error) {
        throw new Error(json.error)
      } else {
        this.setState({
          units: json.data.units
        })
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  componentDidMount() {
    this.props.hide(false)
    let { schoolId } = this.props
    const body = {
      startTime: Time.getTodayStart(),
      endTime: Time.getNow()
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }

    this.fetchData(body)
  }

  componentWillReceiveProps(nextProps) {
    if (checkObject(this.props, nextProps, ['schoolId'])) {
      return
    }
    let { schoolId } = nextProps
    if (schoolId === this.props.schoolId) {
      return
    }
    const body = {
      startTime: Time.getTodayStart(),
      endTime: Time.getNow()
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }

    this.fetchData(body)
  }

  changeSchool = v => {
    let { schoolId } = this.props
    if (schoolId !== v) {
      this.props.changeStat(subModule, { schoolId: v })
    }
  }

  render() {
    const { units } = this.state
    const { schoolId } = this.props

    const userData = units && units.find((r, i) => r.type === 1)
    const showerOrder = units && units.find((r, i) => r.type === 2)
    const drinkerOrder = units && units.find((r, i) => r.type === 3)
    const depositAmount = units && units.find((r, i) => r.type === 4)
    const cashAmount = units && units.find((r, i) => r.type === 5)
    const showerRepair = units && units.find((r, i) => r.type === 6)
    const drinkerRepair = units && units.find((r, i) => r.type === 7)

    return (
      <div className="overview">
        <div className="ovHeader">
          <h1>今日总揽</h1>
          <SchoolSelector
            selectedSchool={schoolId}
            changeSchool={this.changeSchool}
          />
        </div>
        <div className="ovContent">
          <div className="userDetail">
            <img src={userImg} alt="user" />
            <OVDetail
              title="今日新增用户"
              data={userData && userData.data}
              direction={userData && userData.direction}
              percent={userData && userData.percent}
            />
          </div>
          <div className="seperatorLine" />
          <div className="detailPanel">
            <OVDetail
              title="今日热水器订单"
              data={showerOrder && showerOrder.data}
              direction={showerOrder && showerOrder.direction}
              percent={showerOrder && showerOrder.percent}
            />
            <OVDetail
              title="今日饮水机订单"
              data={drinkerOrder && drinkerOrder.data}
              direction={drinkerOrder && drinkerOrder.direction}
              percent={drinkerOrder && drinkerOrder.percent}
            />
            <OVDetail
              title="今日充值总额(¥)"
              data={depositAmount && depositAmount.data}
              direction={depositAmount && depositAmount.direction}
              percent={depositAmount && depositAmount.percent}
            />
            <OVDetail
              title="今日提现总额(¥)"
              data={cashAmount && cashAmount.data}
              direction={cashAmount && cashAmount.direction}
              percent={cashAmount && cashAmount.percent}
            />
            <OVDetail
              title="今日热水器报修"
              data={showerRepair && showerRepair.data}
              direction={showerRepair && showerRepair.direction}
              percent={showerRepair && showerRepair.percent}
            />
            <OVDetail
              title="今日饮水机报修"
              data={drinkerRepair && drinkerRepair.data}
              direction={drinkerRepair && drinkerRepair.direction}
              percent={drinkerRepair && drinkerRepair.percent}
            />
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    schoolId: state.changeStat[subModule].schoolId
  }
}

export default withRouter(
  connect(mapStateToProps, {
    changeStat
  })(OverView)
)
