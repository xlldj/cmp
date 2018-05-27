import React from 'react'
import { Route } from 'react-router-dom'
import './style/style.css'

import Bread from '../component/bread'
import LostListContainer from './lostListContainer'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeLost } from '../../actions'

import getDefaultSchool from '../../util/defaultSchool'

const subModule = 'lostListContainer'

const breadcrumbNameMap = {
  '/lostInfo': '详情'
}

class LostDisp extends React.Component {
  componentDidMount() {
    this.props.hide(false)
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  setStatusForlost = () => {
    const schoolId = getDefaultSchool()
    this.props.changeLost(subModule, { schoolId })
  }
  render() {
    return (
      <div>
        <div className="breadc">
          <Bread
            breadcrumbNameMap={breadcrumbNameMap}
            single={true}
            parent="lost"
            setStatusForlost={this.setStatusForlost}
            parentName="失物招领"
          />
        </div>

        <div className="disp">
          {/* 当前只有一个子导航，此设置只是为了以后扩展方便，同时保持与其他模块的一致 */}
          <Route
            exact
            path="/lost"
            render={props => <LostListContainer {...props} />}
          />
        </div>
      </div>
    )
  }
}

export default withRouter(
  connect(null, {
    changeLost
  })(LostDisp)
)
