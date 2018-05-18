import React from 'react'
import { Route } from 'react-router-dom'
import Bread from '../component/bread'
import { asyncComponent } from '../component/asyncComponent'
import './style/style.css'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeVersion } from '../../actions'

const VersionTable = asyncComponent(() =>
  import(/* webpackChunkName: "versionTable" */ './versionTable')
)
const VersionInfo = asyncComponent(() =>
  import(/* webpackChunkName: "versionInfo" */ './versionInfo')
)

const breadcrumbNameMap = {
  '/detail': '详情',
  '/add': '添加版本'
}

class VersionDisp extends React.Component {
  setStatusForversion = () => {
    this.props.changeVersion('version', { page: 1 })
  }
  render() {
    const { forbiddenStatus } = this.props
    const { VERSON_LIST_GET, VERSON_ADD_OR_EDIT } = forbiddenStatus
    return (
      <div>
        <div className="breadc">
          <Bread
            breadcrumbNameMap={breadcrumbNameMap}
            single={true}
            parent="version"
            setStatusForversion={this.setStatusForversion}
            parentName="版本更新"
          />
        </div>

        <div className="disp">
          {VERSON_LIST_GET ? null : (
            <Route
              path="/version/detail/:id"
              render={props => (
                <VersionInfo hide={this.props.hide} {...props} />
              )}
            />
          )}
          {VERSON_ADD_OR_EDIT ? null : (
            <Route
              path="/version/add"
              render={props => (
                <VersionInfo hide={this.props.hide} {...props} />
              )}
            />
          )}
          {VERSON_ADD_OR_EDIT ? null : (
            <Route
              exact
              path="/version"
              render={props => (
                <VersionTable hide={this.props.hide} {...props} />
              )}
            />
          )}
        </div>
      </div>
    )
  }
}
const mapStateToProps = (state, ownProps) => ({
  forbiddenStatus: state.setAuthenData.forbiddenStatus
})
export default withRouter(
  connect(mapStateToProps, {
    changeVersion
  })(VersionDisp)
)
