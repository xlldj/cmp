import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { asyncComponent } from '../../component/asyncComponent'

const TimesetTable = asyncComponent(() =>
  import(/* webpackChunkName: "timesetTable" */ './timesetTable')
)
const TimesetInfo = asyncComponent(() =>
  import(/* webpackChunkName: "timesetInfo" */ './timesetInfo')
)

class TimesetContainer extends React.Component {
  render() {
    const { forbiddenStatus } = this.props
    return (
      <div>
        <Switch>
          <Route
            path="/device/timeset/addTimeset"
            render={props => <TimesetInfo hide={this.props.hide} {...props} />}
          />
          <Route
            path="/device/timeset/editTimeset/:id"
            render={props => <TimesetInfo hide={this.props.hide} {...props} />}
          />
          <Route
            exact
            path="/device/timeset"
            render={props => (
              <TimesetTable
                hide={this.props.hide}
                forbiddenStatus={forbiddenStatus}
                {...props}
              />
            )}
          />
        </Switch>
      </div>
    )
  }
}

export default TimesetContainer
