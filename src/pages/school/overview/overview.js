import React from 'react'
import {Table, Input, Icon} from 'antd'
import AjaxHandler from '../../ajax'
import Noti from '../../noti'
import Time from '../../component/time'
import Format from '../../component/format'
import CONSTANTS from '../../component/constants'
import SearchLine from '../../component/searchLine'
import SchoolSelector from '../../component/schoolSelector'
const TextArea = Input.TextArea
const SIZE = 4

class EditableCell extends React.Component {
  state = {
    value: this.props.value,
    editable: false,
    ti: null
  }
  handleChange = (e) => {
    const value = e.target.value;
    this.setState({ value });
    /* post the data to server */
  }
  check = () => {
    if (this.ti) {
      clearTimeout(this.ti)
      this.ti = null
    }
    let v = this.state.value
    this.setState({ 
      editable: false,
      value: this.props.value 
    });
    if (this.props.onChange) {
      this.props.onChange(v);
    }
  }
  edit = () => {
    if (!this.state.editable) {
      this.setState({ editable: true });
    }
  }
  closeEdit = () => {
    if (this.state.editable) {
      this.setState({
        editable: false,
        value: this.props.value
      })
    }
  }
  componentDidUpdate(){
    if (this.refs.input) {
      this.refs.input.focus()
    }
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.value !== this.state.value) {
      this.state.value = nextProps.value
    }
  }
  cancel = (e) => {
    this.ti = setTimeout(this.closeEdit, 200)
  }
  pressEnter = (e) => {
    let key = e.key
    if (key.toLowerCase() === 'enter') {
      this.check()
    }
  }
  render() {
    const { value, editable } = this.state;
    return (
      <div className="editableCell" onClick={this.edit} onBlur={this.cancel}>
        {
          editable ?
            <div className="inputWrapper">
              <textarea ref='input' className='remarkTA' value={value} 
                  onKeyDown={this.pressEnter}  onChange={this.handleChange} />
              <Icon
                type="check"
                className="inputCheck"
                onClick={this.check}
              />
            </div>
            :
            <div className="textWrapper">
              {value || ' '}
            </div>
        }
      </div>
    );
  }
}


