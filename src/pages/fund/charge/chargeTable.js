import React from 'react'
import { Link } from 'react-router-dom'

import { Table } from 'antd'

import AjaxHandler from '../../../util/ajax'
import CONSTANTS from '../../../constants'
import SearchLine from '../../component/searchLine'

import SchoolSelector from '../../component/schoolSelector'
import { checkObject } from '../../../util/checkSame'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeFund } from '../../../actions'
const subModule = 'charge'

const SIZE = CONSTANTS.PAGINATION

class ChargeTable extends React.Component {
  static propTypes = {
    schoolId: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired
  }
  constructor(props) {
    super(props)
    const dataSource = []
    this.state = {
      dataSource: dataSource,
      loading: false,
      total: 0
    }
    const { forbiddenStatus } = this.props
    this.columns = [
      {
        title: '学校',
        dataIndex: 'schoolName',
        width: '20%',
        className: 'firstCol'
      },
      {
        title: '充值面额(元)',
        dataIndex: 'items',
        width: '50%',
        className: 'amountItem',
        render: (text, record, index) => {
          let lis = record.items.map((r, i) => (
            <span key={`chargeItem${i}`}>{r}</span>
          ))
          return <p>{lis}</p>
        }
      },
      {
        title: '操作',
        dataIndex: 'operation',
        className: 'lastCol',
        render: (text, record, index) => (
          <div key={`operation${index}`} className="editable-row-operations">
            {forbiddenStatus.FUND_DENO_ADD_AND_EDIT ? null : (
              <Link
                to={{ pathname: `/fund/charge/editCharge/:${record.schoolId}` }}
              >
                编辑
              </Link>
            )}
          </div>
        )
      }
    ]
  }
  fetchData = body => {
    this.setState({
      loading: true
    })
    let resource = '/recharge/denomination/list'
    const cb = json => {
      let nextState = { loading: false }
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          const data = json.data.rechargeDenominations.map((s, i) => {
            s.key = s.id
            return s
          })
          nextState.dataSource = data
          nextState.total = json.data.total
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
  changePage = pageObj => {
    let page = pageObj.current
    this.props.changeFund(subModule, { page: page })
  }
  render() {
    let { total, loading, dataSource } = this.state
    let { page, schoolId, forbiddenStatus } = this.props
    return (
      <div className="contentArea">
        <SearchLine
          addTitle={
            forbiddenStatus.FUND_DENO_ADD_AND_EDIT ? null : '添加充值面额'
          }
          addLink="/fund/charge/addCharge"
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
  })(ChargeTable)
)
