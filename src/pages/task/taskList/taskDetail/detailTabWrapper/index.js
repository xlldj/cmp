import React, { Fragment } from 'react'
import DetailTabHeader from './detailTabHeader'
import DetailTabs from './detailTabs'

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
