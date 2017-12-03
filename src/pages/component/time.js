import Format from './format'
const Time = {}
/* ------get time base today------ */
Time.getTimeStr = (t) => {
  let a = new Date(t), ay = a.getFullYear(), aM = a.getMonth() > 8 ? parseInt(a.getMonth()) + 1 : '0' + (parseInt(a.getMonth()) + 1)
  let aD = a.getDate() > 9 ? a.getDate() : '0' + a.getDate(), aH = a.getHours() > 9 ? a.getHours() : '0' + a.getHours(), aMi = a.getMinutes() > 9 ? a.getMinutes() : '0' + a.getMinutes()
  let n = new Date()
  let applyTS = `${ay}-${aM}-${aD} ${aH}:${aMi}`
  if (n.getFullYear() === a.getFullYear() && n.getMonth() === a.getMonth() && n.getDate() === a.getDate()) {
    return `今天 ${aH}:${aMi}`
  } else if (n.getFullYear() === a.getFullYear() && n.getMonth() === a.getMonth() && n.getDate() === a.getDate() + 1) {
    return `昨天 ${aH}:${aMi}`
  } else {
    return applyTS
  }
}

Time.getSpan = (t) => {
  let n = new Date()
  let span = n.getTime() - t
  let d = Math.floor(span / (24 * 60 * 60 * 1000))
  let h = Math.floor((span - d * (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  let m = Math.floor((span - d * (24 * 60 * 60 * 1000) - h * (60 * 60 * 1000)) / (60 * 1000))
  let period = (d ? `${d}天` : '') + (h ? `${h}小时` : '') + `${m}分钟`
  return period
}

/* ------get time span between t1 and t2,and t2 is bigger-------- */
Time.getTimeInterval = (t1, t2) => {
  let span = t2 - t1
  let d = Math.floor(span / (24 * 60 * 60 * 1000))
  let h = Math.floor((span - d * (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  let m = Math.floor((span - d * (24 * 60 * 60 * 1000) - h * (60 * 60 * 1000)) / (60 * 1000))
  let period = (d ? `${d}天` : '') + (h ? `${h}小时` : '') + `${m}分钟`
  return period
}

Time.getNow = () => {
  let t = new Date()
  return Date.parse(t)
}

Time.getTodayStart = () => {
  let a = new Date()
  a.setHours(0, 0, 0)
  return Date.parse(a)
}

Time.getDayStart = (t) => {
  let a = new Date(t)
  a.setHours(0, 0, 0)
  return Date.parse(a)
}
Time.getDayEnd = (t) => {
  let a = new Date(t)
  /* -----set to next day's start----- */
  a.setHours(23, 59, 60)
  return Date.parse(a)
}

Time.getWeekStart = (t) => {
  let a = new Date(t)
  let weekDay = a.getDay() === 0 ? 7 : a.getDay()
  let monday = a - ((weekDay - 1) * 24 * 60 * 60 * 1000)
  return Time.getDayStart(monday)
}

Time.getWeekEnd = (t) => {
  let aWeekPassed = t + 7 * 24 * 3600 * 1000
  return Time.getWeekStart(aWeekPassed)
}

Time.getMonthStart = (t) => {
  let a = new Date(t)
  a.setDate(1)
  a.setHours(0, 0, 0)
  return Date.parse(a)
}

/* -----getMonthEnd返回下一个月的1号0点----- */
Time.getMonthEnd = (t) => {
  let a = new Date(t)
  a.setDate(1)
  let m = a.getMonth()
  if (m === 11) {
    a.setFullYear(a.getFullYear() + 1, 0)
  } else {
    a.setMonth(m + 1)
  }
  a.setHours(0, 0, 0)
  return Date.parse(a)
}

Time.getYestodayStart = () => {
  let t = new Date()
  let y = Date.parse(t) - 24 * 3600 * 1000
  return Time.getDayStart(y)
}

Time.getYestodayEnd = () => {
  let t = new Date()
  let y = Date.parse(t) - 24 * 3600 * 1000
  return Time.getDayEnd(y)
}

Time.getLastWeekStart = () => {
  let t = new Date()
  let lastWeek = Date.parse(t) - 7 * 24 * 3600 * 1000
  return Time.getWeekStart(lastWeek)
}

Time.getLastWeekEnd = () => {
  return Time.getWeekStart(new Date())
}
Time.getLastMonthStart = () => {
  let t = new Date(), m = t.getMonth(), y = t.getFullYear()
  if (m === 0) {
    t.setFullYear(y - 1, 11, 1)
  } else {
    t.setMonth(m - 1, 1)
  }
  t.setHours(0, 0, 0)
  return Date.parse(t)
}

Time.getLastMonthEnd = () => {
  /*
  If the dayValue is outside of the range of date values for the month,
  setDate() will update the Date object accordingly. For example,
  if 0 is provided for dayValue, the date will be set to
    the last day of the previous month. */
  let t = new Date()
  t.setDate(0)// 上一个月最后一天的0点
  return Time.getMonthEnd(Date.parse(t))
}

/* -----start and end is the timestamp----- */
Time.getDateArray = (start, end) => {
  let startTime = new Date(start), result = []
  startTime.setHours(0, 0, 0)
  let t = Date.parse(startTime)
  if (t > end) {
    return []
  }
  while (t < end) {
    result.push({
      x: Time.formatDate(t)
    })
    t += 24 * 3600 * 1000
  }
  return result
}

Time.getHourArray = (start, end) => {
  let startTime = new Date(start), result = [], h = startTime.getHours()

  startTime.setHours(h, 0, 0)
  let t = Date.parse(startTime)
  if (t > end) {
    return []
  }
  while (t < end) {
    result.push({
      x: Time.formatHour(t)
    })
    t += 3600 * 1000
  }
  return result
}

Time.formatDate = (ts) => {
  let t = new Date(ts)
  return t.getFullYear() + '-' + (t.getMonth() + 1) + '-' + t.getDate()
}

Time.formatHour = (ts) => {
  let t = new Date(ts)
  return Time.formatDate(ts) + ' ' + t.getHours() + ':00'
}

/* -----将过去一周数据的x变为当周对应时间----- */
Time.add1Week = (x) => {
  let t = Date.parse(new Date(x))
  t += 7 * 24 * 3600 * 1000
  return Time.getDayFormat(t)
}
Time.add1Month = (x) => {
  let t = Date.parse(new Date(x))
  t += 7 * 24 * 3600 * 1000
  return Time.getDayFormat(t)
}
Time.add1Date = (x) => {
  let a = x.split(' ')
  let h = parseInt(a[1])
  let t = new Date(a[0])
  t.setHours(h)
  let ts = Date.parse(t) + 24 * 3600 * 1000
  return Time.getHourFormat(ts)
}

Time.getDayFormat = (t) => {
  let time = new Date(t), y = time.getFullYear()
  let m = time.getMonth() > 8 ? parseInt(time.getMonth(), 10) + 1 : '0' + (parseInt(time.getMonth(), 10) + 1)
  let date = time.getDate() > 9 ? parseInt(time.getDate(), 10) : '0' + parseInt(time.getDate(), 10)
  return y + '-' + m + '-' + date
}

Time.getHourFormat = (t) => {
  let time = new Date(t), y = time.getFullYear(), m = time.getMonth() + 1, date = time.getDate(), h = time.getHours()
  return y + '-' + m + '-' + date + ' ' + h + ':00'
}

Time.ago24Hour = (x) => {
  let a = x.split(' ')
  let t = new Date(a[0]), h = parseInt(a[1])
  t.setHours(h)
  let ts = Date.parse(t) - 24 * 3600 * 1000
  return Time.getHourFormat(ts)
}

Time.ago1Week = (x) => {
  let t = new Date(x)
  let ts = Date.parse(t) - 7 * 24 * 3600 * 1000
  return Time.getDayFormat(ts)
}

Time.weekAgo = (x) => {
  let t = new Date(x)
  let ts = Date.parse(t) - 7 * 24 * 3600 * 1000
  return Time.formatDate(ts)
}

Time.getDatesOfCurrMonth = (x) => {
  let t = Date.parse(new Date(x))
  let result = Time.getMonthEnd(t)
  let r = new Date(result)
  r.setDate(0)// 返回上一个月的最后一天的0点
  let date = r.getDate()
  return date
}
/* -----getDatesoflastmonth 返回上个月的天数----- */
Time.getDatesOfLastMonth = (x) => {
  let t = new Date(x)
  t.setDate(0)
  return t.getDate()
}

/* -----取得每个月第一个星期日的0点----- */
Time.getFirstWeekStart = (t) => {
  // t总是每个月的第一天的0点
  let weekday = new Date(t).getDay()
  if (weekday === 0) { // 如果就是周日，返回这个零点的时间戳
    return t
  } else {
    let sunday = t + (7 - weekday) * 24 * 3600 * 1000
    return sunday
  }
}
/* -----getTheLastWeekEnd返回当月最后一个周日的0点----- */
Time.getTheLastWeekEnd = (t) => {
  // t总是下个月第一天的0点
  return Time.getWeekStart(t) - 24 * 3600 * 1000
}
Time.getFirstWeekNum = (t) => {
  let time = new Date(t)
  time.setMonth(0, 1)
  let span = t - Date.parse(time)
  let weeks = span / (7 * 24 * 3600 * 1000)
  return Math.floor(weeks)
}
Time.getMonthFormat = (t) => {
  let time = new Date(t), y = time.getFullYear(), m = time.getMonth() > 8 ? parseInt(time.getMonth()) + 1 : '0' + (parseInt(time.getMonth()) + 1)
  return y + '-' + m
}
Time.formatSpan = (span) => {
  let d = Math.floor(span / (24 * 60 * 60 * 1000))
  let h = Math.floor((span - d * (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  let m = Math.floor((span - d * (24 * 60 * 60 * 1000) - h * (60 * 60 * 1000)) / (60 * 1000))
  let period = (d ? `${d}天` : '') + (h ? `${h}小时` : '') + `${m}分钟`
  return period
}
Time.showDate = (t) => {
  let time = new Date(t)
  let y = time.getFullYear(), m = Format.adding0(time.getMonth() + 1), d = Format.adding0(time.getDate())
  let h = Format.adding0(time.getHours()), mm = Format.adding0(time.getMinutes())
  return `${y}-${m}-${d} ${h}:${mm}`
}
export default Time
