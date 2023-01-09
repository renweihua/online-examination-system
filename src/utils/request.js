import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '../store'
import { getToken, removeToken } from '@/utils/auth'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.BASE_API, // api 的 base_url
  timeout: 5000 // 请求超时时间
})

// request拦截器
service.interceptors.request.use(
  config => {
    let access_token = getToken()
    if (access_token) {
      config.headers['Authorization'] = access_token // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(
  response => {
    /**
     * code为非20000是抛错 可结合自己业务进行修改
     */
    const res = response.data
    if (res.http_status !== 200) {
      Message({
        message: res.msg,
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject('error')
    } else {
      return response.data
    }
  },
  error => {
    console.log('err' + error) // for debug
    let msg = error.msg;
    if (error.response == undefined){
        msg = '超时 ' + timeout + ' ms，请刷新！';
    }else{
        switch (error.response.status) {
            case 404:
                msg = error.response.statusText;
                break;
            case 400:
                msg = error.response.data.msg || error.response.statusText;
                break;
            case 401: // 认证失败
                msg = error.response.data.msg || error.response.statusText;
                // 清除缓存
                sessionStorage.removeItem("userInfo");
                removeToken();

                // 非登录接口弹出提示~
                if (error.response.config.url != '/api/student/auth/login') {
                    MessageBox.confirm(
                      '登录状态已失效，可以取消继续留在该页面，或者重新登录',
                      '登录Token失效-401',
                      {
                        confirmButtonText: '重新登录',
                        cancelButtonText: '取消',
                        type: 'warning'
                      }
                    ).then(() => {
                      store.dispatch('FedLogOut').then(() => {
                        location.reload() // 为了重新实例化vue-router对象 避免bug
                      })
                    })
                }
                break;
            case 500:
                msg = error.response.data.msg || error.response.statusText;
                break;
        }
    }
    Message({
        message: msg,
        type: 'error',
        duration: 5 * 1000
    });
    return Promise.reject(error)
  }
)

export default service
