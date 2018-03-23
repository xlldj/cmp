import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { asyncComponent } from '../component/asyncComponent'
import './style/style.css'
import Bread from '../component/bread'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeDoorForbid } from '../../actions'

const DoorForbidRecordContainer = asyncComponent(() =>
  import(/* webpackChunkName: "doorForbidRecord" */ './doorForbidRecord')
)
const subModule = 'backDormRecord'

const breadcrumbNameMap = {
  '/record/setting': '归寝记录',
  '/record': '门禁记录'
}

class DoorForbidDisp extends React.Component {
  componentDidMount() {
    this.props.hide(false)
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  setStatusFordoorForbid = () => {
    this.clearStatus4doorForbidIIlist()
  }
  clearStatus4doorForbidIIlist = () => {
    this.props.changeDoorForbid(subModule, { tabIndex: 1 })
  }

  render() {
    return (
      <div>
        <div className="breadc">
          <Bread
            breadcrumbNameMap={breadcrumbNameMap}
            parent="doorForbid"
            setStatusFordoorForbid={this.setStatusFordoorForbid}
            clearStatus4doorForbidIIlist={this.clearStatus4doorForbidIIlist}
            parentName="门禁管理"
          />
        </div>

        <div className="disp">
          <Switch>
            <Route
              path="/doorForbid/record"
              render={props => <DoorForbidRecordContainer {...props} />}
            />
            <Route
              exact
              path="/doorForbid"
              render={props => <Redirect to="/doorForbid/record" />}
            />
          </Switch>
        </div>
      </div>
    )
  }
}

export default withRouter(
  connect(null, {
    changeDoorForbid
  })(DoorForbidDisp)
)
