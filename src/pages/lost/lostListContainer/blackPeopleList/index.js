import React from 'react'
import { Table, Button } from 'antd'
import Time from '../../../../util/time'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeLost, fetchBlackPeopleList } from '../../action'
import CONSTANTS from '../../../../constants'
import { checkObject } from '../../../../util/checkSame'
import { lostFoundListPropsController } from '../controller'
import { QueryPanel, QueryLine, QueryBlock } from '../../../component/query'
import SearchInput from '../../../component/searchInput'
const moduleName = 'lostModule'
const modalName = 'blackModal'
const { PAGINATION: SIZE, LOSTTYPE } = CONSTANTS
class LostListContainer extends React.Component {
  constructor(props) {
    super(props)
    let searchingText = ''
    this.state = {
      searchingText
    }
  }
  clearSearch = () => {
    this.setState(
      {
        searchingText: ''
      },
      this.pressEnter
    )
  }
  changeSearch = e => {
    this.setState({
      searchingText: e.target.value
    })
  }
  pressEnter = () => {
    let v = this.state.searchingText.trim()
    this.setState({
      searchingText: v
    })
    let selectKey = this.props.list_selectKey
    if (v === selectKey) {
      return
    }
    this.sendFetch()
  }
  setProps = event => {
    const value = lostFoundListPropsController(this.state, this.props, event)
    if (value) {
      this.props.changeLost(modalName, value)
    }
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.setProps({ type: 'page', value: { page } })
  }
  componentDidMount() {
    this.sendFetch()
  }
  componentWillReceiveProps(nextProps) {
    if (checkObject(this.props, nextProps, ['schoolId', 'page'])) {
      return
    }
    this.sendFetch(nextProps)
  }
  getColumns = () => {
    return [
      {
        title: '学校名称',
        dataIndex: 'schoolName',
        className: 'firstCol'
      },
      {
        title: '用户手机号',
        dataIndex: 'userMobile'
      },
      {
        title: '用户昵称',
        dataIndex: 'userNickname',
        width: '20%'
      },
      {
        title: '拉黑时间',
        dataIndex: 'createTime',
        render: (text, record) => Time.getTimeStr(record.createTime)
      },
      {
        title: '拉黑时长',
        dataIndex: 'blackListInfo'
      },
      {
        title: '操作人',
        dataIndex: 'operUserNickname'
      },
      {
        title: <p className="lastCol">操作</p>,
        dataIndex: 'operation',
        width: '12%',
        render: (text, record, index) => (
          <div className="editable-row-operations lastCol">
            <span>
              <Link to={`/user/userInfo/:${record.userId}`}>详情</Link>
            </span>
          </div>
        )
      }
    ]
  }
  sendFetch(props) {
    props = props || this.props
    const { page, schoolId } = this.props
    const { searchingText } = this.state
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.schoolId = +schoolId
    }
    if (searchingText) {
      body.selectKey = searchingText
    }
    this.props.fetchBlackPeopleList(body)
  }
  render() {
    const { dataSource, total, loading, page } = this.props
    const { searchingText } = this.state
    const showClearBtn = !!searchingText
    const columns = this.getColumns()
    return (
      <div className="tableList blackTable">
        <QueryPanel>
          <QueryLine>
            <QueryBlock>
              <p className="profitBanner">当前拉黑人数: {total}人</p>
            </QueryBlock>
            <QueryBlock>
              {showClearBtn ? (
                <Button
                  onClick={this.clearSearch}
                  className="rightSeperator"
                  type="primary"
                >
                  清空
                </Button>
              ) : null}
              <SearchInput
                placeholder="手机号/手机型号"
                searchingText={searchingText}
                pressEnter={this.pressEnter}
                changeSearch={this.changeSearch}
              />
            </QueryBlock>
          </QueryLine>
        </QueryPanel>
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
          columns={columns}
          onChange={this.changePage}
          rowClassName={this.setRowClass}
        />
      </div>
    )
  }
}
const mapStateToProps = (state, ownProps) => {
  return {
    schoolId: state[moduleName].lostListContainer.schoolId,
    page: state[modalName].page,
    totalNormal: state[modalName].totalNormal,
    listLoading: state[modalName].listLoading,
    total: state[modalName].total,
    dataSource: state[modalName].list,
    loading: state[modalName].listLoading
  }
}

export default withRouter(
  connect(mapStateToProps, { changeLost, fetchBlackPeopleList })(
    LostListContainer
  )
)
