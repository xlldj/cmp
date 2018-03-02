import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { asyncComponent } from '../../component/asyncComponent'

const NotifyTable = asyncComponent(() =>
  import(/* webpackChunkName: "notifyTable" */ './notifyTable')
)
const NotifyInfo = asyncComponent(() =>
  import(/* webpackChunkName: "notifyInfo" */ './notifyInfo')
)

class NotifyContainer extends React.Component {
  render() {
    return (
      <div>
        <Switch>
          <Route
            path="/notify/list/addNotify"
            render={props => <NotifyInfo hide={this.props.hide} {...props} />}
          />
          <Route
            path="/notify/list/notifyInfo/:id"
            render={props => <NotifyInfo hide={this.props.hide} {...props} />}
          />
          <Route
            exact
            path="/notify/list"
            render={props => <NotifyTable hide={this.props.hide} {...props} />}
          />
        </Switch>
      </div>
    )
  }
}

export default NotifyContainer
