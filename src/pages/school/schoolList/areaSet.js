import React from 'react'
import { Button, Popconfirm } from 'antd'
import AddPlusAbs from '../../component/addPlusAbs'
import { removeArray, deepCopy } from '../../../util/copy'
import { areaService } from '../../service/index'
import Noti from '../../../util/noti'
// import BuildingMultiSelectModal from '../../component/buildingMultiSelectModal'
import MultiSelectModal from '../../component/multiSelectModal'
const Fragment = React.Fragment
class AreaManage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      areaList: [{ name: '', buildings: [] }],
      posting: false,
      buildingIds: [],
      areaIndex: [],
      showBuildingSelect: false,
      buildingScore: []
    }
    this.buildColumns = [
      {
        title: '楼栋名称',
        width: '75%',
        dataIndex: 'name'
      }
    ]
  }
  componentDidMount() {
    this.props.hide(false)
    const data = this.props.location.state
    const { schoolId, schoolName } = data
    const nextProps = {
      schoolId,
      schoolName
    }
    this.setState(nextProps)
    const body = {
      schoolId
    }
    this.fetchAreaData(body)
    this.fetchBuildData(body)
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  /**
   * 获取区域数据
   */
  fetchAreaData = body => {
    areaService.getAreaData(body).then(json => {
      if (json && json.data) {
        const areaList =
          json.data.areas &&
          json.data.areas.map(area => {
            const { id, name, buildings } = area
            buildings.forEach(build => {
              build.selected = true
            })
            return {
              id,
              name,
              buildings
            }
          })
        this.setState({
          areaList: areaList ? areaList : [{ name: '', buildings: [] }]
        })
      }
    })
  }
  /**
   * 获取未绑定的楼栋
   */
  fetchBuildData = body => {
    areaService.getUnbindBuildings(body).then(json => {
      if (json && json.data) {
        const buildings = json.data.buildings || []
        this.setState({
          buildingScore: buildings
        })
      }
    })
  }
  /**
   * 检测区域名
   */
  checkAreaName = (e, i) => {
    const value = e.target.value.trim()
    const areaList = JSON.parse(JSON.stringify(this.state.areaList))
    if (value) {
      const body = {
        schoolId: this.state.schoolId,
        name: value
      }
      if (areaList[i].id) {
        body.id = areaList[i].id
      }
      areaService.checkArea(body).then(json => {
        if (json && json.data) {
          if (!json.data.result) {
            areaList[i].error = false
          } else {
            areaList[i].error = true
            // Noti.hintLock('操作失败', json.data.failReason)
          }
        } else {
          areaList[i].error = true
        }
        this.setState({
          areaList
        })
      })
    } else {
      areaList[i].error = true
      this.setState({
        areaList
      })
    }
  }
  /**
   * 修改区域名
   */
  changeAreaName = (e, i) => {
    const areaList = JSON.parse(JSON.stringify(this.state.areaList))
    areaList[i].name = e.target.value
    this.setState({
      areaList: areaList
    })
  }
  /**
   * 添加区域
   */
  addArea = e => {
    const areaList = JSON.parse(JSON.stringify(this.state.areaList))
    areaList.push({ name: '', buildings: [] })
    this.setState({
      areaList: areaList
    })
  }
  /**
   * 删除区域
   */
  abstractArea = e => {
    const areaList = JSON.parse(JSON.stringify(this.state.areaList))
    const buildings =
      areaList[areaList.length - 1].buildings &&
      areaList[areaList.length - 1].buildings.map(value => {
        value.selected = false
        return value
      })
    areaList.pop()
    const { buildingScore } = this.state
    buildingScore.push(...buildings)
    this.setState({
      areaList: areaList,
      buildingScore
    })
  }
  cancel = () => {}
  cancelSubmit = () => {
    this.props.history.goBack()
  }
  /**
   * 获取区域名
   */
  getBuildingName = buildings => {
    const buildingNames = buildings && buildings.map(b => b.name).join('、')
    return buildingNames
  }
  /**
   * 显示楼栋选择
   */
  showBuildingSelect = index => {
    const { areaList, buildingScore } = this.state
    buildingScore.push(...areaList[index].buildings)
    this.setState({
      showBuildingSelect: true,
      areaIndex: index,
      buildingScore
    })
  }
  /**
   * 选择楼栋
   */
  confirmBuildings = dataSource => {
    let buildings = []
    if (dataSource.length > 0) {
      dataSource.forEach((build, index) => {
        if (build.selected) {
          buildings.push(build)
        }
      })
      removeArray(dataSource, build => build.selected)
    }
    const areaList = JSON.parse(JSON.stringify(this.state.areaList))
    const { areaIndex } = this.state
    areaList[areaIndex].buildings = buildings
    if (buildings.length < 1) {
      areaList[areaIndex].blockError = true
    } else {
      areaList[areaIndex].blockError = false
    }
    this.setState({
      showBuildingSelect: false,
      buildingScore: dataSource,
      areaList: areaList
    })
  }
  /**
   * 关闭楼栋多选
   */
  closeBuildingSelect = () => {
    const { buildingScore } = this.state
    if (buildingScore.length > 0) {
      removeArray(buildingScore, build => build.selected)
    }
    const areaList = JSON.parse(JSON.stringify(this.state.areaList))
    const { areaIndex } = this.state
    const buildings = areaList[areaIndex].buildings || []
    if (buildings.length < 1) {
      areaList[areaIndex].blockError = true
    } else {
      areaList[areaIndex].blockError = false
    }
    this.setState({
      showBuildingSelect: false,
      buildingScore,
      areaList: areaList
    })
  }
  /**
   * 提交修改
   */
  handleSubmit = () => {
    if (this.checkAllArea()) {
      let { areaList } = this.state
      if (areaList && areaList.length) {
        areaList.forEach(val => {
          delete val.blockError
          delete val.error
          val.residenceIdList = []
          if (val.buildings) {
            val.buildings.forEach(build => {
              delete build.selected
              val.residenceIdList.push(build.id)
            })
          }
          delete val.buildings
        })
      }
      const body = {
        schoolId: this.state.schoolId,
        areaList: areaList
      }
      areaService.submitArea(body).then(json => {
        if (json && json.data) {
          if (json.data.result) {
            Noti.hintOk('操作成功', '编辑成功')
          } else {
            Noti.hintLock('操作失败', json.data.failReason)
          }
        }
        this.props.history.goBack()
      })
    }
  }
  /**
   * 检测区域信息
   */
  checkAllArea = () => {
    const areaList = deepCopy(this.state.areaList)
    let result = true
    if (areaList && areaList.length) {
      areaList.forEach(val => {
        if (!val.name || val.error) {
          val.error = true
          result = false
        }
        if (!val.buildings || val.buildings.length < 1) {
          val.blockError = true
          result = false
        }
      })
    }
    this.setState({
      areaList
    })
    return result
  }
  render() {
    const {
      schoolName,
      posting,
      areaList,
      showBuildingSelect,
      buildingScore
    } = this.state
    const areaItems =
      areaList &&
      areaList.map((r, i) => {
        return (
          <Fragment key={i}>
            <li>
              <p>区域名称:</p>
              <input
                onChange={e => {
                  this.changeAreaName(e, i)
                }}
                key={`input${i}`}
                onBlur={e => {
                  this.checkAreaName(e, i)
                }}
                value={r.name ? r.name : ''}
              />
              {r.error ? (
                <span key={`error${i}`} className="checkInvalid">
                  区域名称输入不正确
                </span>
              ) : null}
            </li>
            <li>
              <p>选中楼栋:</p>
              {this.getBuildingName(r.buildings)}
              <a
                style={{ marginLeft: '10px' }}
                onClick={() => {
                  this.showBuildingSelect(i)
                }}
              >
                选择楼栋
              </a>
              {r.blockError ? (
                <span key={`blockError${i}`} className="checkInvalid">
                  请选择楼栋
                </span>
              ) : null}
            </li>
          </Fragment>
        )
      })
    return (
      <div className="infoList rateInfo">
        <ul>
          <li>
            <p>学校名称:</p>
            {schoolName}
          </li>

          <Fragment>
            <Fragment>{areaItems}</Fragment>
            <li>
              <p />
              <AddPlusAbs
                count={areaList.length}
                add={this.addArea}
                abstract={this.abstractArea}
              />
            </li>
          </Fragment>
        </ul>
        <div className="btnArea">
          {posting ? (
            <Button type="primary">确认</Button>
          ) : (
            <Popconfirm
              title="确定要提交么?"
              onConfirm={this.handleSubmit}
              onCancel={this.cancel}
              okText="确认"
              cancelText="取消"
            >
              <Button type="primary">确认</Button>
            </Popconfirm>
          )}
          <Button onClick={this.cancelSubmit}>返回</Button>
        </div>
        <MultiSelectModal
          closeModal={this.closeBuildingSelect}
          confirm={this.confirmBuildings}
          show={showBuildingSelect}
          dataSource={buildingScore}
          columns={this.buildColumns}
          suportAllChoose={true}
        />
      </div>
    )
  }
}

export default AreaManage
