import React from 'react'
import getDisplayName from '../../../../../public/getDisplayName'
import { checkObject } from '../../../../../util/checkSame'
import { Map, is } from 'immutable'

function detailTabHoc(WrappedComponent, fetchData) {
  class DetailTabHoc extends React.Component {
    componentDidMount() {
      fetchData(this.props)
    }
    componentWillReceiveProps(nextProps) {
      debugger
      if (
        !checkObject(this.props, nextProps, ['selectedDetailId', 'creatorId'])
      ) {
        fetchData(nextProps)
      }
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
  DetailTabHoc.displayName = `DetailTabHoc(${getDisplayName(WrappedComponent)})`
  return DetailTabHoc
}

export default detailTabHoc
