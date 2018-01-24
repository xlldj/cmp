import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { asyncComponent } from '../component/asyncComponent'
import './style/style.css'

//import LostInfo from './lostInfo'
//import LostTable from './lostTable'
import Bread from '../component/bread'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeNotify } from '../../actions'

const NotifyContainer = asyncComponent(() =>
  import(/* webpackChunkName: "notifyContainer" */ './notifyContainer')
)
const CensorContainer = asyncComponent(() =>
  import(/* webpackChunkName: "censorContainer" */ './censor/censorContainer')
)

const breadcrumbNameMap = {
  '/list': '公告列表',
  '/list/notifyInfo': '详情',
  '/list/addNotify': '添加公告',
  '/censor': '公告审核',
  '/censor/list': '公告审核',
  '/censor/info': '详情'
}

class NotifyDisp extends React.Component {
  setStatusFornotify = () => {
    this.props.changeNotify('notify', { page: 1, type: 'all' })
  }
  render() {
    return (
      <div>
        <div className="breadc">
          <Bread
            breadcrumbNameMap={breadcrumbNameMap}
            parent="notify"
            setStatusFornotify={this.setStatusFornotify}
            clearStatus4notifyIIlist={this.clearStatus4notifyIIlist}
            clearStatus4notifyIIcensor={this.clearStatus4notifyIIcensor}
            parentName="公告管理"
          />
        </div>

        <div className="disp">
          <Switch>
            <Route
              path="/notify/censor"
              render={props => (
                <CensorContainer hide={this.props.hide} {...props} />
              )}
            />
            <Route
              path="/notify/list"
              render={props => (
                <NotifyContainer hide={this.props.hide} {...props} />
              )}
            />
            <Route
              exact
              path="/notify"
              render={props => (
                <NotifyContainer hide={this.props.hide} {...props} />
              )}
            />
          </Switch>
        </div>
      </div>
    )
  }
}

export default withRouter(
  connect(null, {
    changeNotify
  })(NotifyDisp)
)
