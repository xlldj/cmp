import React from 'react'
import {Route} from 'react-router-dom'
import Bread from '../bread'
import {asyncComponent} from '../component/asyncComponent'
import './style/style.css'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeVersion } from '../../actions'

const VersionTable = asyncComponent(()=>import(/* webpackChunkName: "versionTable" */ "./versionTable"))
const VersionInfo = asyncComponent(()=>import(/* webpackChunkName: "versionInfo" */ "./versionInfo"))

const breadcrumbNameMap = {
  '/detail': '详情',
  '/add': '添加版本'
}

class VersionDisp extends React.Component {
  setStatusForversion = () => {
    this.props.changeVersion('version', {page: 1})
  }
  render () {
    return (
      <div>
        <div className='breadc'>
          <Bread breadcrumbNameMap={breadcrumbNameMap} single={true} parent='version' setStatusForversion={this.setStatusForversion}  parentName='版本更新' />
        </div>

        <div className='disp'>
          <Route path='/version/detail/:id' render={(props) => (<VersionInfo hide={this.props.hide} {...props} />)} />
          <Route path='/version/add' render={(props) => (<VersionInfo hide={this.props.hide} {...props} />)} />
          <Route exact path='/version' render={(props) => (<VersionTable hide={this.props.hide} {...props} />)} />
        </div>
      </div>
    )
  }
}


export default withRouter(connect(null, {
  changeVersion
})(VersionDisp))
