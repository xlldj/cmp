import React from 'react'
import { Icon } from 'antd'

const OVDetail = props => (
  <div className="ovDetail">
    <h3>{props.title}</h3>
    <p className="data">{props.data}</p>
    <p className="itemFooter">
      <span className="arrow">
        {props.direction === 1 ? (
          <span style={{ color: '#2abd07' }}>
            <Icon type="caret-up" style={{ marginRight: 4 }} />
            {`${props.percent / 10}%`}
          </span>
        ) : props.direction === 3 ? (
          <span style={{ color: '#fd5800' }}>
            <Icon type="caret-down" style={{ marginRight: 4 }} />
            {`${props.percent / 10}%`}
          </span>
        ) : (
          <span style={{ color: '#bbb' }}>
            <Icon type="lock" style={{ marginRight: 4 }} />
            {`${props.percent / 10}%`}
          </span>
        )}
      </span>
      <span>同比上周</span>
    </p>
  </div>
)

export default OVDetail
