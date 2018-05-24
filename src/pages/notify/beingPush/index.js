import React from 'react'
import { asyncComponent } from '../../component/asyncComponent'
import { Route, Switch } from 'react-router-dom'
const BeingInfo = asyncComponent(() =>
  import(/* webpackChunkName: "beingPushInfo" */ './beingPushInfo/beingPushInfo')
)
const BeingLIST = asyncComponent(() =>
  import(/* webpackChunkName: "beingPushList" */ './beingPushList/index')
)
class BeingContainer extends React.Component {
  render() {
    return (
      <div>
        <Switch>
          <Route
            path="/notify/beings/addbeing"
            render={props => <BeingInfo hide={this.props.hide} {...props} />}
          />
          <Route
            path="/notify/beings/info/:id"
            render={props => <BeingInfo hide={this.props.hide} {...props} />}
          />
          <Route
            exact
            path="/notify/beings"
            render={props => <BeingLIST hide={this.props.hide} {...props} />}
          />
        </Switch>
      </div>
    )
  }
}

export default BeingContainer
