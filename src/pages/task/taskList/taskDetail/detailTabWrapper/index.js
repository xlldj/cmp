import React, { Component, Fragment } from 'react'
import { Button, Dropdown, Pagination, Menu } from 'antd'
import { connect } from 'react-redux'
import DetailTabHeader from './detailTabHeader'
import DetailTabs from './detailTabs'
import CONSTANTS from '../../../../../constants'
const { TAB2HINT } = CONSTANTS

class DetailTabWrapper extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showFinishModal: false
    }
  }
  changeTabIndex = e => {
    let key = parseInt(e.target.getAttribute('data-key'), 10)
    if (key) {
      this.props.changeTask('taskDetail', {
        currentTab: key
      })
    }
  }
  render() {
    const { env } = this.props.data || {}
    return (
      <Fragment>
        <DetailTabHeader {...this.props} changeTabIndex={this.changeTabIndex} />
        {env === 1 ? <DetailTabs {...this.props} /> : null}
      </Fragment>
    )
  }
}

export default DetailTabWrapper
