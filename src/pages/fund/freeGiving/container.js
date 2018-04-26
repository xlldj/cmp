import React from 'react'
import { Switch, Route } from 'react-router-dom'

import FreeGivingList from './list.js'
import FreeGivingInfo from './info.js'

class Container extends React.Component {
  render() {
    return (
      <div>
        <Switch>
          <Route
            path="/fund/freeGiving/info/:id"
            render={props => (
              <FreeGivingInfo hide={this.props.hide} {...props} />
            )}
          />
          <Route
            path="/fund/freeGiving/add"
            render={props => (
              <FreeGivingInfo hide={this.props.hide} {...props} />
            )}
          />
          <Route
            exact
            path="/fund/freeGiving"
            render={props => (
              <FreeGivingList hide={this.props.hide} {...props} />
            )}
          />
        </Switch>
      </div>
    )
  }
}

export default Container
