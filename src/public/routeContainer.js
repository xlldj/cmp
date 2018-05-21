import React from 'react'
import { RouteWithSubRoutes } from './routeWithSubRoutes'

export const RouteContainer = ({ routes }) => {
  return routes.map((route, i) => <RouteWithSubRoutes key={i} {...route} />)
}
