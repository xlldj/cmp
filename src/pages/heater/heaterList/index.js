import React from 'react'
import { Route, Switch } from 'react-router-dom'
import HeaterTable from './heaterTable'

class HeaterContainer extends React.Component {
  render() {
    return (
      <div>
        <Switch>
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
