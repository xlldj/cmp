import React from 'react'
import { Modal, Carousel } from 'antd'

import TaskInfoWrapper from './taskInfo/index'
import ProcessLogs from './processLogs'
import TaskDetailSidebar from './taskDetailSidebar'
import HandleBtn from './handleBtn'
import FinishTaskModal from './finishTaskModal'
import DetailTabWrapper from './detailTabWrapper/index'

import CONSTANTS from '../../../../constants'
import LoadingMask from '../../../component/loadingMask'
import RepairmanTable from '../../../component/repairmanChoose'
import EmployeeChoose from '../../../component/employeeChoose'
import DepartmentChoose from '../../../component/departmentChoose'
import { checkObject } from '../../../../util/checkSame'
import closeBtn from '../../../assets/close.png'
import Noti from '../../../../util/noti'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import {
  changeTask,
  changeOrder,
  changeDevice,
  changeFund,
  fetchTaskDetail
} from '../../../../actions'
const { TASK_LIST_TAB_HANDLING } = CONSTANTS
const moduleName = 'taskModule'
const subModule = 'taskDetail'

class TaskDetail extends React.Component {
  state = {
    id: this.props.selectedDetailId
  }
  componentDidMount() {
    this.sendFetch()
    // add click event
    let root = document.getElementById('root')
    root.addEventListener('click', this.closeDetail, false)
  }
  componentWillUnmount() {
    let root = document.getElementById('root')
    root.removeEventListener('click', this.closeDetail, false)
  }
  closeDetail = e => {
    if (!this.props.showDetail) {
      return
    }
    let target = e.target
    let detailWrapper = this.refs.detailWrapper
    if (detailWrapper.contains(target)) {
      return
    }
    this.props.changeTask('taskListContainer', {
      showDetail: false,
      selectedRowIndex: -1,
      selectedDetailId: -1
    })
  }
  componentWillReceiveProps(nextProps) {
    if (!checkObject(this.props, nextProps, ['selectedDetailId'])) {
      const { selectedDetailId } = nextProps
      this.sendFetch(nextProps)
      if (selectedDetailId && selectedDetailId !== this.state.id) {
        this.setState({ id: selectedDetailId })
      }
    }
  }
  sendFetch = props => {
    props = props || this.props
    const { selectedDetailId } = props
    const body = { id: selectedDetailId }
    this.props.fetchTaskDetail(body)
  }
  back = () => {
    this.props.history.go(-1)
  }
  close = e => {
    this.props.changeTask('taskListContainer', {
      showDetail: false,
      selectedRowIndex: -1,
      selectedDetailId: -1
    })
  }
  updateAndClose = id => {
    let newProps = {
      showDetail: false,
      selectedRowIndex: -1,
      selectedDetailId: -1
    }
    this.props.changeTask(subModule, newProps)
  }
  confirmChooseRepairman = () => {
    // reassign to repairman success
    let { id } = this.state
    this.setState({
      showRepairmanModal: false
    })
    this.props.changeTask(subModule, {
      showRepairmanModal: false
    })
    Noti.hintOk('转发成功', '已成功转发给该维修员')
    this.updateAndClose(id)
  }
  cancelChooseRepairman = () => {
    this.props.changeTask(subModule, {
      showRepairmanModal: false
    })
  }
  confirmChooseCustomer = () => {
    // reassign to repairman success
    let { id } = this.state
    this.setState({
      showCustomerModal: false
    })
    this.props.changeTask(subModule, {
      showCustomerModal: false
    })
    Noti.hintOk('转发成功', '已成功转发给该客服')
    this.updateAndClose(id)
  }
  cancelChooseCustomer = () => {
    this.props.changeTask(subModule, {
      showCustomerModal: false
    })
  }
  reassign2DeveloperSuccess = () => {
    Noti.hintOk('操作成功', '当前工单已被转接')
    this.setState({
      showDeveloperModal: false
    })
    this.updateAndClose(this.state.id)
  }
  cancelChooseDeveloper = () => {
    this.props.changeTask(subModule, {
      showDeveloperModal: false
    })
  }
  backTask = () => {
    this.props.changeTask('taskDetail', {
      currentTab: 1,
      isHaveBackTask: false,
      backTaskId: null
    })
  }
  keepAndUpdate = id => {
    // this is handle process after sending message.
    // 1. update detail.
    // 2. if main_phase === 1, nothing to do with list.
    // 3. if main_phase === 0, set 'selectedRowIndex' to -1,  clear list, set 'main_phase' to 1
    this.sendFetch()
    /* no matter ajax success or fail, check if fetch list again */
    // Note to keep 'selectedDetailId'.
    // only clear 'pending' and 'handing', because it won't be in 'finished' when sending message.
    let { tabIndex } = this.props
    if (tabIndex === TASK_LIST_TAB_HANDLING) {
      // if in 'handing' module
      return
    } else {
      const { pengdingList } = this.props
      this.props.changeTask('taskListContainer', {
        tabIndex: TASK_LIST_TAB_HANDLING,
        showDetail: true,
        selectedDetailId: id
      })
      // 因为是从'待处理'跳转到'处理中'，为保证能找到工单，将待处理中的设置直接传给处理中
      this.props.changeTask('handlingList', pengdingList)
    }
  }
  render() {
    let {
      data,
      loading,
      selectedDetailId,
      showFinishModal,
      forbiddenStatus,
      showRepairmanModal,
      showCustomerModal,
      showDeveloperModal
    } = this.props
    let id = selectedDetailId
    let { schoolId, schoolName, images, logs, level } = data
    const carouselItems =
      images &&
      images.map((r, i) => {
        return (
          <img
            key={`carousel${i}`}
            alt=""
            src={CONSTANTS.FILEADDR + r}
            className="carouselImg"
          />
        )
      })
    const carousel = (
      <Carousel
        dots={true}
        accessibility={true}
        className="carouselItem"
        autoplay={false}
        arrows={true}
        initialSlide={1}
      >
        {carouselItems}
      </Carousel>
    )

    const { state } = this.props.location
    const { showDetailImgs } = state || {}

    return (
      <div
        className="detailPanelWrapperWithSiderbar taskDetailWrapper slideLeft"
        ref="detailWrapper"
      >
        {loading ? (
          <div className="task-loadWrapper">
            <LoadingMask />
          </div>
        ) : null}
        <div className="detailPanelWrapperWithSiderbar-header">
          <h3>工单详情</h3>
          <button className="closeBtn" onClick={this.close}>
            <img src={closeBtn} alt="X" />
          </button>
        </div>

        <div className="detailPanelWrapperWithSiderbar-content">
          <TaskInfoWrapper data={data} />
          <DetailTabWrapper {...this.props} forbiddenStatus={forbiddenStatus} />
          <HandleBtn {...this.props} />
          <ProcessLogs logs={logs} />
        </div>
        <TaskDetailSidebar
          backTask={this.backTask}
          keepAndUpdate={this.keepAndUpdate}
          {...this.props}
        />

        {/* images in task detail */}
        {showDetailImgs ? (
          <Modal
            visible={true}
            title=""
            closable={true}
            onCancel={this.closeDetailImgs}
            className="carouselModal"
            okText=""
            footer={null}
          >
            <div className="carouselContainer">{carousel}</div>
          </Modal>
        ) : null}

        {/* for repairm choose */}
        {showRepairmanModal ? (
          <RepairmanTable
            showModal={showRepairmanModal}
            confirm={this.confirmChooseRepairman}
            cancel={this.cancelChooseRepairman}
            id={id}
            level={level}
            schoolId={schoolId}
            schoolName={schoolName}
          />
        ) : null}

        {/* for custome service */}
        {showCustomerModal ? (
          <EmployeeChoose
            showModal={true}
            confirm={this.confirmChooseCustomer}
            cancel={this.cancelChooseCustomer}
            id={id}
            level={level}
            department={CONSTANTS.EMPLOYEE_CUSTOMER}
            schoolId={schoolId}
            schoolName={schoolName}
          />
        ) : null}

        {/* for developer choose */}
        {showDeveloperModal ? (
          <DepartmentChoose
            id={id}
            level={level}
            department={CONSTANTS.EMPLOYEE_DEVELOPER}
            showModal={showDeveloperModal}
            success={this.reassign2DeveloperSuccess}
            cancel={this.cancelChooseDeveloper}
          />
        ) : null}
        {showFinishModal ? <FinishTaskModal {...this.props} /> : null}
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  forbiddenStatus: state.setAuthenData.forbiddenStatus,
  tags: state.setTagList,
  data: state.taskDetailModal.detail,
  loading: state.taskDetailModal.detailLoading,
  selectedDetailId: state.taskModule.taskListContainer.selectedDetailId,
  showFinishModal: state[moduleName][subModule].showFinishModal,
  showRepairmanModal: state[moduleName][subModule].showRepairmanModal,
  showCustomerModal: state[moduleName][subModule].showCustomerModal,
  showDeveloperModal: state[moduleName][subModule].showDeveloperModal,
  currentTab: state[moduleName][subModule].currentTab,
  showDetail: state.taskModule.taskListContainer.showDetail,
  tabIndex: state[moduleName].taskListContainer.tabIndex,
  pengdingList: state[moduleName].pengdingList,
  isHaveBackTask: state[moduleName].taskDetail.isHaveBackTask,
  backTaskId: state[moduleName].taskDetail.backTaskId
})

export default withRouter(
  connect(mapStateToProps, {
    changeTask,
    changeOrder,
    changeDevice,
    changeFund,
    fetchTaskDetail
  })(TaskDetail)
)
