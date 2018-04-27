import React from 'react'
import { Table, Badge, Popconfirm } from 'antd'
import { Link } from 'react-router-dom'
import AjaxHandler from '../../../util/ajax'
import Time from '../../../util/time'
import CONSTANTS from '../../../constants'
import SearchLine from '../../component/searchLine'
import SchoolSelector from '../../component/schoolSelector'

import { checkObject } from '../../../util/checkSame'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeFund } from '../../../actions'
const subModule = 'freeGiving'

const HINTSTATUS = {
  1: 'success',
  2: 'default'
}
const { PAGINATION: SIZE, FREEGIVING_STATUS } = CONSTANTS

class FreeGivingTable extends React.Component {
  static propTypes = {
    schoolId: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired
  }
  constructor(props) {
    super(props)
    let dataSource = [],
      schools = []
    this.state = {
      dataSource,
      schools,
      loading: false,
      total: 0
    }
    this.columns = [
      {
        title: '学校名称',
        dataIndex: 'schoolName',
        width: '21%',
        className: 'firstCol'
      },
      {
        title: '赠送规则',
        dataIndex: 'givingRule',
        width: '22%'
      },
      {
        title: '创建人',
        dataIndex: 'creatorName',
        width: '12%'
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        width: '15%',
        render: (text, record, index) => {
          return record.createTime ? Time.getTimeStr(record.createTime) : ''
        }
      },
      {
        title: '上线状态',
        dataIndex: 'status',
        width: '10%',
        render: (text, record, index) => (
          <Badge
            status={HINTSTATUS[record.status]}
            text={FREEGIVING_STATUS[record.status]}
          />
        )
      },
      {
        title: '操作',
        dataIndex: 'operation',
        className: 'lastCol',
        render: (text, record, index) => (
          <div className="editable-row-operations">
            <Link to={`/fund/freeGiving/info/:${record.id}`}>编辑</Link>
            <span className="ant-divider" />
            <Popconfirm
              title="确定要删除此活动么?"
              onConfirm={e => {
                this.delete(e, record.id)
              }}
              onCancel={this.cancelDelete}
              okText="确认"
              cancelText="取消"
            >
              <a href="">删除</a>
            </Popconfirm>
          </div>
        )
      }
    ]
  }
  fetchData = body => {
    this.setState({
      loading: true
    })
    let resource = '/api/givingRule/activity/list'
    AjaxHandler.fetch(resource, body).then(json => {
      let nextState = { loading: false }
      if (json && json.data) {
        nextState.dataSource = json.data.givingRules
        nextState.total = json.data.total
      }
      this.setState(nextState)
    })
  }
  componentDidMount() {
    let { page, schoolId } = this.props
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    this.fetchData(body)
  }
  componentWillReceiveProps(nextProps) {
    if (checkObject(this.props, nextProps, ['page', 'schoolId'])) {
      return
    }
    let { page, schoolId } = nextProps
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    this.fetchData(body)
  }
  changeSchool = value => {
    let { schoolId } = this.props
    if (schoolId === value) {
      return
    }
    this.props.changeFund(subModule, { page: 1, schoolId: value })
  }

  delete = (e, id) => {
    e.preventDefault()
    let url = '/api/givingRule/activity/delete'
    const body = {
      id: id
    }
    AjaxHandler.fetch(url, body).then(json => {
      if (json && json.data) {
        const body = {
          page: this.props.page,
          size: SIZE
        }
        this.fetchData(body)
      }
    })
  }
  cancelDelete = () => {}
  changePage = pageObj => {
    let page = pageObj.current
    this.props.changeFund(subModule, { page: page })
  }

  render() {
    const { dataSource, total, loading } = this.state
    const { page, schoolId } = this.props

    return (
      <div className="contentArea">
        <SearchLine
          addTitle="新建赠送规则"
          addLink="/fund/freeGiving/add"
          selector1={
            <SchoolSelector
              selectedSchool={schoolId}
              changeSchool={this.changeSchool}
            />
          }
        />

        <div className="tableList">
          <Table
            bordered
            loading={loading}
            rowKey={record => record.id}
            pagination={{ pageSize: SIZE, current: page, total: total }}
            dataSource={dataSource}
            columns={this.columns}
            onChange={this.changePage}
          />
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  schoolId: state.fundModule[subModule].schoolId,
  page: state.fundModule[subModule].page
})

export default withRouter(
  connect(mapStateToProps, {
    changeFund
  })(FreeGivingTable)
)
