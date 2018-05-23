import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { asyncComponent } from '../../component/asyncComponent'

const AbnormalTable = asyncComponent(() =>
  import(/* webpackChunkName: "abnormalTable" */ './abnormalTable')
)
const AbnormalInfo = asyncComponent(() =>
  import(/* webpackChunkName: "abnormalInfo" */ './abnormalInfo')
)

class AbnormalContainer extends React.Component {
  render() {
    const {
      ABNORMAL_ORDER_GET,
      ABNORMAL_ORDER_DETAIL_AND_CHARGEBACK
    } = this.props
    return (
      <div>
        <Switch>
          {ABNORMAL_ORDER_DETAIL_AND_CHARGEBACK ? null : (
            <Route
              path="/order/abnormal/detail/:id"
              render={props => (
                <AbnormalInfo hide={this.props.hide} {...props} />
              )}
            />
          )}
          {ABNORMAL_ORDER_GET ? null : (
            <Route
              exact
              path="/order/abnormal"
              render={props => (
                <AbnormalTable hide={this.props.hide} {...props} />
              )}
            />
          )}
        </Switch>
      </div>
    )
  }
}

export default AbnormalContainer
