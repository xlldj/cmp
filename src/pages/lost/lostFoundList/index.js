import React from 'react'
import { Table } from 'antd'

import Query from './query'
import SchoolSelector from '../../component/schoolSelector'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeLost } from '../action'
import { changeSchool, changePhase } from './controller'

import CONSTANTS from '../../../constants'

const { LOST_LIST_PAGE_TAB, PAGINATION: SIZE } = CONSTANTS
const moduleName = 'lostModule'
const modalName = 'lostModal'
const subModule = 'lostFoundList'

class LostListContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  render() {
    const { page, loading, dataSource, total } = this.props
    return (
      <div className="">
        <Query />

        <div className="tableList">
          <Table
            bordered
            showQuickJumper
            loading={loading}
            pagination={{
              pageSize: SIZE,
              current: page,
              total: total,
              showQuickJumper: true
            }}
            dataSource={dataSource}
            rowKey={record => record.id}
            columns={this.columns}
            onChange={this.changePage}
            onRowClick={this.selectRow}
            rowClassName={this.setRowClass}
          />
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    page: state[moduleName][subModule].page,
    dataSource: state[modalName].list,
    loading: state[modalName].listLoading,
    total: state[modalName].total
  }
}

export default withRouter(
  connect(mapStateToProps, { changeLost })(LostListContainer)
)
