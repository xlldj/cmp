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
const subModule = 'blackedList'
const modalName = 'blackModal'
const { PAGINATION: SIZE } = CONSTANTS

class BlackPeople extends React.Component {
  constructor(props) {
    super(props)
    let searchingText = ''
    this.state = {
      searchingText
    }
    this.columns = [
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
  componentDidMount() {
    this.sendFetch()
    console.log('black list mount')
    this.syncStateWithProps()
  }
  componentWillReceiveProps(nextProps) {
    if (checkObject(this.props, nextProps, ['schoolId', 'page', 'selectKey'])) {
      return
    }
    this.sendFetch(nextProps)
  }
  syncStateWithProps = () => {
    const { selectKey } = this.props
    if (selectKey !== this.state.searchingText) {
      this.setState({
        searchingText: selectKey
      })
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
    this.setProps({
      type: 'selectKey',
      value: {
        selectKey: v
      }
    })
  }
  setProps = event => {
    const value = lostFoundListPropsController(this.state, this.props, event)
    if (value) {
      this.props.changeLost(subModule, value)
    }
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.setProps({ type: 'page', value: { page } })
  }
  sendFetch(props) {
    props = props || this.props
    const { page, schoolId, selectKey } = props
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.schoolId = +schoolId
    }
    if (selectKey) {
      body.selectKey = selectKey
    }
    this.props.fetchBlackPeopleList(body)
  }
  render() {
    const { dataSource, total, loading, page } = this.props
    const { searchingText } = this.state
    const showClearBtn = !!searchingText
    return (
      <div>
        <QueryPanel>
          <QueryLine>
            <QueryBlock>
              <p>当前拉黑人数: {total}人</p>
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
                placeholder="手机号"
                searchingText={searchingText}
                pressEnter={this.pressEnter}
                changeSearch={this.changeSearch}
              />
            </QueryBlock>
          </QueryLine>
        </QueryPanel>
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
          />
        </div>
      </div>
    )
  }
}
const mapStateToProps = (state, ownProps) => {
  return {
    page: state[moduleName][subModule].page,
    selectKey: state[moduleName][subModule].selectKey,
    schoolId: state[moduleName].lostListContainer.schoolId,
    total: state[modalName].total,
    dataSource: state[modalName].list,
    loading: state[modalName].listLoading
  }
}

export default withRouter(
  connect(mapStateToProps, { changeLost, fetchBlackPeopleList })(BlackPeople)
)
