/**  
 * @param base64Codes  
 *            图片的base64编码  
 */
$(() => {
  let deviceId = sessionStorage.getItem('scanDeviceId');
  //根据设备id获取设备信息
  let user_token = sessionStorage.getItem('user_token');
  $.ajax({
    type: "get",
    url: apiUrl + 'assetaccountinfo/getassetaccountinfo?id=' + deviceId,
    dataType: "text",
    contentType: "application/json",
    success: function (response) {
      let data = JSON.parse(response);
      if (data.IsSuccess == true) {
        if (data.Content.length > 0) {
          let contentArr = data.Content[0];
          let device_name = contentArr.device_name;
          let device_type = contentArr.device_type;
          // sessionStorage.setItem('scanDeviceId', deviceId);
          $('.device_name span').html(device_name).attr('device_type', device_type);
          //获取保养项
          $.ajax({
            type: "get",
            url: apiUrl + 'maintain/getmaintenanceitems?deviceTypeId=' + device_type,
            dataType: "text",
            contentType: "application/json",
            beforeSend: function (request) {
              request.setRequestHeader("Authorization", user_token);
            },
            success: function (response) {
              let data = JSON.parse(response);
              // console.log(data)
              if (data.IsSuccess == true) {
                let content = data.Content;
                $('#content_detail').html(template('content_detail_temp', {
                  mainData: content
                }));
              }
            }
          });
        }
      }
    },
    error: function (error) {
      alert('通讯异常！请联系管理员')
    }
  });


  var height = $(window).height();
  window.onresize = () => {

    if ($(window).height() < height) {
      $(".remarks textarea").focus(function () {
        $('.remarks').css({
          position: 'fixed',
          bottom: '3.7rem',
          width: 'calc(100% - 1.2rem)',
        })
      })
    } else {
      $('.remarks').css({
        position: 'unset',
      })
    }
  };

  //http://172.17.1.100:8089/upload/asset_account/   图片路径+type
  $('div.submit button').on('click', (e) => {
    e.stopImmediatePropagation();
    if ($('.pictrue').length == 0) {
      $('.add_pic').dialog({
        type: 'alert',
        style: 'default', // default、ios、android
        titleText: '<span class="icon iconfont iconGroup-"></span>提示',
        content: '您还未拍摄此次现场保养图片！',
        buttonTextConfirm: '立即去拍摄',
      });
      return;
    };
    //提交
    $('.submit').dialog({
      type: 'confirm',
      style: 'default', // default、ios、android
      titleText: '确认',
      content: '确认提交此次保养记录？',
      onClickConfirmBtn: function () {
        var notice = $('.submit').dialog({
          type: 'notice',
          infoIcon: '../dist/asserts/imgs/icon/loading.gif',
          infoText: '正在提交中'
        });
        //文件上传
        $.ajax({
          type: "post",
          url: apiUrl + 'filemanage/fileupload?type=maintain',
          dataType: "json",
          data: formData,
          cache: false,
          processData: false,
          contentType: false,
          beforeSend: function (request) {
            request.setRequestHeader("Authorization", user_token);
          },
          success: function (response) {
            console.log(response)
            //文件上传成功后保存表单
            let maintenanceData = {
              "remarks": "",
              "picture_path": response,
              "device_id": deviceId,
              "maintenanceitems": []
            };
            let checkInput = $('#content_detail tr input[name=hasMaintain]:checked');
            $.each(checkInput, (index, item) => {
              maintenanceData.maintenanceitems.push({
                maintenance_items_id: item.id
              });
            });
            maintenanceData.remarks = $('.remarks textarea').val();
            console.log(maintenanceData);
            $.ajax({
              url: apiUrl + 'maintain/savemaintenancerecord',
              dataType: 'json',
              type: 'post',
              contentType: "application/json",
              data: JSON.stringify(maintenanceData),
              beforeSend: function (request) {
                request.setRequestHeader("Authorization", user_token);
              },
              success: function (res) {
                if (res.IsSuccess) {
                  notice.update({
                    infoIcon: '../dist/asserts/imgs/icon/success.png',
                    infoText: `提交成功！`,
                    autoClose: 1000,
                    onClosed: function () {
                      window.location.href = 'home.html';
                    }
                  });

                }
              },
              error: function (error) {
                //  alert(JSON.stringify(error));

              }
            })
          },
          error: function (error) {

            //   alert(JSON.stringify(error));

          }
        });

      }
    });
  });
  var formData = new FormData();
  let url = window.location.href;
  $.get('/api/account/getjsauth?url=' + url, function (data) {
    //注入权限验证配置
    wx.config({
      debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
      appId: data.Content.appId,
      timestamp: data.Content.timestamp,
      nonceStr: data.Content.nonceStr,
      signature: data.Content.signature,
      jsApiList: ['chooseImage'] // 必填，调用微信相机
    });
  });
  //调用微信扫一扫接口
  $('#fileInpBtn').on('click', function (e) {
    e.stopImmediatePropagation();
    //首先判断是否使用微信内，因为微信JS-SDK只有在微信环境下才有用
    var environmental = window.navigator.userAgent.toLowerCase();
    if (environmental.match(/MicroMessenger/i) == 'micromessenger') {
      wx.ready(function () {

        wx.chooseImage({
          count: 1, // 默认9
          sizeType: ['compressed', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
          sourceType: ['camera', 'previewImage', 'uploadImage', 'uploadFile'],
          success: function (res) {
            //alert(JSON.stringify(res))
            var localIds = res.localIds[0].toString(); // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
            $(".maintain_pictrue").append(`
                <div class="pictrue">
                  <img src="${localIds}" alt="" isEnlarge="false">
                </div>
              `);
            formData.append('imgs', localIds);
            setTimeout(() => {
              $('.pictrue').on('click', function (e) {
                e.stopImmediatePropagation();
                wx.previewImage({
                  current: e.currentTarget.dataset.src, // 当前显示图片的http链接
                  urls: res.localIds // 需要预览的图片http链接列表
                });
              })
              wx.getLocalImgData({
                localId: localIds,
                success: function (res) {
                  const localData = res.localData;
                  let imageBase64 = '';
                  if (localData.indexOf('data:image') == 0) {
                    //苹果的直接赋值，默认生成'data:image/jpeg;base64,'的头部拼接
                    imageBase64 = localData;
                  } else {
                    //此处是安卓中的唯一得坑！在拼接前需要对localData进行换行符的全局替换
                    //此时一个正常的base64图片路径就完美生成赋值到img的src中了
                    imageBase64 = 'data:image/jpeg;base64,' + localData.replace(/\n/g, '');
                  };
                  var result = {
                    base64: imageBase64,
                    clearBase64: imageBase64.substr(imageBase64.indexOf(',') + 1)
                  };
                  formData.append("imageName", convertBase64UrlToBlob(result.base64), new Date().getTime() + '.jpg')
                }
              });

            }, 100);
          }
        })
      });
    } else {
      alert("请在微信中登录！");
    }
  });

})

function convertBase64UrlToBlob(urlData) {
  var bytes = window.atob(urlData.split(',')[1]); //去掉url的头，并转换为byte

  //处理异常,将ascii码小于0的转换为大于0
  var ab = new ArrayBuffer(bytes.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < bytes.length; i++) {
    ia[i] = bytes.charCodeAt(i);
  }

  return new Blob([ab], {
    type: 'image/jpg'
  });
}