import React, { Fragment } from 'react'

const DetailTabHeader = props => {
  const { data, currentTab } = props
  const { type, env } = data
  return (
    <Fragment>
      {/* hide if env === 2, initiated by employee */}
      {type === 1 && env === 1 ? (
        <ul className="panelSelect" onClick={props.changeTabIndex}>
          <li data-key={1} className={currentTab === 1 ? 'active' : ''}>
            用户详情
          </li>
          <li data-key={10} className={currentTab === 10 ? 'active' : ''}>
            学校详情
          </li>
          <li data-key={2} className={currentTab === 2 ? 'active' : ''}>
            用户订单记录
          </li>
          <li data-key={3} className={currentTab === 3 ? 'active' : ''}>
            用户报修记录
          </li>
          <li data-key={4} className={currentTab === 4 ? 'active' : ''}>
            设备详情
          </li>
          <li data-key={5} className={currentTab === 5 ? 'active' : ''}>
            设备订单记录
          </li>
          <li data-key={6} className={currentTab === 6 ? 'active' : ''}>
            设备维修记录
          </li>
        </ul>
      ) : null}
      {type === 2 && env === 1 ? (
        <ul className="panelSelect" onClick={props.changeTabIndex}>
          <li data-key={1} className={currentTab === 1 ? 'active' : ''}>
            用户详情
          </li>
          <li data-key={10} className={currentTab === 10 ? 'active' : ''}>
            学校详情
          </li>
          <li data-key={7} className={currentTab === 7 ? 'active' : ''}>
            用户充值提现记录
          </li>
          <li data-key={2} className={currentTab === 2 ? 'active' : ''}>
            用户订单记录
          </li>
          <li data-key={8} className={currentTab === 8 ? 'active' : ''}>
            用户投诉记录
          </li>
        </ul>
      ) : null}
      {type === 3 && env === 1 ? (
        <ul className="panelSelect" onClick={props.changeTabIndex}>
          <li data-key={1} className={currentTab === 1 ? 'active' : ''}>
            用户详情
          </li>
          <li data-key={10} className={currentTab === 10 ? 'active' : ''}>
            学校详情
          </li>
          <li data-key={7} className={currentTab === 7 ? 'active' : ''}>
            用户充值提现记录
          </li>
          <li data-key={2} className={currentTab === 2 ? 'active' : ''}>
            用户订单记录
          </li>
          <li data-key={9} className={currentTab === 9 ? 'active' : ''}>
            用户反馈记录
          </li>
        </ul>
      ) : null}
    </Fragment>
  )
}
export default DetailTabHeader
