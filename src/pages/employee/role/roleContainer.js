import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { asyncComponent } from '../../component/asyncComponent'

const RoleTable = asyncComponent(() =>
  import(/* webpackChunkName: "roleTable" */ './roleTable')
)
const RoleInfo = asyncComponent(() =>
  import(/* webpackChunkName: "roleInfo" */ './roleInfo')
)

class RoleContainer extends React.Component {
  render() {
    const { forbiddenStatus } = this.props
    const { ROLE_LIST_GET, ROLE_ADD } = forbiddenStatus
    return (
      <div>
        <Switch>
          {ROLE_LIST_GET ? null : (
            <Route
              exact
              path="/employee/role"
              render={props => <RoleTable hide={this.props.hide} {...props} />}
            />
          )}
          {ROLE_ADD ? null : (
            <Route
              path="/employee/role/detail/:id"
              render={props => <RoleInfo hide={this.props.hide} {...props} />}
            />
          )}
          {ROLE_ADD ? null : (
            <Route
              path="/employee/role/add"
              render={props => <RoleInfo hide={this.props.hide} {...props} />}
            />
          )}
        </Switch>
      </div>
    )
  }
}

export default RoleContainer
