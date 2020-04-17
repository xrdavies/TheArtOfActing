
var emotion_dict = {
  face_type: {
    human: "人",
    cartoon: "卡通人物"
  },
  gender: {
    male: "男性",
    female: "女性"
  },
  expression: {
    none: "没笑",
    smile: "微笑",
    laugh: "大笑"
  },
  emotion: {
    neutral: "无表情",
    angry: "愤怒",
    disgust: "厌恶",
    fear: "恐惧",
    happy: "高兴",
    sad: "伤心",
    surprise: "惊讶",
    pouty: "撅嘴",
    grimace: "鬼脸"
  },
  glasses: {
    none: "没戴眼镜",
    common: "普通眼镜",
    sun: "墨镜"
  }
}

function refresh_token(appkey, appsecret, callback) {
  wx.request({
    url: "https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=" + appkey + "&client_secret=" + appsecret,
    method: 'POST',
    dataType: "json",
    header: {
      'content-type': 'application/json'
    },
    success: function (res) {
      console.log(res.data.access_token);
      callback.success(res.data.access_token);
    },
    fail:function(res) {
      console.log("refresh token failed!")
      callback.fail()
    }
  })
}

function detect_emotion(accessToken, faceImage, requireEmotion, callback) {
  wx.request({
    url: "https://aip.baidubce.com/rest/2.0/face/v3/detect?access_token=" + accessToken,
    data: {
      image: faceImage,
      image_type: "BASE64",
      face_field: "faceshape,facetype,expression,emotion,gender,glasses",
    },
    method: 'POST',
    dataType: "json",
    header: {
      'content-type': 'application/json'
    },
    success: function (res) {
      if (res.data.error_code === 0) {
        

        let facetype = emotion_dict.face_type[res.data.result.face_list[0].face_type.type];
        let facetype_prob = res.data.result.face_list[0].face_type.probability;

        let gender = emotion_dict.gender[res.data.result.face_list[0].gender.type];
        let gender_prob = res.data.result.face_list[0].gender.probability;

        let expression = emotion_dict.expression[res.data.result.face_list[0].expression.type];
        let expression_prob = res.data.result.face_list[0].expression.probability

        let emotion = emotion_dict.emotion[res.data.result.face_list[0].emotion.type];
        let emotion_prob = res.data.result.face_list[0].emotion.probability;

        let glasses = emotion_dict.glasses[res.data.result.face_list[0].glasses.type];
        let glasses_prob = res.data.result.face_list[0].glasses.probability;

        let resultStr = `${facetype} ${gender} ${expression} ${emotion} ${glasses}`
        // that.setData({
        //   result: result
        // });

        let isCorrect = emotion == requireEmotion || expression == requireEmotion;
        callback(isCorrect, resultStr)

      } else {
        // that.setData({
        //   result: res.data.error_msg
        // })

        callback(false, res.data.error_msg)
      }
    },
    fail: function (res) {
      // that.setData({
      //   result: "请求失败！"
      // })
      callback(false, "请求失败!")
    }
  });
}

module.exports = {
  emotions: emotion_dict,
  detect: detect_emotion,
  refreshToken: refresh_token,
}