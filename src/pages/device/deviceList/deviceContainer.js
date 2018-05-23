import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { asyncComponent } from '../../component/asyncComponent'
import DeviceTable from './deviceTable'

const DeviceInfo = asyncComponent(() =>
  import(/* webpackChunkName: "deviceInfo" */ './deviceInfo')
)

class DeviceContainer extends React.Component {
  render() {
    const { forbiddenStatus } = this.props
    return (
      <div>
        <Switch>
          <Route
            path="/device/list/deviceInfo/:id"
            render={props => <DeviceInfo hide={this.props.hide} {...props} />}
          />
          <Route
            exact
            path="/device/list"
            render={props => (
              <DeviceTable
                hide={this.props.hide}
                {...props}
                forbiddenStatus={forbiddenStatus}
              />
            )}
          />
        </Switch>
      </div>
    )
  }
}

export default DeviceContainer
