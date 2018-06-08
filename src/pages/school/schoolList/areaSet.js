import React from 'react'
import { Button, Popconfirm } from 'antd'
import AddPlusAbs from '../../component/addPlusAbs'
import { removeArray } from '../../../util/copy'
import { areaService } from '../../service/index'
// import BuildingMultiSelectModal from '../../component/buildingMultiSelectModal'
import MultiSelectModal from '../../component/multiSelectModal'
const Fragment = React.Fragment
class AreaManage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      areaList: [
        {
          id: 1,
          name: '区域一',
          buildings: [
            {
              id: 1,
              name: '楼栋一',
              selected: true
            }
          ]
        }
      ],
      posting: false,
      buildingIds: [],
      areaIndex: [],
      showBuildingSelect: false,
      buildingScore: [
        {
          id: 2,
          name: '楼栋二',
          selected: false
        },
        {
          id: 3,
          name: '楼栋三',
          selected: false
        }
      ]
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
  checkAreaName = (e, i) => {
    const value = e.target.value.trim()
    const areaList = JSON.parse(JSON.stringify(this.state.areaList))
    if (value) {
      areaList[i].error = false
    } else {
      areaList[i].error = true
    }
    this.setState({
      areaList
    })
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
  cancel() {
    //do nothing
  }
  /**
   * 获取区域名
   */
  getBuildingName = buildings => {
    const buildingNames = buildings && buildings.map(b => b.name).join('、')
    return buildingNames
  }
  showBuildingSelect = index => {
    const { areaList, buildingScore } = this.state
    buildingScore.push(...areaList[index].buildings)
    this.setState({
      showBuildingSelect: true,
      areaIndex: index,
      buildingScore
    })
  }
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
    this.setState({
      showBuildingSelect: false,
      buildingScore: dataSource,
      areaList: areaList
    })
  }
  closeBuildingSelect = () => {
    const { buildingScore } = this.state
    if (buildingScore.length > 0) {
      removeArray(buildingScore, build => build.selected)
    }
    this.setState({
      showBuildingSelect: false,
      buildingScore
    })
  }
  handleSubmit() {}
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
        {/* {showBuildingSelect ? (
          <BuildingMultiSelectModal
            all={buildingIds === 'all'}
            selectedItems={buildingIds !== 'all' ? buildingIds : []}
            schoolId={schoolId}
            closeModal={this.closeBuildingSelect}
            confirmBuildings={this.confirmBuildings}
          />
        ) : null} */}
      </div>
    )
  }
}

export default AreaManage
