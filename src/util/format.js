const Format = {}
/* ------these are for data build in fetchdata----- */
Format.dayFormat = v => {
  let t = v.split('-')
  let newT = t.map((r, i) => {
    let n = parseInt(r, 10),
      s = n.toString()
    return s
  })
  return newT.join('-')
}

Format.hourFormat = v => {
  let t = v.split('-')
  let newT = t.map((r, i) => {
    let n = parseInt(r, 10),
      s = n.toString()
    return s
  })
  return newT.slice(0, 3).join('-') + ' ' + newT[3] + ':00'
}

Format.minuteFormat = v => {
  // v is a string , only hour ,this is for adding '0'
  if (v < 10) {
    return '0' + v
  } else {
    return v
  }
}
Format.adding0 = v => {
  // only for adding 0
  if (v < 10) {
    return '0' + v
  } else {
    return v
  }
}
Format.hourMinute = o => {
  // o is object, like {hour: 4, minute: 34}
  let h = Format.adding0(o.hour),
    m = Format.adding0(o.minute)
  return h + ':' + m
}

Format.fullTime = v => {
  let a = v.split('-')
  let y = a[0],
    m = parseInt(a[1], 10) > 9 ? a[1] : `0${a[1]}`,
    d = parseInt(a[2], 10) > 9 ? a[2] : `0${a[2]}`
  let h = parseInt(a[3], 10) > 9 ? a[3] : `0${a[3]}`
  return `${y}-${m}-${d} ${h}:00`
}

/* -----these are for legend and axis----- */
Format.dayLabel = v => {
  let a = v.split('-')
  return a.slice(1, 3).join('-')
}

Format.hourLabel = v => {
  let a = v.split(' ')
  return a[1]
}

Format.getWeekNum = v => {
  let a = v.split('-')
  return parseInt(a[1], 10)
}

Format.monthFormat = x => {
  // x---'2017-09'
  let a = x.split('-')
  return a[0] + '年' + parseInt(a[1], 10) + '月'
}
Format.number2chi = num => {
  if (num >= 100) {
    return num
  }
  const chineseCharacter = [
    '',
    '一',
    '二',
    '三',
    '四',
    '五',
    '六',
    '七',
    '八',
    '九'
  ]
  const arr = num
    .toString()
    .split('')
    .reverse('')
  let m = chineseCharacter[parseInt(arr[0], 10)],
    n = '',
    nn
  if (arr[1]) {
    n = chineseCharacter[parseInt(arr[1], 10)]
    nn = n === '一' ? '十' : `${n}十`
  }

  return nn ? nn + m : m
}
Format.rangeToHour = o => {
  // this is used for time ranges like {startTime: {hour: 0, minute: 3}, endTime: {hour: 8, minute: 33}}
  return `${Format.adding0(o.startTime.hour)}:${Format.adding0(
    o.startTime.minute
  )}-${Format.adding0(o.endTime.hour)}:${Format.adding0(o.endTime.minute)}`
}

Format.minIntToHourMinStr = minInt => {
  var hourMinStr = ''
  var hour = minInt / 60
  if (hour === 0) {
    hourMinStr = '00:'
  } else if (hour < 10) {
    hourMinStr += '0' + hour + ':'
  } else {
    hourMinStr = hour + ':'
  }

  var min = minInt % 60
  if (min === 0) {
    hourMinStr += '00'
  } else if (min < 10) {
    hourMinStr += '0' + min
  } else {
    hourMinStr = min
  }
  return hourMinStr
}
export default Format
