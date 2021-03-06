import React from 'react'

import Query from './query'
import LostFoundTable from './table'

class LostListContainer extends React.Component {
  componentDidMount() {}
  render() {
    return (
      <div className="">
        <Query />
        <LostFoundTable {...this.props} />
      </div>
    )
  }
}

export default LostListContainer
