import React from 'react'

import Query from './query'
import FundCheckTable from './fundCheckTable'

class FundCheckList extends React.Component {
  render() {
    return (
      <div className="panelWrapper">
        <Query />
        <FundCheckTable />
      </div>
    )
  }
}

export default FundCheckList
