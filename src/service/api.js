import Taro from '@tarojs/taro'
import { HTTP_STATUS } from '../constants/status'
import { baseUrl } from './config'
import { logError } from '../utils'
import { base64_encode } from '../utils/base64'
import { getCurrentPageUrl } from '../utils/common'

// const token = 'token 27ae876afead592ae19b3ed0dc6368cf47cbc767'
let base64 = base64_encode('huangjianke:hjk19912019')
const token = 'Basic ' + base64

export default {
  baseOptions(params, method = 'GET') {
    let { url, data } = params
    console.log('params', params)
    let contentType = 'application/json'
    contentType = params.contentType || contentType
    const option = {
      url: url.indexOf('http') !== -1 ? url : baseUrl + url,
      data: data,
      method: method,
      header: {
        'content-type': contentType,
        'Authorization': Taro.getStorageSync('Authorization')
      },
      success(res) {
        if (res.statusCode === HTTP_STATUS.NOT_FOUND) {
          return logError('api', '请求资源不存在')
        } else if (res.statusCode === HTTP_STATUS.BAD_GATEWAY) {
          return logError('api', '服务端出现了问题')
        } else if (res.statusCode === HTTP_STATUS.FORBIDDEN) {
          return logError('api', '没有权限访问')
        } else if (res.statusCode === HTTP_STATUS.AUTHENTICATE) {
          Taro.setStorageSync('Authorization', '')
          let path = getCurrentPageUrl()
          if (path !== 'pages/login/login') {
            Taro.navigateTo({
              url: '/pages/login/login'
            })
          }
          return logError('api', '需要鉴权')
        } else if (res.statusCode === HTTP_STATUS.SUCCESS) {
          return res.data
        }
      },
      error(e) {
        logError('api', '请求接口出现问题', e)
      }
    }
    return Taro.request(option)
  },
  get(url, data = '') {
    let option = { url, data }
    return this.baseOptions(option)
  },
  post: function (url, data, contentType) {
    let params = { url, data, contentType }
    return this.baseOptions(params, 'POST')
  }
}


