import React from 'react'

import { Route, Switch } from 'react-router-dom'
import BeingLIST from './beingPushList/index'
class BeingContainer extends React.Component {
  render() {
    return (
      <div>
        <Switch>
          {/* <Route
            path="/notify/censor/addCensor"
            render={props => <CensorInfo hide={this.props.hide} {...props} />}
          />
          <Route
            path="/notify/censor/info/:id"
            render={props => <CensorInfo hide={this.props.hide} {...props} />}
          /> */}
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
