/* eslint-disable no-undef */

import React from 'react'
import { shallow } from 'enzyme'
import OrderStatView from './orderStat'

test('App', () => {
  let wrapper = shallow(<OrderStatView />)

  expect(wrapper.hasClass('orderStat')).toEqual(true)
})
