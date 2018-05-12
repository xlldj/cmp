const lost_list = {
  data: {
    lostAndFounds: [
      {
        id: 524,
        schoolId: 6,
        userId: 8852,
        type: 1,
        title: '缺水',
        createTime: 1526095461000,
        user: '17854173100',
        schoolName: '济南大学(21-30栋)'
      },
      {
        id: 523,
        schoolId: 1,
        userId: 453,
        type: 1,
        title: '呵呵哒',
        createTime: 1526057127000,
        user: '18506835815',
        schoolName: '笑联大学'
      },
      {
        id: 522,
        schoolId: 23,
        userId: 88718,
        type: 2,
        title: '饭卡还是水卡',
        createTime: 1526050709000,
        user: '18871537065',
        schoolName: '湖北科技学院'
      },
      {
        id: 521,
        schoolId: 21,
        userId: 79301,
        type: 2,
        title: '捡到了一串钥匙',
        createTime: 1526049354000,
        user: '18571504870',
        schoolName: '湖北生物科技职业学院'
      },
      {
        id: 520,
        schoolId: 27,
        userId: 89673,
        type: 1,
        title: '羽毛球拍',
        createTime: 1526045628000,
        user: '15327536505',
        schoolName: '武昌职业学院'
      },
      {
        id: 519,
        schoolId: 27,
        userId: 87747,
        type: 1,
        title: '丢失女朋友一枚',
        createTime: 1526030380000,
        user: '18086310602',
        schoolName: '武昌职业学院'
      },
      {
        id: 514,
        schoolId: 19,
        userId: 39829,
        type: 1,
        title: '充电宝丢失',
        createTime: 1526004964000,
        user: '18961951770',
        schoolName: '三峡大学'
      },
      {
        id: 513,
        schoolId: 23,
        userId: 51450,
        type: 1,
        title: '饭卡卡',
        createTime: 1525962520000,
        user: '13098354485',
        schoolName: '湖北科技学院'
      }
    ],
    total: 306
  },
  timestamp: 1526096037976
}
const lost_detail = {
  data: {
    id: 524,
    schoolId: 6,
    userId: 8852,
    type: 1,
    images: ['found/8852_1526095433513_8312.jpg'],
    title: '缺水',
    description: '妈的整天停水停水停水，怎么回事啊！！？？？',
    itemName: '水',
    location: '学30',
    mobile: '123456789',
    lostTime: 1526091840000,
    createTime: 1526095461000,
    user: '17854173100',
    schoolName: '济南大学(21-30栋)'
  },
  timestamp: 1526096726232
}
const comments_list = {
  data: {
    commentsSize: 0, // 此次实际返回的评论数量
    comments: [
      {
        // 评论
        id: 1,
        userId: 0,
        userMobile: 0,
        userNickname: 'string',
        pictureUrl: 'string',
        createTime: 0,
        userInBlackList: false,
        status: 0,
        delUserId: 0,
        delUserNickname: 'string',
        delTime: 0,
        content: 'string',
        repliesCount: 0, // 此条评论的总回复数量
        repliesDelCount: 0, // 此条评论回复中已被删除的数量
        repliesSize: 0, // 此条评论此次实际返回的回复数量
        replies: [
          {
            // 该评论的回复
            id: 0,
            userId: 0,
            userMobile: 0,
            userNickname: 'string',
            pictureUrl: 'string',
            createTime: 0,
            userInBlackList: false,
            status: 0,
            content: 'string',
            delUserId: 0,
            delUserNickname: 'string',
            delTime: 0,
            replyToUserId: 0,
            replyToUserMobile: 0,
            replyToUserNickname: 'string',
            replyToUserInBlackList: false
          }
        ]
      }
    ]
  },
  error: {
    bleCmdType: 0,
    code: 0,
    debugMessage: 'string',
    displayMessage: 'string'
  },
  timestamp: '2018-05-03T01:55:42.877Z'
}
const lostHandler = (resource, body, cb) => {
  if (resource === '/lost/list') {
    let json = lost_list
    return Promise.resolve(json)
  } else if (resource === '/lost/details') {
    return Promise.resolve(lost_detail)
  } else if (resource === '/lost/comments/list') {
    return Promise.resolve(comments_list)
  }
}

export default lostHandler
