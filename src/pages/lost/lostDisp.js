import React from 'react'
import { Route} from 'react-router-dom'
import {asyncComponent} from '../component/asyncComponent'
import './style/style.css'

//import LostInfo from './lostInfo'
//import LostTable from './lostTable'
import Bread from '../bread'
import {getLocal} from '../util/storage'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeLost } from '../../actions'

const LostTable = asyncComponent(() => import(/* webpackChunkName: "lostTable" */ "./lostTable"))
const LostInfo = asyncComponent(() => import(/* webpackChunkName: "lostInfo" */ "./lostInfo"))

const breadcrumbNameMap = {
  '/lostInfo': '详情'
}

class LostDisp extends React.Component {
  setStatusForlost = () => {
    this.getDefaultSchool()
    this.props.changeLost('lostList', {page: 1, type: 'all'})
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
      this.props.changeLost('lostList', {schoolId: selectedSchool})
    }
  }
  render () {
    return (
      <div>
        <div className='breadc'>
          <Bread breadcrumbNameMap={breadcrumbNameMap} single={true} parent='lost' 
            setStatusForlost={this.setStatusForlost}
            parentName='失物招领' 
          />
        </div>

        <div className='disp'>
          <Route path='/lost/lostInfo/:id' render={(props) => (<LostInfo hide={this.props.hide} {...props} />)} />
          <Route exact path='/lost' render={(props) => (<LostTable hide={this.props.hide} {...props} />)} />
        </div>
      </div>
    )
  }
}


export default withRouter(connect(null, {
  changeLost
})(LostDisp))