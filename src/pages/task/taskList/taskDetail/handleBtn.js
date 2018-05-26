import React from 'react'
import { Button, Dropdown, Pagination, Menu } from 'antd'
import CONSTANTS from '../../../../constants'
const { TAB2HINT } = CONSTANTS

class HandleBtn extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showFinishModal: false
    }
    this.reassignMenu = (
      <Menu selectable={false} onClick={this.reassign}>
        <Menu.Item key={1}>
          <span className="menuItem">客服</span>
        </Menu.Item>
        <Menu.Item key={2}>
          <span className="menuItem">维修员</span>
        </Menu.Item>
        <Menu.Item key={3}>
          <span className="menuItem">研发人员</span>
        </Menu.Item>
      </Menu>
    )
    this.reassignWithoutRepairman = (
      <Menu selectable={false} onClick={this.reassign}>
        <Menu.Item key={1}>
          <span className="menuItem">客服</span>
        </Menu.Item>
        <Menu.Item key={3}>
          <span className="menuItem">研发人员</span>
        </Menu.Item>
      </Menu>
    )
  }
  finishTask = () => {
    this.props.changeTask('taskDetail', { showFinishModal: true })
  }
  render() {
    const {
      status,
      forbiddenStatus,
      handleLimit,
      type,
      currentTab,
      complaintPage,
      feedbackPage,
      complaintTotal,
      feedbackTotal
    } = this.props
    return (
      <div className="handleBtn">
        {/* only show when 'status' is not finished and has right to handle. */}
        {status !== CONSTANTS.TASK_FINISHED && !forbiddenStatus.HANDLE_TASK ? (
          <div>
            {handleLimit !== true ? (
              <Dropdown
                overlay={
                  type === CONSTANTS.TASK_TYPE_REPAIR
                    ? this.reassignMenu
                    : this.reassignWithoutRepairman
                }
              >
                <Button type="primary">转接</Button>
              </Dropdown>
            ) : null}
            {handleLimit !== true ? (
              <Button type="primary" onClick={this.finishTask}>
                完结
              </Button>
            ) : null}
          </div>
        ) : (
          <span>{/* span used to seize a seat */}</span>
        )}
        {currentTab === 2 ||
        currentTab === 3 ||
        currentTab === 5 ||
        currentTab === 6 ||
        currentTab === 7 ? (
          <div>
            <span className="hint">({TAB2HINT[currentTab]})</span>
            <a href="" onClick={this.goToMore}>
              查看更多
            </a>
          </div>
        ) : null}
        {currentTab === 8 || currentTab === 9 ? (
          <div>
            <Pagination
              current={currentTab === 8 ? complaintPage : feedbackPage}
              pageSize={CONSTANTS.TASK_DETAIL_LIST_LENGTH}
              total={currentTab === 8 ? complaintTotal : feedbackTotal}
              onChange={
                currentTab === 8
                  ? this.changeComplaintPage
                  : this.changeFeedbackPage
              }
            />
          </div>
        ) : null}
      </div>
    )
  }
}
export default HandleBtn
