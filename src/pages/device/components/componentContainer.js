import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { asyncComponent } from '../../component/asyncComponent'
import './style/style.css'

const ComponentTable = asyncComponent(() =>
  import(/* webpackChunkName: "componentTable" */ './componentTable')
)
const ComponentInfo = asyncComponent(() =>
  import(/* webpackChunkName: "componentInfo" */ './componentInfo')
)
const ComponentType = asyncComponent(() =>
  import(/* webpackChunkName: "componentType" */ './componentType')
)

class ComponentContainer extends React.Component {
  render() {
    return (
      <div>
        <Switch>
          <Route
            path="/device/components/addComponent"
            render={props => (
              <ComponentInfo hide={this.props.hide} {...props} />
            )}
          />
          <Route
            path="/device/components/editComponent/:id"
            render={props => (
              <ComponentInfo hide={this.props.hide} {...props} />
            )}
          />
          <Route
            path="/device/components/componentType"
            render={props => (
              <ComponentType hide={this.props.hide} {...props} />
            )}
          />
          <Route
            exact
            path="/device/components"
            render={props => (
              <ComponentTable hide={this.props.hide} {...props} />
            )}
          />
        </Switch>
      </div>
    )
  }
}

export default ComponentContainer
