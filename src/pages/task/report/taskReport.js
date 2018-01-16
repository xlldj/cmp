import React from 'react';
import { Table, Button } from 'antd';

import RangeSelect from '../../component/rangeSelect';
import SearchInput from '../../component/searchInput.js';
import Time from '../../component/time';
import AjaxHandler from '../../ajax';
import CONSTANTS from '../../component/constants';
import SchoolSelector from '../../component/schoolSelector';
import BasicSelectorWithoutAll from '../../component/basicSelectorWithoutAll';
import CheckSelect from '../../component/checkSelect';
import { checkObject } from '../../util/checkSame';
// import ReportDetail from './reportDetail';
import selectedImg from '../../assets/selected.png';
import Noti from '../../noti';
import notworking from '../../assets/notworking.jpg';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { changeTask, setUserInfo } from '../../../actions';
const subModule = 'report';
const {
  SIZE,
  REPORT_CATE_SUM,
  REPORT_CATE_COMPLAINT,
  REPORT_CATE_ASSESS
} = CONSTANTS;

const classLevel = {
  1: '',
  2: 'yellowfc',
  3: 'red'
};

const TIMERANGESELECTS = {
  0: {
    0: '不限',
    1: '今日',
    3: '近7天',
    6: '超过1天',
    7: '超过2天',
    8: '超过5天'
  },
  1: {
    0: '不限',
    1: '今日',
    3: '近7天',
    6: '超过1天',
    7: '超过2天',
    8: '超过5天'
  },
  2: {
    1: '今日',
    2: '近3天',
    3: '近7天',
    4: '近14天',
    5: '近30天'
  }
};
const TIMELABEL = {
  0: '等待时间',
  1: '等待时间',
  2: '完结时间'
};

const TASKTYPES = {
  1: '不限',
  2: '报修',
  3: '账单投诉',
  4: '意见反馈'
};
const TARGETS = {
  1: '我的任务',
  2: '所有客服任务'
};
const ALLTAG = {
  1: false,
  2: true
};
const STATUS_LIST = {
  0: [CONSTANTS.TASK_PENDING],
  1: [CONSTANTS.TASK_ASSIGNED, CONSTANTS.TASK_ACCEPTED, CONSTANTS.TASK_REFUSED],
  2: [CONSTANTS.TASK_FINISHED]
};

/*------后端接受的all为true/false,必传，post之前将0，1转为true/false---------*/
/*------后端接受的pending为int，不传为所有，我用0表示不传---------------------*/
/*------rule表示顺序或倒序，1为倒序，默认值----------------------------------*/
/*------sourcetype不传表示所有，我用0代替，1为体现，2为维修-------------------*/

class TaskList extends React.Component {
  static propTypes = {
    taskList: PropTypes.object.isRequired,
    forbiddenStatus: PropTypes.object.isRequired
  };
  constructor(props) {
    super(props);
    let dataSource = [];
    this.state = {
      dataSource,
      loading: false,
      total: 0,
      startTime: '',
      endTime: '',
      searchingText: '',
      showBuild: false
    };
    this.needUpdate = false;
  }

