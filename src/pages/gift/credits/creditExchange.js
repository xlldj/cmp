import React from 'react'

import { Table, Modal, Popconfirm, Button } from 'antd'

import Noti from '../../../util/noti'
import AjaxHandler from '../../../util/ajax'
// import AjaxHandler from '../../../mock/ajax'
import CONSTANTS from '../../../constants'
import SearchLine from '../../component/searchLine'
import SchoolSelector from '../../component/schoolSelector'
import SchoolSelectorWithoutAll from '../../component/schoolSelectorWithoutAll'
import Time from '../../../util/time'
import GiftTable from '../../component/giftTable'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeGift, fetchGifts } from '../../../actions'
import { checkObject } from '../../../util/checkSame'
const subModule = 'credits'

const { PAGINATION, DEVICETYPE } = CONSTANTS

class CreditExchange extends React.Component {
  static propTypes = {
    schoolId: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired
  }
  constructor(props) {
    super(props)
    let dataSource = []
    this.state = {
      dataSource,
      loading: false,
      total: 0,
      showCreditCreate: false,
      editingId: 0,
      editingCredit: {
        schoolId: '',
        formatError: false,
        matchError: false,
        emptyError: false,
        existError: false, // check if the shcool has set rules
        items: [
          {
            giftId: '',
            credits: '',
            deviceType: 1
          },
          {
            giftId: '',
            credits: '',
            deviceType: 2
          },
          {
            giftId: '',
            credits: '',
            deviceType: 3
          },
          {
            giftId: '',
            credits: '',
            deviceType: 4
          }
        ]
      },
      posting: false, // for bad network
      checking: false,
      showGifts: false,
      gifts: [],
      editingDeviceType: 0,
      editingGiftId: 0
    }

    this.columns = [
      {
        title: '学校',
        dataIndex: 'schoolName',
        width: '15%',
        className: 'firstCol'
      },
      {
        title: '兑换规则',
        dataIndex: 'creditsItems',
        width: '40%',
        render: (text, record, index) => {
          let { gifts } = this.props
          if ('creditsItems' in record) {
            // use all deviceTypes to get all data.
            let deviceTypes = Object.keys(DEVICETYPE)
            let lis = deviceTypes.map((dt, ind) => {
              let item = record.creditsItems.find(
                c => c.deviceType === parseInt(dt, 10)
              )
              let amount = ''
              if (item && item.giftId) {
                let gift = gifts.find(g => g.id === item.giftId)
                amount = gift ? gift.amount : ''
              }
              return (
                <li key={`creditLi${ind}`}>
                  <span key={`label${ind}`} className="label">
                    {DEVICETYPE[dt]}:
                  </span>
                  {amount ? (
                    <span key={`value${ind}`}>
                      {item.credits}积分/{amount}元代金券
                    </span>
                  ) : (
                    <span className="red">未设置</span>
                  )}
                </li>
              )
            })
            return <ul key={`rule${index}`}>{lis}</ul>
          } else {
            // incase has no 'creditsItems' bus returned in json.data. This should not happen.
            return <span className="red">未设置</span>
          }
        }
      },
      {
        title: '创建人',
        dataIndex: 'creatorName',
        width: '15%'
      },
      {
        title: <p>创建时间</p>,
        dataIndex: 'createTime',
        width: '15%',
        render: (text, record, index) => {
          return Time.getTimeStr(record.createTime)
        }
      },
      {
        title: <p>操作</p>,
        dataIndex: 'operation',
        render: (text, record, index) => (
          <div className="editable-row-operations">
            <a href="" onClick={e => this.editCredit(e, record.id)}>
              编辑
            </a>
            <span className="ant-divider" />
            <Popconfirm
              title="确定要删除此任务么?"
              onConfirm={e => {
                this.delete(e, record.id)
              }}
              okText="确认"
              cancelText="取消"
            >
              <a href="">删除</a>
            </Popconfirm>
          </div>
        ),
        className: 'lastCol'
      }
    ]
  }
  fetchGifts = () => {
    let resource = '/api/gift/list'
    const body = {
      page: 1,
      size: 100
    }
    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data) {
          this.setState({
            gifts: json.data.gifts
          })
          if (this.props.match.params.id) {
            let id = parseInt(this.props.match.params.id.slice(1), 10)
            const body = {
              id: id
            }
            this.fetchData(body)
            this.setState({
              id: id
            })
          }
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  fetchData = body => {
    this.setState({
      loading: true
    })
    let resource = '/api/credits/list'
    const cb = json => {
      let nextState = { loading: false }
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data) {
          // change 'bonusId' to 'giftId'
          json.data.credits.forEach(c => {
            let items = c.creditsItems
            items.forEach(i => {
              if (i.bonusId) {
                i.giftId = i.bonusId
              }
            })
          })
          nextState.dataSource = json.data.credits
          nextState.total = json.data.total
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

    let { page, schoolId, giftSet } = this.props
    if (!giftSet) {
      this.props.fetchGifts()
    } else {
      // wait until giftSet === ture to fetch data.
      const body = {
        page: page,
        size: PAGINATION
      }
      if (schoolId !== 'all') {
        body.schoolId = parseInt(schoolId, 10)
      }
      this.fetchData(body)
    }
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  componentWillReceiveProps(nextProps) {
    if (!checkObject(this.props, nextProps, ['giftSet'])) {
      // wait until giftSet === ture to fetch data.
      if (nextProps.giftSet) {
        let { page, schoolId } = nextProps
        const body = {
          page: page,
          size: PAGINATION
        }
        if (schoolId !== 'all') {
          body.schoolId = parseInt(schoolId, 10)
        }
        this.fetchData(body)
      }
    }
    if (checkObject(this.props, nextProps, ['page', 'schoolId'])) {
      return
    }
    let { page, schoolId } = nextProps
    const body = {
      page: page,
      size: PAGINATION
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    this.fetchData(body)
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.props.changeGift(subModule, { page: page })
  }
  changeSchool = value => {
    let { schoolId } = this.props
    if (schoolId === value) {
      return
    }
    this.props.changeGift(subModule, { page: 1, schoolId: value })
  }

  delete = (e, id) => {
    e.preventDefault()
    let url = '/api/credits/delete'
    const body = {
      id: id
    }
    let schoolId = this.props.schoolId
    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data) {
          const body = {
            page: this.props.page,
            size: PAGINATION
          }
          if (schoolId !== 'all') {
            body.schoolId = parseInt(schoolId, 10)
          }
          this.fetchData(body)
        } else {
          Noti.hintError()
        }
      }
    }
    AjaxHandler.ajax(url, body, cb)
  }
  editCredit = (e, id) => {
    e.preventDefault()
    let editingCredit = JSON.parse(JSON.stringify(this.state.editingCredit))
    let credit = this.state.dataSource.find(c => c.id === id)
    if (credit) {
      editingCredit.schoolId = credit.schoolId
      credit.creditsItems.forEach(i => {
        let item = editingCredit.items.find(
          it => it.deviceType === i.deviceType
        )
        if (item) {
          item.credits = i.credits
          item.giftId = i.giftId
        }
      })
    }
    this.setState({
      editingCredit: editingCredit,
      showCreditCreate: true,
      editingId: id
    })
  }
  addCredit = () => {
    this.setState({
      showCreditCreate: true
    })
  }
  closeBuildCredit = () => {
    this.cancelBuildCredit()
  }
  cancelBuildCredit = () => {
    let editingCredit = JSON.parse(JSON.stringify(this.state.editingCredit))
    editingCredit.schoolId = ''
    editingCredit.emptyError = false
    editingCredit.formatError = false
    editingCredit.matchError = false
    editingCredit.existError = false
    editingCredit.items.forEach(item => {
      item.credits = ''
      item.giftId = ''
    })
    this.setState({
      showCreditCreate: false,
      editingCredit: editingCredit,
      editingId: '' // clear editingId
    })
  }
  confirmBuildCredit = () => {
    let { posting, checking } = this.state
    if (posting || checking) {
      return
    }
    let editingCredit = JSON.parse(JSON.stringify(this.state.editingCredit))
    if (!editingCredit.schoolId) {
      editingCredit.schoolError = true
      return this.setState({
        editingCredit: editingCredit
      })
    }
    // check if rules are empty
    let empty = this.checkEmpty(editingCredit)
    if (empty) {
      editingCredit.emptyError = true
      return this.setState({
        editingCredit: editingCredit
      })
    }
    let matched = this.checkMatch(editingCredit)
    if (!matched) {
      editingCredit.matchError = true
      return this.setState({
        editingCredit: editingCredit
      })
    }
    let noFormatError = this.checkFormat(editingCredit)
    if (!noFormatError) {
      editingCredit.formatError = true
      return this.setState({
        editingCredit: editingCredit
      })
    }
    let schoolId = editingCredit.schoolId
    let { editingId, dataSource } = this.state
    if (editingId) {
      let originalCredit = dataSource.find(credit => credit.id === editingId)
      if (
        originalCredit &&
        originalCredit.schoolId === editingCredit.schoolId
      ) {
        this.postCredit()
      } else {
        this.checkExist(schoolId, this.postCredit)
      }
    } else {
      this.checkExist(schoolId, this.postCredit)
    }
  }
  postCredit = () => {
    let { posting, editingId } = this.state
    if (posting) {
      return
    }
    let editingCredit = JSON.parse(JSON.stringify(this.state.editingCredit))
    let resource = '/api/credits/add'
    let body = {
      schoolId: editingCredit.schoolId,
      creditsItems: []
    }
    editingCredit.items.forEach(item => {
      if (item.credits) {
        let credits = parseInt(item.credits, 10),
          giftId = parseInt(item.giftId, 10)
        let newItem = {
          credits: credits,
          // giftId: giftId,
          bonusId: giftId, // change 'giftId' to 'bonusId' to server.
          deviceType: item.deviceType
        }
        body.creditsItems.push(newItem)
      }
    })
    if (editingId) {
      body.id = editingId
      resource = '/api/credits/update'
    }
    const cb = json => {
      this.setState({
        posting: false
      })
      if (json.data.id) {
        let { page, schoolId } = this.props
        const body = {
          page: page,
          size: PAGINATION
        }
        if (schoolId !== 'all') {
          body.schoolId = parseInt(schoolId, 10)
        }
        this.fetchData(body)
        this.closeBuildCredit()
      }
    }
    console.log(body)
    this.setState({
      posting: true
    })
    AjaxHandler.ajax(resource, body, cb, null, {
      thisObj: this,
      clearPosting: true
    })
  }
  checkEmpty = editingCredit => {
    let items = editingCredit.items
    let empty = items.every(item => {
      if (item.credits === '' && item.giftId === '') {
        return true
      }
      return false
    })
    return empty
  }
  checkFormat = editingCredit => {
    let items = editingCredit.items
    let noFormatError = items.every(item => {
      if (item.credits === '') {
        return true
      } else if (
        item.credits <= 0 ||
        item.credits.toString().indexOf('.') !== -1
      ) {
        return false
      }
      return true
    })
    return noFormatError
  }
  checkMatch = editingCredit => {
    let matched = editingCredit.items.every(item => {
      // all empty or all not empty. js has no
      if (
        (item.credits !== '' && item.giftId !== '') ||
        (item.credits === '' && item.giftId === '')
      ) {
        return true
      } else {
        return false
      }
    })
    return matched
  }
  changeEditingSchool = v => {
    let { editingId, dataSource } = this.state
    let editingCredit = JSON.parse(JSON.stringify(this.state.editingCredit))
    editingCredit.schoolId = parseInt(v, 10)
    editingCredit.schoolError = false

    // check if exist
    if (editingId) {
      let originalCredit = dataSource.find(credit => credit.id === editingId)
      if (
        originalCredit &&
        originalCredit.schoolId === editingCredit.schoolId
      ) {
      } else {
        this.checkExist(v)
      }
    } else {
      this.checkExist(v)
    }
    this.setState({
      editingCredit: editingCredit
    })
  }
  checkExist = (schoolId, callback) => {
    let { checking } = this.state
    if (checking) {
      return
    }
    let resource = '/api/credits/check'
    const body = {
      schoolId: parseInt(schoolId, 10)
    }
    const cb = json => {
      let nextState = {
        checking: false
      }
      if (json.data.result) {
        // Noti.hintWarning('', '该学校已有兑换规则！')
        let editingCredit = JSON.parse(JSON.stringify(this.state.editingCredit))
        editingCredit.existError = true
        nextState.editingCredit = editingCredit
      } else {
        if (callback) {
          callback()
        }
      }
      this.setState(nextState)
    }
    this.setState({
      checking: true
    })
    AjaxHandler.ajax(resource, body, cb, null, {
      thisObj: this,
      clearChecking: true
    })
  }
  changeEditingCredit = e => {
    let v = e.target.value
    let deviceType = e.target.getAttribute('data-devicetype')
    if (!deviceType) {
      return
    }
    let editingCredit = JSON.parse(JSON.stringify(this.state.editingCredit))
    let item = editingCredit.items.find(
      item => item.deviceType === parseInt(deviceType, 10)
    )
    if (item) {
      item.credits = v
      this.setState({
        editingCredit: editingCredit
      })
    }
  }
  checkEditingCredit = e => {
    let v = e.target.value.trim()
    let deviceType = e.target.getAttribute('data-devicetype')
    // don't show error when empty. Only check empty when confirm.
    if (!deviceType || !v) {
      return
    }
    let editingCredit = JSON.parse(JSON.stringify(this.state.editingCredit))
    let item = editingCredit.items.find(
      item => item.deviceType === parseInt(deviceType, 10)
    )
    if (item) {
      // value is trimed here, make assignment sense.
      item.credits = v
      // obviously not empty
      if (editingCredit.emptyError) {
        editingCredit.emptyError = false
      }
      // 'credit' must be positive integer
      if (v <= 0 || v.indexOf('.') !== -1) {
        editingCredit.formatError = true
      } else {
        // if all othen inputs has no format error, clear error
        let noFormatError = this.checkFormat(editingCredit)
        if (noFormatError) {
          editingCredit.formatError = false
        }
      }
      // check if editingCredit.notMatch need to be changed.
      // Only check to set matchError === true. Only set it false when confirm.
      let matched = this.checkMatch(editingCredit)
      if (matched) {
        editingCredit.matchError = false
      }
      this.setState({
        editingCredit: editingCredit
      })
    }
  }

  setGift = data => {
    let { editingDeviceType } = this.state
    let editingCredit = JSON.parse(JSON.stringify(this.state.editingCredit))
    let item = editingCredit.items.find(
      item => item.deviceType === parseInt(editingDeviceType, 10)
    )
    if (item) {
      item.giftId = data.giftId
    }
    this.setState({
      showGifts: false,
      editingCredit: editingCredit
    })
  }
  closeGiftModal = () => {
    this.setState({
      showGifts: false
    })
  }
  chooseGifts = e => {
    e.preventDefault()
    let deviceType = e.target.getAttribute('data-devicetype')
    if (deviceType) {
      let dt = parseInt(deviceType, 10),
        nextState = {
          showGifts: true,
          editingDeviceType: dt
        }
      let editingItem = this.state.editingCredit.items.find(
        credit => credit.deviceType === dt
      )
      if (editingItem && editingItem.giftId) {
        nextState.editingGiftId = editingItem.giftId
      } else {
        nextState.editingGiftId = 0
      }
      this.setState(nextState)
    }
  }
  render() {
    const {
      dataSource,
      total,
      loading,
      showCreditCreate,
      editingCredit,
      showGifts,
      editingDeviceType,
      editingGiftId
    } = this.state
    let editingSchoolId = editingCredit.schoolId ? editingCredit.schoolId : ''
    const { page, schoolId, gifts } = this.props

    // editing items in build/edit credit exchange.
    let editingItems = editingCredit.items.map((item, ind) => {
      let amount = ''
      if (item.giftId) {
        let gift = gifts.find(g => g.id === item.giftId)
        amount = gift ? gift.amount : ''
      }
      return (
        <li key={`editingCreditLi${ind}`}>
          <p style={{ width: '85px' }} key={`editingLabel${ind}`}>
            {DEVICETYPE[item.deviceType]}:
          </p>
          <span key={`editingValue${ind}`}>
            <input
              className="shortInput"
              key={`editingCredit${ind}`}
              type="number"
              value={item.credits}
              data-devicetype={item.deviceType}
              onChange={this.changeEditingCredit}
              onBlur={this.checkEditingCredit}
            />
            <span
              key={`editingCreditLabel${ind}`}
              style={{ paddingRight: '5px' }}
            >
              积分 ————
            </span>
            <span>{item.giftId ? `${amount}元红包` : '未选择'} </span>
            <a
              className="mgl10"
              href=""
              data-devicetype={item.deviceType}
              onClick={this.chooseGifts}
            >
              选择红包
            </a>
          </span>
        </li>
      )
    })

    return (
      <div className="contentArea">
        <SearchLine
          openTitle="创建积分兑换"
          openModal={this.addCredit}
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
            pagination={{ pageSize: PAGINATION, current: page, total: total }}
            dataSource={dataSource}
            columns={this.columns}
            onChange={this.changePage}
          />
        </div>

        <Modal
          wrapClassName="modal finish"
          width={700}
          title="积分兑换"
          visible={showCreditCreate}
          onCancel={this.cancelBuildCredit}
          footer={null}
          okText=""
        >
          <div className="info">
            <ul>
              <li>
                <p style={{ width: '85px' }}>选择学校:</p>
                <SchoolSelectorWithoutAll
                  selectedSchool={editingSchoolId}
                  changeSchool={this.changeEditingSchool}
                />
                {editingCredit.schoolError ? (
                  <span className="checkInvalid">学校不能为空！</span>
                ) : null}
                {editingCredit.existError ? (
                  <span className="checkInvalid">该学校已设置兑换规则！</span>
                ) : null}
              </li>
              {editingItems}
              <li>
                {editingCredit.formatError ? (
                  <span className="checkInvalid">
                    积分必须为正整数,代金券必须为正数！
                  </span>
                ) : null}
                {editingCredit.matchError ? (
                  <span className="checkInvalid">积分和代金券需同时设置！</span>
                ) : null}
                {editingCredit.emptyError ? (
                  <span className="checkInvalid">兑换规则不能为空！</span>
                ) : null}
              </li>
            </ul>
            <div className="btnArea">
              <Button onClick={this.confirmBuildCredit} type="primary">
                确认
              </Button>
              <Button onClick={this.cancelBuildCredit}>返回</Button>
            </div>
          </div>
        </Modal>

        <GiftTable
          closeModal={this.closeGiftModal}
          setGift={this.setGift}
          showModal={showGifts}
          confirm={this.confirmSetGift}
          gifts={JSON.parse(JSON.stringify(gifts))}
          deviceType={editingDeviceType}
          selectedGiftId={editingGiftId}
        />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  schoolId: state.changeGift[subModule].schoolId,
  page: state.changeGift[subModule].page,
  giftSet: state.setGifts.giftSet,
  gifts: state.setGifts.gifts
})

export default withRouter(
  connect(mapStateToProps, {
    changeGift,
    fetchGifts
  })(CreditExchange)
)
