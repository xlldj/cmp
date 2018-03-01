import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { asyncComponent } from '../component/asyncComponent'
import './style/style.css'

//import SchoolList from './schoolList/schoolList'
//import SchoolInfoEdit from './schoolList/schoolInfoEdit'
//import BlockManage from './schoolList/blockManage'
//import SchoolBusiness from './schoolList/schoolBusiness'
import Bread from '../component/bread'
import { getLocal } from '../../util/storage'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeHeater } from '../../actions'

const HeaterList = asyncComponent(() =>
  import(/* webpackChunkName: "heaterList" */ './heaterList')
)
const HeaterStatus = asyncComponent(() =>
  import(/* webpackChunkName: "heaterStatus" */ './heaterStatus')
)

const breadcrumbNameMap = {
  '/list': '机组列表',
  '/status': '工作状态'
}

class HeaterDisp extends React.Component {
  setStatusForheater = () => {
    this.clearStatus4heaterIIlist()
  }
  clearStatus4heaterIIlist = () => {
    this.getDefaultSchool()
    this.props.changeHeater('heaterList', { page: 1 })
  }

  render() {
    return (
      <div>
        <div className="breadc">
          <Bread
            breadcrumbNameMap={breadcrumbNameMap}
            parent="heater"
            setStatusForheater={this.setStatusForheater}
            clearStatus4heaterIIlist={this.clearStatus4heaterIIlist}
            parentName="热水机组"
          />
        </div>

        <div className="disp">
          <Switch>
            <Route
              exact
              path="/heater/list"
              render={props => <HeaterList hide={this.props.hide} {...props} />}
            />
            <Route
              exact
              path="/heater/status"
              render={props => (
                <HeaterStatus hide={this.props.hide} {...props} />
              )}
            />

            <Route
              exact
              path="/heater"
              render={props => <Redirect to="/heater/list" />}
            />
          </Switch>
        </div>
      </div>
    )
  }
}

// export default SchoolDisp
export default withRouter(
  connect(null, {
    changeHeater
  })(HeaterDisp)
)
