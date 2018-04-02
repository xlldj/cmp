/* eslint-disable no-undef */

import React from 'react'
import { shallow } from 'enzyme'
import RangeSelect from './rangeSelect'

test('App', () => {
  let wrapper = shallow(<RangeSelect />)
  let span = <span className="rangeSelect-seperator">至</span>

  expect(wrapper.contains(span)).toBe(true)
  expect(wrapper.hasClass('rangeSelect')).toEqual(true)
})
