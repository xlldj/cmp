import React from 'react'

import Query from './query'
import BeingsTable from './table'
class FundCheckList extends React.Component {
  componentDidMount() {
    this.props.hide(false)
  }
  render() {
    return (
      <div className="panelWrapper">
        <Query />
        <BeingsTable />
      </div>
    )
  }
}

export default FundCheckList
