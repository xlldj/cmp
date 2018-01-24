import React from 'react'

import { Table, Popconfirm } from 'antd'

import Noti from '../../../util/noti'
import Time from '../../component/time'
import AjaxHandler from '../../../util/ajax'
import CONSTANTS from '../../component/constants'
import SearchLine from '../../component/searchLine'
import SchoolSelector from '../../component/schoolSelector'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeFund } from '../../../actions'
import { checkObject } from '../../util/checkSame'
const subModule = 'abnormal'

const SIZE = CONSTANTS.PAGINATION

class AbnormalOrder extends React.Component {
  static propTypes = {
    page: PropTypes.number.isRequired,
    schoolId: PropTypes.string.isRequired,
    selectKey: PropTypes.string.isRequired
  }
  constructor(props) {
    super(props)
    const dataSource = []
    this.state = {
      dataSource: dataSource,
      searchingText: '',
      loading: false,
      total: 0,
      settling: false
    }
    this.columns = [
      {
        title: '账单类型',
        dataIndex: 'operationType',
        width: '8%',
        className: 'firstCol',
        render: (text, record) => CONSTANTS.FUNDTYPE[record.operationType]
      },
      {
        title: '流水号',
        dataIndex: 'orderNo',
        width: '21%'
      },
      {
        title: '用户',
        dataIndex: 'mobile',
        width: '12%'
      },
      {
        title: '学校',
        dataIndex: 'schoolName',
        width: '15%'
      },
      {
        title: '时间',
        dataIndex: 'createTime',
        width: '12%',
        render: (text, record) =>
          record.createTime ? Time.getTimeStr(record.createTime) : '暂无'
      },
      {
        title: '金额',
        dataIndex: 'amount',
        width: '8%',
        render: (text, record, index) => `¥${record.amount}`
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: '10%',
        className: 'red',
        render: (text, record) => '异常'
      },
      {
        title: <p className="lastCol">操作</p>,
        dataIndex: 'operation',
        render: (text, record, index) => {
          let operation = record.operationType === 1 ? '增加' : '减少'
          let title = `确定要为用户(${record.mobile})账户${operation}${
            record.amount
          }元么？`
          return (
            <div className="editable-row-operations lastCol operationCol">
              {this.state.settling ? (
                <a href="">{operation}余额</a>
              ) : (
                <Popconfirm
                  title={title}
                  onConfirm={e => {
                    this.settleAmount(e, record.id, record.operationType)
                  }}
                  okText="确认"
                  cancelText="取消"
                >
                  <a href="">{operation}余额</a>
                </Popconfirm>
              )}
            </div>
          )
        }
      }
    ]
  }
  settleAmount = (e, id, type) => {
    if (this.state.settling) {
      return
    }
    this.setState({
      settling: true
    })

    let resource = '/funds/abnormal/settle'
    const body = {
      fundsId: id,
      type: type
    }
    const cb = json => {
      this.setState({
        settling: false
      })
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else {
        if (json.data.result) {
          const body = {
            page: this.state.page,
            size: SIZE
          }
          if (this.state.searchingText) {
            body.searchingText = this.state.searchingText
          }
          this.fetchData(body)
        } else {
          Noti.hintAndClick(
            '操作出错',
            json.data.failReason || '请稍后重试',
            null
          )
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  fetchData = body => {
    this.setState({
      loading: true
    })
    let resource = '/funds/abnormal/list'
    const cb = json => {
      let nextState = {
        loading: false
      }
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          nextState.dataSource = json.data.funds
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
    let { page, selectKey, schoolId } = this.props
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if (selectKey) {
      body.selectKey = selectKey
    }
    this.fetchData(body)
    this.setState({
      searchingText: selectKey
    })
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  componentWillReceiveProps(nextProps) {
    if (checkObject(this.props, nextProps, ['schoolId', 'selectKey', 'page'])) {
      return
    }
    let { page, selectKey, schoolId } = nextProps
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if (selectKey) {
      body.selectKey = selectKey
    }
    this.fetchData(body)
    this.setState({
      searchingText: selectKey
    })
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.props.changeFund(subModule, { page: page })
  }
  pressEnter = () => {
    let v = this.state.searchingText.trim()
    this.setState({
      searchingText: v
    })
    let selectKey = this.props.selectKey
    if (v === selectKey) {
      return
    }
    this.props.changeFund(subModule, { page: 1, selectKey: v })
  }
  changeSearch = e => {
    this.setState({
      searchingText: e.target.value
    })
  }
  changeSchool = v => {
    let schoolId = this.props.schoolId
    if (v !== schoolId) {
      this.props.changeFund(subModule, { schoolId: v })
    }
  }

  render() {
    let { dataSource, total, loading, searchingText } = this.state
    const { page, schoolId } = this.props

    return (
      <div className="contentArea">
        <SearchLine
          searchInputText="用户/流水号"
          searchingText={searchingText}
          pressEnter={this.pressEnter}
          changeSearch={this.changeSearch}
          selector1={
            <SchoolSelector
              selectedSchool={schoolId}
              changeSchool={this.changeSchool}
            />
          }
        />

        <div className="tableList complaint">
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
  selectKey: state.changeFund[subModule].selectKey,
  page: state.changeFund[subModule].page,
  schoolId: state.changeFund[subModule].schoolId
})

export default withRouter(
  connect(mapStateToProps, {
    changeFund
  })(AbnormalOrder)
)
