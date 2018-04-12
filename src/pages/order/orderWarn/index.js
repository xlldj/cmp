import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { asyncComponent } from '../../component/asyncComponent'

const OrderWarnTableWrapper = asyncComponent(() =>
  import(/* webpackChunkName: "orderWarnTableWrapper" */ './orderWarnTableWrapper')
)
const WarnRuleSetting = asyncComponent(() =>
  import(/* webpackChunkName: "warnRuleSetting" */ './warnRuleSetting')
)

class OrderWarnContainer extends React.Component {
  render() {
    return (
      <div>
        <Switch>
          <Route
            path="/order/warning/info/:id"
            render={props => (
              <WarnRuleSetting hide={this.props.hide} {...props} />
            )}
          />
          <Route
            exact
            path="/order/warning"
            render={props => (
              <OrderWarnTableWrapper hide={this.props.hide} {...props} />
            )}
          />
        </Switch>
      </div>
    )
  }
}

export default OrderWarnContainer