  // fetch task/list
  fetchReports = (resource, body, cate) => {
    const cb = json => {
      let nextState = {
        loading: false
      };
      let {
        mainCate,
        panel_total,
        showDetail,
        selectedDetailId,
        selectedRowIndex
      } = this.props[subModule];
      let data = {};
      if (cate === REPORT_CATE_SUM) {
        data = json.data.workReports;
      } else if (cate === REPORT_CATE_ASSESS) {
        data = json.data.workAssesses;
      } else if (cate === REPORT_CATE_COMPLAINT) {
        data = json.data.tags;
      }
      nextState.dataSource = data;
      this.setState(nextState);
    };
    this.setState({
      loading: true
    });
    AjaxHandler.ajax(resource, body, cb, null, {
      clearLoading: true,
      thisObj: this
    });
  };
  fetchData = body => {
    let resource = '/api/work/sheet/list';
    const cb = json => {
      /* set a timer of 5 minutes, fetch the data again when timer fires */
      if (this.ti) {
        clearTimeout(this.ti);
        this.ti = null;
      }
      this.ti = setTimeout(this.refetch, 5 * 60 * 1000);

      let nextState = {};
      if (json.error) {
        throw new Error(json.error);
      } else {
        let workSheets = json.data.workSheets;
        nextState.dataSource = workSheets;
        nextState.total = json.data.total;
      }
      this.setState(nextState);
    };
    AjaxHandler.ajax(resource, body, cb);
  };
  refetch = () => {
    let { all, assigned, sourceType, pending, page, schoolId } = this.props;
    const body = {
      page: page,
      size: SIZE,
      assigned: assigned
    };
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10);
    }
    if (all === '1') {
      body.all = false;
    } else {
      body.all = true;
    }
    if (pending !== 'all') {
      body.pending = parseInt(pending, 10);
    }
    if (sourceType !== 'all') {
      body.sourceType = parseInt(sourceType, 10);
    }
    this.fetchData(body);
  };
  componentDidMount() {
    this.props.hide(false);
    let {
      mainCate,
      schoolId,
      panel_rangeIndex,
      panel_startTime,
      panel_endTime,
      panel_page,
      assess_dim
    } = this.props[subModule];
    let page = panel_page[mainCate];
    let startTime = panel_startTime[mainCate],
      endTime = panel_endTime[mainCate],
      day = panel_rangeIndex[mainCate];
    const body = {
      page: page,
      size: SIZE
    };
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10);
    }
    if (day !== 0) {
      // 0 means selected startTime and endTime
      body.day = day;
    }
    if (startTime && endTime) {
      body.startTime = startTime;
      body.endTime = endTime;
    }

    let resource = '/work/condition/list';
    if (mainCate === REPORT_CATE_ASSESS) {
      resource = '/work/condition/assess/list';
      body.type = assess_dim;
    } else if (mainCate === REPORT_CATE_COMPLAINT) {
      resource = '/complaint/tag/list';
    }

    this.fetchReports(resource, body, mainCate);

    // set startTime and endTime if props has no-empty value
    if (panel_startTime[mainCate] && panel_endTime[mainCate]) {
      this.setState({
        startTime: panel_startTime[mainCate],
        endTime: panel_endTime[mainCate]
      });
    }

    // add click event
    let root = document.getElementById('root');
    root.addEventListener('click', this.closeDetail, false);
  }
  closeDetail = e => {
    // e.preventDefault()
    // e.stopPropagation()
    console.log('happen');
    let target = e.target;
    let detailWrapper = this.refs.detailWrapper;
    if (detailWrapper.contains(target)) {
      console.log('contain');
      return;
    }
    if (this.props[subModule].showDetail) {
      this.props.changeTask(subModule, {
        showDetail: false,
        selectedRowIndex: -1,
        selectedDetailId: -1,
        details: {}
      });
    }
  };
  componentWillUnmount() {
    this.props.hide(true);
    let root = document.getElementById('root');
    root.removeEventListener('click', this.closeDetail, false);
  }
  componentWillReceiveProps(nextProps) {
    /* distinguish data fetch of 'list' from 'detail' , or else it will cause mutual chaos. */
    try {
      let {
        mainCate,
        schoolId,
        main_mine,
        panel_rangeIndex,
        panel_startTime,
        panel_endTime,
        panel_type,
        panel_selectKey,
        panel_page,
        panel_dataSource
      } = nextProps.taskList;

      // update state.startTime to props.startTime
      let { startTime, endTime } = this.state,
        nextState = {};
      nextState.searchingText = panel_selectKey[mainCate];
      if (startTime !== panel_startTime[mainCate]) {
        nextState.startTime = panel_startTime[mainCate];
      }
      if (endTime !== panel_endTime[mainCate]) {
        nextState.endTime = panel_endTime[mainCate];
      }
      this.setState(nextState);

      // First, check these props to determine if to check exist.
      // Second, check if needed data exist, determine if to fetch list data.
      // need to check 'showDetail' because if finish or transfer task, will clear all dataSource.
      if (
        !checkObject(this.props[subModule], nextProps.taskList, [
          'mainCate',
          'schoolId',
          'main_mine',
          'panel_rangeIndex',
          'panel_startTime',
          'panel_endTime',
          'panel_type',
          'panel_selectKey',
          'panel_page'
        ]) ||
        !panel_dataSource[mainCate]
      ) {
        // fetch the data
        let type = panel_type[mainCate];
        let page = panel_page[mainCate];
        let day = panel_rangeIndex[mainCate];
        const body = {
          page: page,
          size: SIZE,
          all: ALLTAG[main_mine],
          statusList: STATUS_LIST[mainCate]
        };
        if (schoolId !== 'all') {
          body.schoolId = parseInt(schoolId, 10);
        }
        if (day !== 0) {
          body.day = day;
        }
        if (startTime && endTime) {
          body.startTime = startTime;
          body.endTime = endTime;
        }
        if (panel_selectKey[mainCate]) {
          body.selectKey = panel_selectKey[mainCate];
        }
        if (type !== 1) {
          body.type = type - 1;
        }
        this.fetchTasks(body);
      }

      // Check if fetch detail data. If these props change, need to check.
      /*
      if (showDetail && !checkObject(this.props[subModule], nextProps.taskList, ['selectedRowIndex'])) {
        let selectedItem = panel_dataSource[mainCate] && panel_dataSource[mainCate][selectedRowIndex] // selected row
        let id = ''
        if (selectedItem) { // should always be true, or else it can't be clicked.
        console.log(selectedItem)
          id = selectedItem.id
          console.log(id)
          if (details[id]) { 
            // if loading, toggle it
            if (detailLoading) {
              this.props.changeTask(subModule, {
                detailLoading: false
              })
            }
          } else {
            // fetch the detail
            const body = {
              id: id
            }
            this.fetchTaskDetail(body)
            if (!detailLoading) {
              this.props.changeTask(subModule, {
                detailLoading: true
              })
            }
          }
        }
      }
      */
      this.props = nextProps;
    } catch (e) {
      console.log(e);
    }
  }

  // fetch task/one
  fetchTaskDetail = body => {
    let resource = '/work/order/one';
    const cb = json => {
      // only handle data here
      let data = {
        [body.id]: json.data
      };
      let { details } = this.props[subModule];
      let newDetails = Object.assign({}, details, data);
      let value = {
        details: newDetails,
        detailLoading: false
      };
      console.log(newDetails);
      // set data into store
      this.props.changeTask(subModule, value);
    };
    // console.log(resource)
    AjaxHandler.ajax(resource, body, cb);
  };

  changePhase = e => {
    try {
      e.preventDefault();
      let key = parseInt(e.target.getAttribute('data-key'), 10);
      let { mainCate } = this.props[subModule];
      if (mainCate !== key) {
        this.props.changeTask(subModule, { mainCate: key });
      }
    } catch (e) {
      console.log(e);
    }
  };
  changeSchool = v => {
    let { schoolId } = this.props[subModule];
    if (v === schoolId) {
      return;
    }
    this.props.changeTask(subModule, {
      schoolId: v,
      panel_page: [1, 1, 1],
      panel_dataSource: { 1: [], 2: [], 3: [] }
    });
  };
  changeAll = v => {
    let { main_mine } = this.props[subModule];
    if (v !== main_mine) {
      this.props.changeTask(subModule, {
        main_mine: v,
        panel_page: [1, 1, 1],
        panel_dataSource: { 1: [], 2: [], 3: [] }
      });
    }
  };
  changeRange = key => {
    let panel_rangeIndex = this.props[subModule]['panel_rangeIndex'].slice();
    let panel_dataSource = JSON.parse(
      JSON.stringify(this.props[subModule]['panel_dataSource'])
    );
    let panel_page = this.props[subModule]['panel_page'].slice();
    let startTime = this.props[subModule]['panel_startTime'].slice();
    let endTime = this.props[subModule]['panel_endTime'].slice();

    let i = this.props[subModule].mainCate;
    panel_rangeIndex[i] = parseInt(key, 10);
    panel_page[i] = 1;
    panel_dataSource[i + 1] = []; // clear dataSource of the corresponding panel
    // clear startTime and endTime
    startTime[i] = '';
    endTime[i] = '';
    this.props.changeTask(subModule, {
      panel_rangeIndex: panel_rangeIndex,
      panel_page: panel_page,
      panel_dataSource: panel_dataSource,
      panel_startTime: startTime,
      panel_endTime: endTime
    });
  };
  changeTaskType = key => {
    let panel_type = JSON.parse(
      JSON.stringify(this.props[subModule]['panel_type'])
    );
    let panel_dataSource = JSON.parse(
      JSON.stringify(this.props[subModule]['panel_dataSource'])
    );
    let i = this.props[subModule].mainCate;
    panel_type[i] = parseInt(key, 10);
    panel_dataSource[i + 1] = []; // clear dataSource of the corresponding panel
    this.props.changeTask(subModule, {
      panel_type: panel_type,
      panel_dataSource: panel_dataSource
    });
  };
  changeStartTime = time => {
    this.setState({
      startTime: time
    });
  };
  changeEndTime = time => {
    this.setState({
      endTime: time
    });
  };
  confirmTimeRange = () => {
    let { startTime, endTime } = this.state;
    if (!startTime || !endTime) {
      return;
    }
    let panel_startTime = JSON.parse(
      JSON.stringify(this.props[subModule].panel_startTime)
    );
    let panel_endTime = JSON.parse(
      JSON.stringify(this.props[subModule].panel_endTime)
    );
    let panel_page = JSON.parse(
      JSON.stringify(this.props[subModule].panel_page)
    );
    let panel_rangeIndex = this.props[subModule].panel_rangeIndex.slice();
    let panel_dataSource = JSON.parse(
      JSON.stringify(this.props[subModule]['panel_dataSource'])
    );
    // let panel_total = JSON.parse(JSON.stringify(this.props[subModule].panel_total))
    let i = this.props[subModule].mainCate;
    panel_startTime[i] = startTime;
    panel_endTime[i] = endTime;
    panel_page[i] = 1;
    panel_rangeIndex[i] = 0;
    panel_dataSource[i + 1] = []; // clear dataSource of the corresponding panel
    this.props.changeTask(subModule, {
      panel_startTime: panel_startTime,
      panel_endTime: panel_endTime,
      panel_page: panel_page,
      panel_rangeIndex: panel_rangeIndex,
      panel_dataSource: panel_dataSource
    });
  };
  changeSearch = e => {
    let v = e.target.value;
    this.setState({
      searchingText: v
    });
  };
  searchEnter = () => {
    let v = this.state.searchingText.trim();
    let panel_selectKey = JSON.parse(
      JSON.stringify(this.props[subModule].panel_selectKey)
    );
    let panel_page = JSON.parse(
      JSON.stringify(this.props[subModule].panel_page)
    );
    let panel_dataSource = JSON.parse(
      JSON.stringify(this.props[subModule]['panel_dataSource'])
    );
    let i = this.props[subModule].mainCate;
    panel_selectKey[i] = v;
    panel_page[i] = 1;
    panel_dataSource[i + 1] = [];
    this.props.changeTask(subModule, {
      panel_selectKey: panel_selectKey,
      panel_page: panel_page,
      panel_dataSource: panel_dataSource
    });
  };
  selectRow = (record, index, event) => {
    let { detail_tabIndex, mainCate, panel_dataSource } = this.props[subModule];
    // let page = panel_page[mainCate]
    let id =
      panel_dataSource[mainCate] &&
      panel_dataSource[mainCate][index] &&
      panel_dataSource[mainCate][index].id;
    let newTabIndex = Array.from(detail_tabIndex);
    newTabIndex[mainCate] = 1;
    this.props.changeTask(subModule, {
      selectedRowIndex: index,
      showDetail: true,
      detail_tabIndex: newTabIndex,
      selectedDetailId: id
    });
  };

  changePage = pageObj => {
    let page = pageObj.current;
    let { panel_page, mainCate } = this.props[subModule];
    let former = panel_page[mainCate];
    if (former === page) {
      return;
    }
    let newPage = Array.from(panel_page);
    newPage.splice(mainCate, 1, page);
    this.props.changeTask(subModule, { panel_page: newPage });
  };

  setRowClass = (record, index) => {
    let { selectedRowIndex } = this.props[subModule];
    if (index === selectedRowIndex) {
      return 'selectedRow';
    } else {
      return '';
    }
  };
  buildTask = () => {
    this.setState({
      showBuild: true
    });
  };
  cancelBuildTask = () => {
    this.setState({
      showBuild: false
    });
  };
  buildTaskSuccess = () => {
    Noti.hintOk('操作成功', '创建工单成功');
    this.setState({
      showBuild: false
    });
    this.updateList();
  };
  updateList = () => {
    let panel_dataSource = JSON.parse(
      JSON.stringify(this.props[subModule].panel_dataSource)
    );
    let panel_page = Array.from(this.props[subModule].panel_page);
    delete panel_dataSource[1]; // clear handling list
    panel_page[1] = 1;
    let newProps = {
      panel_dataSource: panel_dataSource,
      mainCate: 1,
      panel_page: panel_page
    };
    this.needUpdate = true; // tell 'propsWillReceiveProps' to update dataSource
    this.props.changeTask(subModule, newProps);
  };
  render() {
    const { isCs, csOnline } = this.props.user;
    let {
      mainCate,
      schoolId,
      panel_rangeIndex,
      panel_startTime,
      panel_endTime,
      assess_dim
    } = this.props[subModule];
    const { forbiddenStatus } = this.props;
    // console.log(dataSource)
    const { loading, startTime, endTime, dataSource } = this.state;

    const columns = [
      {
        title: '工单编号',
        dataIndex: 'id',
        className: 'firstCol selectedHintWraper',
        width: '8%',
        render: (text, record, index) => (
          <span className="">
            <img src={selectedImg} alt="" className="selectedImg" />
            {text}
          </span>
        )
      },
      {
        title: '学校',
        dataIndex: 'schoolName',
        width: '10%'
      },
      {
        title: '工单类型',
        dataIndex: 'type',
        width: '8%',
        render: text => CONSTANTS.TASKTYPE[text]
      },
      {
        title: '发起人',
        dataIndex: 'creatorName',
        width: '10%'
      },
      {
        title: '受理人',
        dataIndex: 'assignName',
        width: '10%'
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        width: '14%',
        render: (text, record) => Time.getTimeStr(text)
      },
      {
        title: 'xxx',
        dataIndex: 'endTime',
        width: '14%',
        render: (text, record, index) => {
          if (record.status === 5 || record.status === 6) {
            return record.endTime
              ? Time.getTimeInterval(record.createTime, record.endTime)
              : Time.getSpan(record.createTime);
          } else {
            return record.createTime ? Time.getSpan(record.createTime) : '';
          }
        }
      }
    ];

    const sumColumns = [
      {
        title: '工单编号',
        dataIndex: 'id',
        className: 'firstCol selectedHintWraper',
        width: '8%',
        render: (text, record, index) => (
          <span className="">
            <img src={selectedImg} alt="" className="selectedImg" />
            {text}
          </span>
        )
      },
      {
        title: '学校',
        dataIndex: 'schoolName',
        width: '10%'
      },
      {
        title: '工单类型',
        dataIndex: 'type',
        width: '8%',
        render: text => CONSTANTS.TASKTYPE[text]
      },
      {
        title: '发起人',
        dataIndex: 'creatorName',
        width: '8%'
      },
      {
        title: '受理人',
        dataIndex: 'assignName',
        width: '8%'
      },
      {
        title: '紧急程度',
        dataIndex: 'level',
        width: '8%',
        render: (text, record) => (
          <span className={classLevel[record.level]}>
            {CONSTANTS.PRIORITY[text]}
          </span>
        )
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        width: '12%',
        render: (text, record) => Time.getTimeStr(text)
      },
      {
        title: 'xxx',
        dataIndex: 'endTime',
        width: '12%',
        render: (text, record, index) => {
          if (record.status === 5 || record.status === 6) {
            return record.endTime
              ? Time.getTimeInterval(record.createTime, record.endTime)
              : Time.getSpan(record.createTime);
          } else {
            return record.createTime ? Time.getSpan(record.createTime) : '';
          }
        }
      }
    ];

    const sumTable = (
      <Table
        bordered
        loading={loading}
        rowKey={record => record.id}
        pagination={{
          pageSize: SIZE
        }}
        // dataSource={panel_dataSource[mainCate]}
        dataSource={dataSource}
        columns={sumColumns}
        onChange={this.changePage}
        onRowClick={this.selectRow}
        rowClassName={this.setRowClass}
      />
    );

    return (
      <div className="taskPanelWrapper" ref="wrapper">
        {isCs && !csOnline ? (
          <div
            className="loadingMask offlineWrapper"
            onClick={this.changeOnline}
          >
            <div className="offline">
              <img src={notworking} alt="offline" />
              <span>未进入工作状态</span>
              <Button size="small" type="primary">
                点击上班
              </Button>
            </div>
          </div>
        ) : null}
        <div className="phaseLine">
          <div className="block">
            <div className="navLink" onClick={this.changePhase}>
              <a
                href=""
                className={mainCate === 0 ? 'active' : ''}
                data-key={0}
              >
                工作情况
              </a>
              <a
                href=""
                className={mainCate === 1 ? 'active' : ''}
                data-key={1}
              >
                投诉分析
              </a>
              <a
                href=""
                className={mainCate === 2 ? 'active' : ''}
                data-key={2}
              >
                绩效考核
              </a>
            </div>
            <div className="task-select">
              <SchoolSelector
                className="select-item"
                selectedSchool={schoolId}
                changeSchool={this.changeSchool}
              />
            </div>
          </div>
          {mainCate === REPORT_CATE_COMPLAINT ? (
            <div className="block">
              {forbiddenStatus.BUILD_COMPLAINT_TAG ? null : (
                <Button
                  type="primary"
                  className="rightBtn"
                  onClick={this.buildTask}
                >
                  添加投诉标签
                </Button>
              )}
            </div>
          ) : null}
        </div>

        <div className="task-queryPanel">
          <div className="task-queryLine">
            <div className="block">
              <span>{TIMELABEL[mainCate]}:</span>
              <CheckSelect
                options={TIMERANGESELECTS[mainCate]}
                value={panel_rangeIndex[mainCate]}
                onClick={this.changeRange}
              />
              <RangeSelect
                className="task-rangeSelect"
                startTime={startTime}
                endTime={endTime}
                changeStartTime={this.changeStartTime}
                changeEndTime={this.changeEndTime}
                confirm={this.confirmTimeRange}
              />
            </div>
          </div>

          {mainCate === REPORT_CATE_ASSESS ? (
            <div className="task-queryLine">
              <div className="block">
                <span>任务类型:</span>
                <CheckSelect
                  options={TASKTYPES}
                  value={assess_dim}
                  onClick={this.changeTaskType}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="tableList">{sumTable}</div>
      </div>
    );
  }
}

// export default TaskList

const mapStateToProps = (state, ownProps) => ({
  report: state.changeTask[subModule],
  user: state.setUserInfo,
  forbiddenStatus: state.setAuthenData.forbiddenStatus
});

export default withRouter(
  connect(mapStateToProps, {
    changeTask,
    setUserInfo
  })(TaskList)
);
