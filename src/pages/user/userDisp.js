import React from 'react'
import { Route} from 'react-router-dom'
import Bread from '../bread'
import {asyncComponent} from '../component/asyncComponent'
import './style/style.css'
import {getLocal, setLocal} from '../util/storage'
import AjaxHandler from '../ajax'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeUser } from '../../actions'

const UserTable = asyncComponent(()=>import(/* webpackChunkName: "userTable" */ "./userTable"))
const UserInfo = asyncComponent(()=>import(/* webpackChunkName: "userInfo" */ "./userInfo"))

const breadcrumbNameMap = {
  '/userInfo': '详情'
}

class UserDisp extends React.Component {
  setStatusForuser = () => {
    this.getDefaultSchool()
    this.props.changeUser('userList', {page: 1, selectKey: ''})
  }
  getDefaultSchool = () => {
    const recentSchools = getLocal('recentSchools')
    var selectedSchool = 'all'
    if (recentSchools) {
      let recent = recentSchools.split(',')
      let schoolId = recent[0]
      selectedSchool = schoolId
    } else if (getLocal('defaultSchool')) {
      let defaultSchool = getLocal('defaultSchool')
      selectedSchool = defaultSchool
    } else {
      this.setDefaultSchool()
    }
    if (selectedSchool !== 'all') {
      this.props.changeUser('userList', {schoolId: selectedSchool})
    }
  }
  setDefaultSchool = () => {
    let resource = '/school/list'
    const body = {
      page: 1,
      size: 1
    }
    const cb = (json) => {
      if (json.data.schools) {
        let selectedSchool = json.data.schools[0].id.toString()
        setLocal('defaultSchool', selectedSchool)
        this.props.changeUser('userList', {schoolId: selectedSchool}) 
      } 
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  render () {
    return (
      <div>
        <div className='breadc'>
          <Bread breadcrumbNameMap={breadcrumbNameMap} single={true} parent='user' 
            setStatusForuser={this.setStatusForuser} parentName='用户管理' />
        </div>

        <div className='disp'>
          <Route path='/user/userInfo/:id' render={(props) => (<UserInfo hide={this.props.hide} {...props} />)} />
          <Route exact path='/user' render={(props) => (<UserTable hide={this.props.hide} {...props} />)} />
        </div>
      </div>
    )
  }
}


export default withRouter(connect(null, {
  changeUser
})(UserDisp))