class Overview extends React.Component {
  constructor (props) {
    super(props)
    // request for schools list
    const dataSource = []
    let page = 1, total = 0, loading = true, selectedSchool = 'all'
    this.state = {
      dataSource,
      page,
      total,
      loading,
      selectedSchool,
      namePrefix: ''
    }

    const deviceHeader = (
      <div className='deviceHeader'>
        <p>设备</p>
        <p>供应商</p>
        <p>费率</p>
        <p>供水时段</p>
      </div>
    )

    this.columns = [
      {
        title: <div className='pad10'>学校名称</div>, dataIndex: 'name',
        className: 'schoolName',
        render: (text) => {
          return <div className='pad10'>{text}</div>
        }
      }, 
      {
        title: <div className='pad10'>注册用户</div>, dataIndex: 'registerAmount',
        className: 'userCount',
        render: (text) => {
          return <div className='pad10'>{text}</div>
        }
      }, 
      {
        title: deviceHeader, dataIndex: 'devices',
        className: 'deviceWrapper',
        render: (text, record, index) => {
          let deviceContent
          if (record.devices){
            deviceContent = record.devices&&record.devices.map((r, i) => {
              let supplierItems = r.suppliers&&r.suppliers.map((rec, ind) => {
                return (
                  <div key={`suppliers-${ind}`} className='supplierItem'>
                    <div key={`supplierName-${ind}`} className='supplierName'>{rec.name}</div>
                  </div>
                )
              })

              let rateGroups = r.rate&&r.rate.rateGroups&&r.rate.rateGroups.map((rate, x) => (
                <div className='rateItem' key={`rateItem-${x}`}>{rate.price * 100}分钱/{rate.pulse}脉冲</div>
              ))

              let waterTimeItems =r.waterTimeRange&&r.waterTimeRange.items&&r.waterTimeRange.items.map((range, y) => (
                <div key={`range-${y}`} className='waterTimeRange'>{Format.rangeToHour(range)}</div>
              ))

              const backupSupplier = (
                  <div className='supplierItem'>
                    <div className='supplierName'>暂无</div>
                  </div>
              )

              return (
                <div key={`device-${i}`} className='deviceItem'>
                  <div key={`devicename-${i}`} className='deviceTypeWrapper'>{CONSTANTS.DEVICETYPE[r.type]}</div>
                  <div key={`suppliersInfo-${i}`} className='supplierWrapper'>{supplierItems || backupSupplier}</div>
                  <div key={`rateInfo-${i}`} className='rateGroupsWrapper'>{rateGroups || '暂无'}</div>
                  <div key={`waterTime-${i}`} className='waterItemsWrapper'>{waterTimeItems || '暂无'}</div>
                </div>
              )
            })
          } else {
            deviceContent = (
              <div className='deviceItem'>
                <div className='deviceTypeWrapper'>暂无</div>
                <div className='supplierWrapper'>
                  <div className='supplierItem'>
                    <div className='supplierName'>暂无</div>
                    <div className='rateGroups'>暂无</div>
                  </div>
                </div>
                <div className='waterWrapper'>暂无</div>
              </div>
            )
          }
          const child = (
            <div className='deviceContent'>
              {deviceContent}
            </div>
          )
          return {
            children: child,
            props: {
              colSpan: 4
            }
          }
        }
      },
      {
        title: <p className='pad10'>维修员</p>, dataIndex: 'repairmans', 
        className: 'repairmans',
        render: (text, record, index) => {
          if (!record.repairmans.length) {
            return (
              <div className='pad10'>暂无</div>
            )
          }
          let mans = record.repairmans&&record.repairmans.map((r, i) => (
            <div key={`repairman-${i}`} className='repairmanItem'>
              <p key={`repairmanName-${i}`}>{r.username}</p>
              <p key={`repairmanMobile=${i}`}>({r.mobile})</p>
            </div>
          ))
          return (
            <div className='pad10'>
              {mans}
            </div>
          )
        }
      },
      {
        title: <p className='pad10'>当前红包活动</p>, dataIndex: 'bonusActivity',
        className: 'bonusAct',
        render: (text, record, index) => {
          if (!record.bonusActivity) {
            return (
              <div className='pad10'>暂无</div>
            )
          }
          let bonus = record.bonusActivity&&record.bonusActivity.map((r, i) => {
            let gifts = record.bonusActivity.gifts&&record.bonusActivity.gifts.map((r, i) => (
              <span key={`giftName-${i}`}>{r.amount}元红包/</span>
            ))
            return (
              <div key={`bonus-${i}`}>
                <p key={`bonusType-${i}`}>{CONSTANTS.BONUSACTTYPE[r.type]}</p>
                <span key={`bonusNameRelease-${i}`}>({gifts}{CONSTANTS.RELEASEMETHOD[r.releaseMethod]},</span>
                <span key={`bonusEndTime-${i}`}>截止日期{Time.getDayFormat(r.endTime)})</span>
              </div>
            )
          })
          return (
            <div key='bonusAct-${index}' className='bonusActs pad10'>
              {bonus}
            </div>
          )
        }
      },
      {
        title: <p className='pad10'>当前充值活动</p>, dataIndex: 'depositActivity', 
        className: 'depositAct',
        render: (text, record, index) => {
          let act = record.depositActivity, str
          if (!act) {
            return (
              <div className='pad10'>暂无</div>
            )
          }
          if (act.type === 1) {
            str = act.items&&act.items.map((r, i) => {
              return (
                <p key={`real-${i}`}>{r.denomination}元面额实际充值{r.realAmount}元</p>
              )
            })
          } else {
            str = act.items&&act.items.map((r, i) => {
              let gifts = r.gifts&&r.gifts.map((rec, ind) => {
                return `${rec.value}元红包,`
              })
              return (
                <p key={`gift-${i}`}>
                  充值{r.denomination}元送{gifts}
                </p>
              )
            })
          }
          return (
            <div className='pad10'>
              <p>{CONSTANTS.DEPOSITACTTYPE[act.type]}</p>
              <p>{str}</p>
            </div>
          )
        }
      },
      {
        title: <p className='pad10'>提现时间</p>, dataIndex: 'withdrawTimeRange', 
        className: 'withdrawTime',
        render: (text, r, index) => {
          let record = r.withdrawTimeRange, result
          if (!record) {
            result = '暂无'
          } else if (record.type === 1) {
            result = (
              <span>每周{CONSTANTS.WEEKDAYS[record.fixedTime.startTime.weekday]}{Format.hourMinute(record.fixedTime.startTime.time)}~每周{CONSTANTS.WEEKDAYS[record.fixedTime.endTime.weekday]}{Format.hourMinute(record.fixedTime.endTime.time)}</span>
            )
          } else {
            result = (
              <span>{Time.getDayFormat(record.specificTime.startTime)}~{Time.getDayFormat(record.specificTime.endTime)}</span>
            )
          }
          return (
            <div className='pad10'>
              {result}
            </div>
          )
        }
      },
      {
        title: <p className='pad10'>当前公告信息</p>, dataIndex: 'notify',
        className: 'notify',
        render: (text) => {
          return (
            <div className='pad10'>
              {text || '暂无'}
            </div>
          )
        }
      },
      {
        title: <p className='pad10'>备注信息</p>, 
        dataIndex: 'remark',
        className: 'remark',
        render: (text, record) => {
          return (
            <div className='remarkInput'>
              <EditableCell
                value={text}
                onChange={this.onCellChange(record.id, 'remark')}
              />
            </div>
          )
        }
      }
    ]
  }

