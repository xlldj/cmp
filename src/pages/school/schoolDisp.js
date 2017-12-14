import React from 'react'
import {  Route, Switch, Redirect } from 'react-router-dom'
import { asyncComponent } from '../component/asyncComponent'
import './style/style.css'

//import SchoolList from './schoolList/schoolList'
//import SchoolInfoEdit from './schoolList/schoolInfoEdit'
//import BlockManage from './schoolList/blockManage'
//import SchoolBusiness from './schoolList/schoolBusiness'
import Bread from '../bread'
import {getLocal} from '../util/storage'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeSchool } from '../../actions'

const SchoolList = asyncComponent(() => import(/* webpackChunkName: "schoolList" */ "./schoolList/schoolList"))
const SchoolInfoEdit = asyncComponent(() => import(/* webpackChunkName: "schoolInfoEdit" */ "./schoolList/schoolInfoEdit"))
const BlockManage = asyncComponent(() => import(/* webpackChunkName: "blockManage" */ "./schoolList/blockManage"))
const SchoolBusiness = asyncComponent(() => import(/* webpackChunkName: "schoolBusiness" */ "./schoolList/schoolBusiness"))
const AddingBlock = asyncComponent(() => import(/* webpackChunkName: "addingBlock" */ "./schoolList/addingBlock"))
const Overview = asyncComponent(() => import(/* webpackChunkName: 'schoolOverview' */ './overview/overview'))
const InfoSet = asyncComponent(() => import(/* webpackChunkName: 'infoSet' */ './schoolList/infoSet'))

const breadcrumbNameMap = {
  '/list': '学校列表',
  '/list/schoolInfoEdit': '学校信息',
  '/list/addSchool': '添加学校',
  '/list/blockManage': '楼栋管理',
  '/list/blockManage/addingBlock': '添加楼栋',
  '/list/blockManage/editingBlock': '编辑楼栋',
  '/list/business':'功能入口管理',
  '/overview': '学校信息总览',
  '/infoSet': '学校设置'
};

class SchoolDisp extends React.Component{
  setStatusForschool = () => {
    this.clearStatus4schoolIIlist()
  }
  clearStatus4schoolIIlist = () => {
    this.getDefaultSchool()
    this.props.changeSchool('schoolList', {page: 1})
  }
  clearStatus4schoolIIoverview = () => {
    this.getDefaultSchool()
    this.props.changeSchool('overview', {page: 1})
  }

  getDefaultSchool = () => {
    const recentSchools = getLocal('recentSchools'), defaultSchool = getLocal('defaultSchool')
    var selectedSchool = 'all'
    if (recentSchools) {
      let recent = recentSchools.split(',')
      let schoolId = recent[0]
      selectedSchool = schoolId
    } else if (defaultSchool) {
      selectedSchool = defaultSchool
    }
    if (selectedSchool !== 'all') {
      this.props.changeSchool('schoolList', {schoolId: selectedSchool})
      this.props.changeSchool('overview', {schoolId: selectedSchool})
    }
  }
  render(){
    return(
      <div>
        <div className='breadc'>
          <Bread breadcrumbNameMap={breadcrumbNameMap} parent='school' 
            setStatusForschool={this.setStatusForschool} 
            clearStatus4schoolIIlist={this.clearStatus4schoolIIlist} 
            parentName='学校管理' 
          />
        </div>

        <div className='disp'>
          <Switch>
            <Route path='/school/list/schoolInfoEdit/:id' render={(props) => (<SchoolInfoEdit hide={this.props.hide} {...props} />)} />
            <Route path='/school/list/addSchool' render={(props) => (<SchoolInfoEdit hide={this.props.hide} {...props} />)} />
            <Route path='/school/list/blockManage/editingBlock/:id' render={(props) => (<AddingBlock hide={this.props.hide} {...props} />)} />
            <Route path='/school/list/blockManage/addingBlock' render={(props) => (<AddingBlock hide={this.props.hide} {...props} />)} />
            <Route path='/school/list/blockManage/:id' render={(props) => (<BlockManage hide={this.props.hide} {...props} />)} />
            <Route exact path='/school/list/blockManage' render={(props) => (<BlockManage hide={this.props.hide} {...props} />)} />
            <Route path='/school/list/business/:id' render={(props) => (<SchoolBusiness hide={this.props.hide} {...props}/>)} />
            <Route exact path='/school/list' render={(props) => (<SchoolList hide={this.props.hide} {...props}/>)} />
            <Route path='/school/overview' render={(props) => (<Overview hide={this.props.hide} {...props}/>)} />
            <Route path='/school/infoSet/:id' render={(props) => (<InfoSet hide={this.props.hide} {...props}/>)} />
            <Route exact path='/school' render={(props) => (<Redirect to='/school/list' />)} />
          </Switch>
        </div>
      </div>
    )
  }
} 

// export default SchoolDisp
export default withRouter(connect(null, {
  changeSchool
})(SchoolDisp))