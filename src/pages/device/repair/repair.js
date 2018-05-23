import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { asyncComponent } from '../../component/asyncComponent'

const RepairList = asyncComponent(() =>
  import(/* webpackChunkName: "repairList" */ './repairList')
)
const RepairInfo = asyncComponent(() =>
  import(/* webpackChunkName: "repairInfo" */ './repairInfo')
)
const RepairProblem = asyncComponent(() =>
  import(/* webpackChunkName: "repairProblem" */ './repairProblem')
)
const RepairRate = asyncComponent(() =>
  import(/* webpackChunkName: "repairRate" */ './repairRate')
)
const RepairLog = asyncComponent(() =>
  import(/* webpackChunkName: "repairLog" */ './repairLog')
)

class Repairs extends React.Component {
  render() {
    const { forbiddenStatus } = this.props
    return (
      <div className="repair">
        <Switch>
          <Route
            path="/device/repair/repairInfo/:id"
            render={props => <RepairInfo hide={this.props.hide} {...props} />}
          />
          <Route
            path="/device/repair/repairProblem"
            render={props => (
              <RepairProblem
                hide={this.props.hide}
                forbiddenStatus={forbiddenStatus}
                {...props}
              />
            )}
          />
          <Route
            path="/device/repair/repairRate"
            render={props => (
              <RepairRate
                hide={this.props.hide}
                forbiddenStatus={forbiddenStatus}
                {...props}
              />
            )}
          />
          <Route
            path="/device/repair/userRepairLog/:id"
            render={props => <RepairLog hide={this.props.hide} {...props} />}
          />
          <Route
            exact
            path="/device/repair"
            render={props => (
              <RepairList
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

export default Repairs
