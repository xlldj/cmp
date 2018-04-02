import React from 'react'
import getDisplayName from './getDisplayName'
import { Map, is } from 'immutable'

function tableHoc(WrappedComponent, handleData) {
  class TableHoc extends React.Component {
    componentDidMount() {
      if (this.props.hide) {
        this.props.hide(false)
      }
      handleData(this.props, null, this)
    }
    componentWillUnmount() {
      if (this.props.hide) {
        this.props.hide(true)
      }
    }

    componentWillReceiveProps(nextProps) {
      handleData(nextProps, this.props, this)
    }
    shouldComponentUpdate(nextProps, nextState) {
      let nextPropsMap = Map(nextProps),
        thisPropsMap = Map(this.props),
        nextStateMap = Map(nextState),
        thisStateMap = Map(this.state)
      if (is(nextPropsMap, thisPropsMap) && is(nextStateMap, thisStateMap)) {
        return false
      }
      return true
    }

    render() {
      return <WrappedComponent {...this.props} />
    }
  }
  TableHoc.displayName = `TableHoc(${getDisplayName(WrappedComponent)})`
  return TableHoc
}

export default tableHoc
