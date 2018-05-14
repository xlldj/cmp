import React from 'react'
import BlackPeopleTable from './blackPeopleTable'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeLost, fetchBlackPeopleList } from '../../action'
import CONSTANTS from '../../../../constants'
import { checkObject } from '../../../../util/checkSame'
const moduleName = 'lostModule'
const modalName = 'blackModal'
const { PAGINATION: SIZE } = CONSTANTS
class LostListContainer extends React.Component {
  componentDidMount() {
    this.sendFetch()
  }
  componentWillReceiveProps(nextProps) {
    if (checkObject(this.props, nextProps, ['schoolId', 'page'])) {
      return
    }
    this.sendFetch(nextProps)
  }
  sendFetch(props) {
    props = props || this.props
    const { page, schoolId } = this.props
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.schoolId = +schoolId
    }
    this.props.fetchBlackPeopleList(body)
  }
  render() {
    return (
      <div className="blackTable">
        <BlackPeopleTable />
      </div>
    )
  }
}
const mapStateToProps = (state, ownProps) => {
  return {
    schoolId: state[moduleName].lostListContainer.schoolId,
    page: state[modalName].page,
    totalNormal: state[modalName].totalNormal,
    listLoading: state[modalName].listLoading
  }
}

export default withRouter(
  connect(mapStateToProps, { changeLost, fetchBlackPeopleList })(
    LostListContainer
  )
)
