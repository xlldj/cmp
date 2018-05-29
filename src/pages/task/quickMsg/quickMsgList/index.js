import React from 'react'
import QuickMsgListQuery from './query'
import QuickMsgListTable from './table'
class QuickMsgListContainer extends React.Component {
  render() {
    return (
      <div>
        <QuickMsgListQuery />
        <QuickMsgListTable />
      </div>
    )
  }
}
export default QuickMsgListContainer
