import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { asyncComponent } from '../../component/asyncComponent'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
const NotifyTable = asyncComponent(() =>
  import(/* webpackChunkName: "notifyTable" */ './notifyTable')
)
const NotifyInfo = asyncComponent(() =>
  import(/* webpackChunkName: "notifyInfo" */ './notifyInfo')
)

class NotifyContainer extends React.Component {
  render() {
    const { forbiddenStatus } = this.props
    const {
      NOTIFY_LIST_GET,
      EDIT_EMERGENCY_NOTIFY,
      EDIT_SYSTEM_NOTIFY
    } = forbiddenStatus
    return (
      <div>
        <Switch>
          {EDIT_EMERGENCY_NOTIFY && EDIT_SYSTEM_NOTIFY ? null : (
            <Route
              path="/notify/list/addNotify"
              render={props => <NotifyInfo hide={this.props.hide} {...props} />}
            />
          )}
          {EDIT_EMERGENCY_NOTIFY && EDIT_SYSTEM_NOTIFY ? null : (
            <Route
              path="/notify/list/notifyInfo/:id"
              render={props => <NotifyInfo hide={this.props.hide} {...props} />}
            />
          )}
          {NOTIFY_LIST_GET ? null : (
            <Route
              exact
              path="/notify/list"
              render={props => (
                <NotifyTable hide={this.props.hide} {...props} />
              )}
            />
          )}
        </Switch>
      </div>
    )
  }
}
const mapStateToProps = (state, ownProps) => ({
  forbiddenStatus: state.setAuthenData.forbiddenStatus
})
export default withRouter(connect(mapStateToProps, {})(NotifyContainer))
