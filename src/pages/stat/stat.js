import React, { Component } from 'react'

import OverView from './overView'
import Charts from './charts'
import RankPanel from './rankPanel'

export default class Stat extends Component {
  componentDidMount () {
    this.props.hide(false)
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  render () {
    return (
        <div className='statContent'>
          <OverView hide={this.props.hide} />
          <Charts 
          />
          <RankPanel />
        </div>
    )
  }
}
