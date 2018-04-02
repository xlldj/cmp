import React from 'react'

import { Route, Switch } from 'react-router-dom'
import HeaterTable from './heaterTable'
import HeaterDetail from './heaterDetail'
import HeaterUnits from './heaterUnits'

class HeaterContainer extends React.Component {
  render() {
    return (
      <div>
        <Switch>
          <Route
            path="/heater/list/detail/:id"
            render={props => <HeaterDetail hide={this.props.hide} {...props} />}
          />
          <Route
            path="/heater/list/units/:id"
            render={props => <HeaterUnits hide={this.props.hide} {...props} />}
          />
          <Route
            exact
            path="/heater/list"
            render={props => <HeaterTable hide={this.props.hide} {...props} />}
          />
        </Switch>
      </div>
    )
  }
}

export default HeaterContainer
