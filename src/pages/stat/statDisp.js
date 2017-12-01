import React from 'react'
import { Route } from 'react-router-dom'
import Bread from '../bread'
import './style/style.css'
import Stat from './stat'

const breadcrumbNameMap = {
}

class StatDisp extends React.Component {
  render () {
    return (
      <div>
        <div className='breadc'>
          <Bread breadcrumbNameMap={breadcrumbNameMap} single parent='stat' parentName='统计分析' />
        </div>

        <div >
          <Route exact path='/stat' render={(props) => (<Stat hide={this.props.hide} {...props} />)} />
        </div>
      </div>
    )
  }
}

export default StatDisp
