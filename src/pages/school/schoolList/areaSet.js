import React from 'react'
import { Button, Popconfirm } from 'antd'
import AddPlusAbs from '../../component/addPlusAbs'
// import BuildingMultiSelectModal from '../../component/buildingMultiSelectModal'
import MultiSelectModal from '../../component/multiSelectModal'
const Fragment = React.Fragment
class AreaManage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      areaList: [{}],
      posting: false,
      buildingIds: [],
      areaIndex: [],
      showBuildingSelect: false,
      buildingScore: [
        {
          id: 1,
          name: '楼栋一',
          selected: false
        }
      ]
    }
    this.buildColumns = [
      {
        title: <p>楼栋名称</p>,
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
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  changeAreaName = (e, i) => {
    const areaList = JSON.parse(JSON.stringify(this.state.areaList))
    areaList[i].value = e.target.value
    this.setState({
      areaList: areaList
    })
  }
  changeAreaBlock = (e, i) => {
    const areaList = JSON.parse(JSON.stringify(this.state.areaList))
    areaList[i].block = e.target.value
    this.setState({
      areaList: areaList
    })
  }
  addArea = e => {
    const areaList = JSON.parse(JSON.stringify(this.state.areaList))
    areaList.push({})
    this.setState({
      areaList: areaList
    })
  }
  abstractArea = e => {
    const areaList = JSON.parse(JSON.stringify(this.state.areaList))
    areaList.pop()
    this.setState({
      areaList: areaList
    })
  }
  cancel() {
    //do nothing
  }
  getBuildingName = buildingIds => {
    const { buildingsOfSchoolId } = this.props
    const { schoolId } = this.state
    const buildingNames =
      buildingIds === 'all'
        ? '全部楼栋'
        : buildingIds &&
          buildingIds
            .map(
              b =>
                buildingsOfSchoolId[+schoolId] &&
                buildingsOfSchoolId[+schoolId].find(bs => bs.id === b) &&
                buildingsOfSchoolId[+schoolId].find(bs => bs.id === b).name
            )
            .join('、')
    return buildingNames
  }
  showBuildingSelect = index => {
    const { areaList } = this.state
    debugger
    this.setState({
      showBuildingSelect: true,
      areaIndex: index
    })
  }
  confirmBuildings = ({ all, dataSource }) => {
    let buildingIds = all
      ? 'all'
      : dataSource.filter(d => d.selected === true).map(d => d.id)
    const areaList = JSON.parse(JSON.stringify(this.state.areaList))
    const { areaIndex } = this.state
    areaList[areaIndex].buildingIds = buildingIds
    this.setState({
      showBuildingSelect: false,
      buildingIds: buildingIds,
      areaList: areaList
    })
  }
  closeBuildingSelect = () => {
    this.setState({
      showBuildingSelect: false
    })
  }
  handleSubmit() {}
  render() {
    const {
      schoolName,
      schoolId,
      posting,
      areaList,
      showBuildingSelect,
      buildingIds,
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
                value={r.value ? r.value : ''}
              />
            </li>
            <li>
              <p>选中楼栋:</p>
              {this.getBuildingName(r.buildingIds)}
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
