import React from 'react'
import { Link } from 'react-router-dom'

import { Table } from 'antd'

import AjaxHandler from '../../util/ajax'
import SearchLine from '../component/searchLine'
import SchoolSelector from '../component/schoolSelector'
import BasicSelector from '../component/basicSelector'
import CONSTANTS from '../component/constants'
import Time from '../component/time'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeLost } from '../../actions'
import { checkObject } from '../util/checkSame'
const subModule = 'lostList'

const SIZE = CONSTANTS.PAGINATION

const typeName = CONSTANTS.LOSTTYPE

class LostTable extends React.Component {
  static propTypes = {
    schoolId: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired
  }
  constructor(props) {
    super(props)
    let dataSource = []
    this.state = {
      dataSource,
      loading: false,
      total: 0
    }
    this.columns = [
      {
        title: '学校名称',
        width: '20%',
        dataIndex: 'schoolName',
        className: 'firstCol'
      },
      {
        title: '类型',
        dataIndex: 'type',
        width: '10%',
        render: (text, record, index) => typeName[record.type]
      },
      {
        title: '标题',
        dataIndex: 'title',
        width: '20%'
      },
      {
        title: '用户',
        dataIndex: 'user',
        width: '20%'
      },
      {
        title: <p>发布时间</p>,
        dataIndex: 'createTime',
        width: '20%',
        render: (text, record, index) => {
          let dStr = Time.getTimeStr(record.createTime)
          return dStr
        }
      },
      {
        title: '操作',
        className: 'lastCol',
        dataIndex: 'operation',
        render: (text, record, index) => (
          <div className="editable-row-operations">
            <span>
              <Link to={`/lost/lostInfo/:${record.id}`}>详情</Link>
            </span>
          </div>
        )
      }
    ]
  }
  fetchData = body => {
    this.setState({
      loading: true
    })
    let resource = '/api/lost/list'
    const cb = json => {
      let nextState = { loading: false }
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          nextState.dataSource = json.data.lostAndFounds
          nextState.total = json.data.total
          if (body.page === 1) {
            nextState.page = 1
          }
        } else {
          this.setState(nextState)
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb, this.errorHandler)
  }
  errorHandler = () => {
    this.setState({
      loading: false
    })
  }

  componentDidMount() {
    this.props.hide(false)

    let { page, schoolId, type } = this.props
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if (type !== 'all') {
      body.type = parseInt(type, 10)
    }
    this.fetchData(body)
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  componentWillReceiveProps(nextProps) {
    if (checkObject(this.props, nextProps, ['page', 'schoolId', 'type'])) {
      return
    }
    let { page, schoolId, type } = nextProps
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if (type !== 'all') {
      body.type = parseInt(type, 10)
    }
    this.fetchData(body)
  }
  changeSchool = value => {
    let { schoolId } = this.props
    if (schoolId === value) {
      return
    }
    this.props.changeLost(subModule, { page: 1, schoolId: value })
  }
  changeType = value => {
    let { type } = this.props
    if (type === value) {
      return
    }
    this.props.changeLost(subModule, { page: 1, type: value })
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.props.changeLost(subModule, { page: page })
  }
  render() {
    const { dataSource, total, loading } = this.state
    const { page, schoolId, type } = this.props

    return (
      <div className="contentArea">
        <SearchLine
          selector1={
            <SchoolSelector
              selectedSchool={schoolId}
              changeSchool={this.changeSchool}
            />
          }
          selector2={
            <BasicSelector
              staticOpts={typeName}
              allTitle={'全部类型'}
              selectedOpt={type}
              changeOpt={this.changeType}
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
  schoolId: state.changeLost[subModule].schoolId,
  type: state.changeLost[subModule].type,
  page: state.changeLost[subModule].page
})

export default withRouter(
  connect(mapStateToProps, {
    changeLost
  })(LostTable)
)