  onCellChange = (id, dataIndex) => {
    return (value) => {
      const dataSource = [...this.state.dataSource];
      const target = dataSource.find(item => item.id=== id);
      if (target) {
        this.postRemarks(id, value)
      }
    }
  }
  postRemarks = (id, v) => {
    let resource = '/school/save'
    const body = {
      id: id,
      remark: v
    }
    const cb = (json) => {
      if (json.error) {
        throw {
          title: '请求出错',
          message: json.error.displayMessage || '网络错误，请稍后重试'
        }
      } else {
        if (json.data.id) {
          const dataSource = JSON.parse(JSON.stringify(this.state.dataSource));
          const target = dataSource.find(item => item.id=== id);
          target.remark = v
          this.setState({
            dataSource: dataSource
          })
        } else {
          throw {
            title: '请求出错',
            message: '网络错误，请稍后重试'
          }
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  fetchData = (body) => {
    let resource = '/school/full/list'
    const cb = (json) => {
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
          /*--------redirect --------*/
          if(json.data){
            const ds = json.data.schools.map((record,index) => {
              record.key = record.id
              return record
            })
            this.setState({
              dataSource:ds,
              total: json.data.total,
              loading: false
            })
          }          
        }
    }
    AjaxHandler.ajax(resource, body, cb) 
  }
  componentDidMount(){
    this.props.hide(false)
    /*-----------fetch data-----------*/
    const body = {
      page: 1,
      size: SIZE
    }
    this.fetchData(body)
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  changeTable = (pageObj) => {
    let page = pageObj.current
    this.setState({
      page: page,
      loading: true
    })
    const body = {
      page: page,
      size: SIZE
    }
    this.fetchData(body)
  }
  changeSchool = (v, name) => {
    let nextState = {selectedSchool: v, page: 1, loading: true, namePrefix: ''}

    const body ={
      page: 1,
      size: SIZE
    }

    if(v !== 'all'){
      body.namePrefix = name
    }
    this.fetchData(body)
    this.setState(nextState)
  }

  render () {
    const {dataSource, loading, total, page, selectedSchool} = this.state
    
    return (
      <div className='contentArea'>
        <SearchLine 
          selector1={<SchoolSelector selectedSchool={selectedSchool} changeSchool={this.changeSchool} />}
        />

        <div className='tableList'>
          <Table 
            bordered 
            loading={loading}
            pagination={{total: total, pageSize: SIZE, current: page}} 
            rowClassName={() => ('schoolRow')} 
            dataSource={dataSource} 
            columns={this.columns} 
            onChange={this.changeTable}
            className='schoolOverview'
          />
        </div>

      </div>
    )
  }
}

export default Overview
