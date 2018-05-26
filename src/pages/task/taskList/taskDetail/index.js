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

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import {
  changeTask,
  changeOrder,
  changeDevice,
  changeFund,
  fetchTaskDetail
} from '../../../../actions'
const { TASKTYPE } = CONSTANTS
const moduleName = 'taskModule'
const subModule = 'taskDetail'
const modalName = 'taskDetailModal'

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
  render() {
    let {
      data,
      loading,
      selectedDetailId,
      showFinishModal,
      currentTab,
      forbiddenStatus
    } = this.props
    let id = selectedDetailId
    let { schoolId, schoolName, images, logs, type, level } = data
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
    const {
      id: queryId,
      showDetailImgs,
      showRepairmanModal,
      showCustomerModal,
      showDeveloperModal
    } =
      state || {}
    console.log(queryId, selectedDetailId)

    return (
      <div className="taskDetailWrapper slideLeft" ref="detailWrapper">
        {loading ? (
          <div className="task-loadWrapper">
            <LoadingMask />
          </div>
        ) : null}
        <div className="taskDetail-header">
          <h3>工单详情</h3>
          <button className="closeBtn" onClick={this.close}>
            <img src={closeBtn} alt="X" />
          </button>
        </div>

        <div className="taskDetail-content">
          <TaskInfoWrapper data={data} />
          <DetailTabWrapper {...this.props} forbiddenStatus={forbiddenStatus} />
          <HandleBtn {...this.props} />
          <ProcessLogs logs={logs} />
        </div>
        <TaskDetailSidebar {...this.props} />

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
  currentTab: state[moduleName][subModule].currentTab,
  showDetail: state.taskModule.taskListContainer.showDetail
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
