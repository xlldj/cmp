import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { asyncComponent } from '../component/asyncComponent'
import './style/style.css'

import Bread from '../component/bread'
import { getLocal } from '../util/storage'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeGift } from '../../actions'

const GiftContainer = asyncComponent(() =>
  import(/* webpackChunkName: "giftContainer" */ './giftContainer')
)
const ActContainer = asyncComponent(() =>
  import(/* webpackChunkName: "actContainer" */ './activity/actContainer')
)

const breadcrumbNameMap = {
  '/list': '红包列表',
  '/list/giftInfo': '红包详情',
  '/list/addGift': '创建红包',
  '/act': '红包活动',
  '/act/actInfo': '红包活动详情',
  '/act/addAct': '创建红包活动'
}

class GiftDisp extends React.Component {
  setStatusForgift = () => {
    this.clearStatus4giftIIlist()
  }
  clearStatus4giftIIlist = () => {
    this.props.changeGift('giftList', { page: 1, deviceType: 'all' })
  }
  clearStatus4giftIIact = () => {
    this.getDefaultSchool()
    this.props.changeGift('act', { page: 1 })
  }
  getDefaultSchool = () => {
    const recentSchools = getLocal('recentSchools'),
      defaultSchool = getLocal('defaultSchool')
    var selectedSchool = 'all'
    if (recentSchools) {
      let recent = recentSchools.split(',')
      let schoolId = recent[0]
      selectedSchool = schoolId
    } else if (defaultSchool) {
      selectedSchool = defaultSchool
    }
    if (selectedSchool !== 'all') {
      this.props.changeGift('act', { schoolId: selectedSchool })
    }
  }
  render() {
    return (
      <div>
        <div className="breadc">
          <Bread
            breadcrumbNameMap={breadcrumbNameMap}
            parent="gift"
            setStatusForgift={this.setStatusForgift}
            clearStatus4giftIIlist={this.clearStatus4giftIIlist}
            clearStatus4giftIIact={this.clearStatus4giftIIact}
            parentName="红包管理"
          />
        </div>

        <div className="disp">
          <Switch>
            <Route
              path="/gift/act"
              render={props => (
                <ActContainer hide={this.props.hide} {...props} />
              )}
            />
            <Route
              path="/gift/list"
              render={props => (
                <GiftContainer hide={this.props.hide} {...props} />
              )}
            />
            <Route
              exact
              path="/gift"
              render={props => <Redirect to="/gift/list" />}
            />
          </Switch>
        </div>
      </div>
    )
  }
}

export default withRouter(
  connect(null, {
    changeGift
  })(GiftDisp)
)
