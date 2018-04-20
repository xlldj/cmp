import React from 'react'
import { Breadcrumb } from 'antd'
import { withRouter, Link } from 'react-router-dom'

const Bread = withRouter(props => {
  const { location, breadcrumbNameMap, parent, parentName, single } = props
  const containColon = location.pathname.includes(':')
  const pathSnippets = location.pathname.split('/').filter((v, i) => i > 1)
  const l = containColon
    ? pathSnippets.length - 1 || 0
    : pathSnippets.length || 0
  let extraBreadcrumbItems

  extraBreadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`
    if (index === l) {
      return null
    }
    return (
      <Breadcrumb.Item key={url + index}>
        {index + 1 < l ? (
          <Link
            to={`/${parent}${url}`}
            onClick={
              props[`clearStatus4${parent}II${_}`]
                ? props[`clearStatus4${parent}II${_}`]
                : null
            }
          >
            {breadcrumbNameMap[url]}
          </Link>
        ) : (
          <span className="breadItem">{breadcrumbNameMap[url]}</span>
        )}
      </Breadcrumb.Item>
    )
  })
  const breadcrumbItems = [
    <Breadcrumb.Item key="schoolList">
      {single ? (
        l > 0 ? (
          <Link
            to={`/${parent}`}
            onClick={
              props[`setStatusFor${parent}`]
                ? props[`setStatusFor${parent}`]
                : null
            }
          >
            {parentName}
          </Link>
        ) : (
          <span className="breadItem">{parentName}</span>
        )
      ) : null}
    </Breadcrumb.Item>
  ].concat(extraBreadcrumbItems)
  return (
    <div className="breads">
      <Breadcrumb>{breadcrumbItems}</Breadcrumb>
    </div>
  )
})

export default Bread
