var app = getApp();
const api = require('../../api/api.js')

const MaxRetry = 10;
const DefaultWait = 3;

Page({
  data: {
    imgSrc: "",
    result: "",
    apptips: "戏精的自我修养",
    btnText: "开始",
    canvasshow: true,
    disabled: false,
    emotion: api.emotions.emotion.pouty,
    retryCounter: MaxRetry,
    waitCounter: DefaultWait,
    windowWidth: 0,
    access_token: '24.bc8e1097dcb483cca59be68ddc8061f3.2592000.1586093233.282335-18703800'
  },

  onLoad() {
    console.log("onLoad")
    var that = this
    
    wx.showLoading({
      title: '努力加载中',
      mask: true
    })

    // refresh access_token
    api.refreshToken(app.globalData.baiduapikey, app.globalData.baidusecretkey, {
      success: (res) => {
        that.setData({
          access_token: res
        });

        this.refresh()
      },
      fail: () => {
        console.log("refresh access token failed!!!")
      }
    })

    wx.hideLoading()

    var that = this
    var sysInfo = wx.getSystemInfoSync()
    that.setData({
      windowWidth: sysInfo.windowWidth,
    })

    that.ctx = wx.createCameraContext()
  },

  onReady: function() {
    this.drawText(" ")
  },

  onClickButton: function() {
    this.start();
  },

  start: function() {
    let that = this;
    that.disableStartBtn()
    that.enableText()
    that.refresh()

    setTimeout(()=>{
      that.drawText(that.data.emotion)
    }, 10)

    setTimeout(()=>{
      that.go()
    }, 500)

    // this.data.retryCounter = 0
    // this.refresh()
    // this.detectExpression()
    // this.interval = setInterval(this.onTicker, 1000)
  },

  go: function() {
    let that = this;
    that.drawText("" + that.data.waitCounter)
    let interval = setInterval(() => {
      if (that.data.waitCounter > 1) {
        that.setData({
          waitCounter: that.data.waitCounter - 1
        })
        that.drawText(that.data.waitCounter)
      } else {
        that.setData({
          waitCounter: DefaultWait
        })
        clearInterval(interval)

        that.drawText("Go!")

        that.data.retryCounter = MaxRetry
        that.detectExpression()
        that.interval = setInterval(this.onTicker, 1000)
      }
    }, 1000)
  },

  stop: function() {
    clearInterval(this.interval)
    this.enableStartBtn()
    this.clearText()
  },

  next: function () {
    let that = this
    that.stop()
    console.log("success!!")
    wx.showModal({
      title: "戏精在世",
      content: "挑战下一个！",
      showCancel: true, // 暂时禁掉cancel来测试
      cancelText: "算了",
      confirmText: "继续",
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          that.start();
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    });
  },

  refresh: function() {
    let arr = [];
    arr.push(api.emotions.expression.smile)
    arr.push(api.emotions.expression.laugh)

    arr.push(api.emotions.emotion.neutral)
    arr.push(api.emotions.emotion.angry)
    arr.push(api.emotions.emotion.disgust)
    arr.push(api.emotions.emotion.fear)
    arr.push(api.emotions.emotion.happy)
    arr.push(api.emotions.emotion.sad)
    arr.push(api.emotions.emotion.surprise)
    arr.push(api.emotions.emotion.pouty)
    arr.push(api.emotions.emotion.grimace)

    let r = Math.floor((Math.random() * arr.length))
    let e = arr[r]
    this.setData({
      emotion: e,
      apptips: `开始你的表演吧！表现 “${e}”`,
    })
  },

  drawCountdown: function() {
    let that = this;

    // setTimeout(()=>{
    //   that.drawText(that.data.retryCounter)
    // }, 1)

    that.drawText(that.data.retryCounter)
  },

  drawText:function(text) {
    let that = this
    
    let draw = function (text) {
      const query = wx.createSelectorQuery()
      query.select('#myCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          const canvas = res[0].node
          const ctx = canvas.getContext('2d')

          const dpr = wx.getSystemInfoSync().pixelRatio
          canvas.width = res[0].width * dpr
          canvas.height = res[0].height * dpr
          ctx.scale(dpr, dpr)

          ctx.fillStyle = "#ff0000"
          ctx.font = "80px sans-serif"

          let str = "" + text
          let size = ctx.measureText(str)
          let w = size.width
          let h = 80
          let px = res[0].width / 2 - w / 2
          let py = res[0].height / 2 + h / 2
          console.log(str, w, h, px, py)
          ctx.fillText(str, px, py)
        })
    }
    setTimeout(()=>{
      that.clearText()
      setTimeout(()=>{
        that.enableText()
        setTimeout(()=>{
          draw(text)
        }, 1)
      }, 1)
      
    }, 1)

    
  },

  clearText: function() {
    this.setData({
      canvasshow: false,
    })
  },

  enableText: function() {
    this.setData({
      canvasshow: true,
    })
  },

  enableStartBtn: function() {
    this.setData({
      disabled: false
    })
  },

  disableStartBtn: function() {
    this.setData({
      disabled: true
    })
  },

  onTicker: function() {

    let that = this

    that.drawCountdown()

    if (that.data.retryCounter > 0) {

      that.setData({
        result: "你的表情有点僵硬，调整一下面部肌肉再来一次！",
        retryCounter: this.data.retryCounter - 1,
      })

      that.detectExpression()
    } else {

      that.stop()

      wx.showModal({
        title: "挑战失败",
        content: "咦，你不配做一个合格的戏精，还是放弃吧！",
        showCancel: true, // 暂时禁掉cancel来测试
        cancelText: "算了",
        confirmText: "再来一次",
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定')
            that.start();
          } else if (res.cancel) {
            console.log('用户点击取消')
            that.stop()
          }
        }
      });
    }
  },

  detectExpression() {
    let that = this
    that.setData({
      result: ""
    })
    let takephonewidth;
    let takephoneheight;

    that.ctx.takePhoto({
      quality: 'normal',
      success: (res) => {
        console.log(res.tempImagePath);

        wx.getImageInfo({
          src: res.tempImagePath,
          success: function(res) {
            takephonewidth = res.width,
              takephoneheight = res.height
          }
        })
        that.getEmotion(res.tempImagePath)
      }
    })
  },
  getEmotion: function (filePath) {
    console.log("getEmotion")
    let that = this
    console.log(filePath)
    console.log("getEmotion")
    var start = new Date().getTime(); // 开始时间
    wx.getFileSystemManager().readFile({
      filePath: filePath, //选择图片返回的相对路 径
      encoding: 'base64', //编码格式
      success: res => {

        api.detect(that.data.access_token, res.data, that.data.emotion, (result, resultStr) => {
          console.log(resultStr)

          if (result) {
            var end = new Date().getTime(); // 结束时间
            console.log(end - start);
            this.next()
          } else {
            var end = new Date().getTime(); // 结束时间
            console.log(end - start);
            console.log("failed!!")
          }
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  onShow(options) {
    // Do something when show.

    wx.setKeepScreenOn({
      keepScreenOn: true,
      success: function (res) {
        console.log("屏幕常亮", res)
      },
      fail: function (res) {
        console.log(res)
      }
    })
    console.log(options)
  },

  onHide() {
    // Do something when hide.
    this.stop()
  },

  onError(msg) {
    console.log(msg)
  },

  onStop() {
    this.stop()
  },

  onPageNotFound(res) {
    wx.redirectTo({
      url: 'pages/index/index'
    }) // 如果是 tabbar 页面，请使用 wx.switchTab
  },

  onShareAppMessage: function(options) {
    var self = this;
    console.log("onShareAppMessage", options);

    let shareInfo = {
      title: '戏精的自我修养',
      path: `pages/index/test`,
      success: function(res) {
        // 转发成功
        console.log("转发成功 " + JSON.stringify(res));
        console.log("self.data.cid:" + self.data.cid);
        wx.showToast({
          title: "转发成功",
          icon: "none",
          duration: 2000
        })
      },

      fail: function(res) {
        // 转发失败
        console.log("转发失败2:" + JSON.stringify(res));
        wx.showToast({
          title: "转发失败",
          icon: "none",
          duration: 2000
        })
      }
    }
    console.log("share info ", shareInfo);
    return shareInfo;
  }
})