const lost_list = {
  data: {
    lostAndFounds: [
      {
        commentsCount: 0,
        createTime: '2018-05-14T03:14:36.199Z',
        hiddenByUserId: 0,
        hiddenByUserName: 'fly',
        hiddenTime: '2018-05-14T03:14:36.199Z',
        id: 1,
        reportCount: 2,
        schoolId: 1,
        schoolName: '笑联',
        status: 2,
        title: '没水啊',
        type: 1,
        user: '王五',
        userId: 0,
        viewCount: 3
      },
      {
        commentsCount: 3,
        createTime: '2018-05-14T03:14:36.199Z',
        hiddenByUserId: 0,
        hiddenByUserName: 'fly',
        hiddenTime: '2018-05-14T03:14:36.199Z',
        id: 2,
        reportCount: 2,
        schoolId: 1,
        schoolName: '笑联',
        status: 1,
        title: '没水啊',
        type: 1,
        user: '王五',
        userId: 0,
        viewCount: 3
      },
      {
        commentsCount: 10,
        createTime: '2018-05-14T03:14:36.199Z',
        hiddenByUserId: 0,
        hiddenByUserName: 'fly',
        hiddenTime: '2018-05-14T03:14:36.199Z',
        id: 3,
        reportCount: 2,
        schoolId: 1,
        schoolName: '笑联',
        status: 1,
        title: '没水啊',
        type: 1,
        user: '王五',
        userId: 0,
        viewCount: 3
      }
    ],
    size: 0,
    total: 3,
    totalHidden: 1,
    totalNormal: 2
  },
  timestamp: '2018-05-14T03:14:36.199Z'
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
    schoolName: '济南大学(21-30栋)',
    viewCount: 3,
    commentsCount: 1
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
