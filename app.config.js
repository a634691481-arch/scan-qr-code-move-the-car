// 引入自定义公共函数
import myPubFunction from '@/common/function/myPubFunction.js'
import { versionName } from '/manifest.json'

export default {
  debug: process.env.NODE_ENV !== 'production',
  functionName: 'router',
  versionName,

  login: {
    url: '/pages/login/index',
  },
  imageUrl: 'http://cdn.diaodiandaren.com',
  index: {
    url: '/pages/index/index',
  },
  error: {
    url: '/pages/error/404/404',
  },
  targetTimezone: 8,
  logger: {
    colorArr: ['#0095f8', '#67C23A'],
  },

  color: {
    main: '#ff4444',
    secondary: '#555555',
  },
  checkTokenPages: {
    /**
     * 如果 mode = 0 则代表自动检测
     * 如果 mode = 1 则代表list内的页面需要登录，不在list内的页面不需要登录
     * 如果 mode = 2 则代表list内的页面不需要登录，不在list内的页面需要登录
     * 注意1: list内是通配符表达式，非正则表达式
     * 注意2: 需要使用 vk.navigateTo 代替 uni.navigateTo 进行页面跳转才会生效
     * 注意3: 想要让 tabbar 页面必须登录才能访问，则需要手动在页面的onLoad里加 vk.pubfn.checkLogin();
     * 在无需登录的页面上执行kh或sys函数，也会自动判断是否登录，未登录会自动跳登录页面，登录成功后会自动返回本来要跳转的页面。
     */
    mode: 2,
    list: ['/pages/index/*', '/pages/login/index'],
  },
  checkSharePages: {
    /**
     * 如果 mode = 0 则不做处理
     * 如果 mode = 1 则代表list内的页面可以被分享，不在list内的页面不可以被分享
     * 如果 mode = 2 则代表list内的页面不可以被分享，不在list内的页面可以被分享
     * 注意: list内是通配符表达式，非正则表达式
     */
    mode: 2,
    // ['shareAppMessage', 'shareTimeline'],
    menus: ['shareAppMessage', 'shareTimeline'],
    list: [],
  },
  checkEncryptRequest: {
    mode: 1,
    list: ['^template/test/pub/testEncryptRequest$', '^template/encrypt/(.*)'],
  },
  staticUrl: {
    // Logo
    logo: '/static/logo.png',
  },
  myfn: myPubFunction,
  service: {
    cloudStorage: {
      defaultProvider: 'unicloud',
      unicloud: {},
      extStorage: {
        provider: 'qiniu',
        dirname: 'public',
        authAction: 'user/pub/getUploadFileOptionsForExtStorage',
        domain: '',
        groupUserId: false,
      },

      aliyun: {
        uploadData: {
          OSSAccessKeyId: '',
          policy: '',
          signature: '',
        },
        action: 'https://xxx.oss-cn-hangzhou.aliyuncs.com',
        dirname: 'public',
        host: 'https://xxx.xxx.com',
        groupUserId: false,
      },
    },
  },
  globalErrorCode: {
    'cloudfunction-unusual-timeout': '请求超时，但请求还在执行，请重新进入页面。',
    'cloudfunction-timeout': '请求超时，请重试！',
    'cloudfunction-system-error': '网络开小差了！',
    'cloudfunction-reaches-burst-limit': '系统繁忙，请稍后再试。',
    'cloudfunction-network-unauthorized': '需要进行网络请求许可，若您已授权，请点击确定',
  },
  interceptor: {
    login: function (obj) {
      return true
    },
    fail: function (obj) {
      let { vk, params, res } = obj
      return false
    },
  },
}
