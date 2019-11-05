$(()=>{
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
          $('.device_name span').html(device_name).attr('device_type',device_type);
          //获取保养项
          $.ajax({
            type: "get",
            url: apiUrl+ 'maintain/getmaintenanceitems?deviceTypeId=' + device_type,
            dataType: "text",
            contentType: "application/json",
            beforeSend: function(request) {
          　　request.setRequestHeader("Authorization", user_token);
            },
            success: function (response) {
              let data = JSON.parse(response);
              // console.log(data)
              if(data.IsSuccess == true){
                let content = data.Content;
                $('#content_detail').html( template('content_detail_temp',{mainData: content}) );
              }
            }
          });
        }
      }
    },error: function(error){
      alert('通讯异常！请联系管理员')
    }
  });

  // $('div.maintain_nav ul li').on('click',(e)=>{
  //   e.stopImmediatePropagation();
  //   //console.log(e.currentTarget);
  //   $(e.currentTarget).addClass('active').siblings().removeClass('active');
  //   $('.'+e.currentTarget.id).show().siblings().hide();
  // });

  var height = $(window).height();
  window.onresize = ()=>{
    // $(".remarks textarea").blur(function(){
    //   $('.remarks').css({
    //     position: 'unset',
    //   })
    // });
    if($(window).height() < height){
      $(".remarks textarea").focus(function(){
        $('.remarks').css({
          position: 'fixed',
          bottom: '3.7rem',
          width: 'calc(100% - 1.2rem)',
        })
      })
    }else{
      $('.remarks').css({
        position: 'unset',
      })
    }
  };

  // $('#add_pic').on('click',(e)=>{
  //   e.stopImmediatePropagation();
    
  // })

  //http://172.17.1.100:8089/upload/asset_account/   图片路径+type
  $('div.submit button').on('click',(e)=>{
    e.stopImmediatePropagation();
    if($('.pictrue').length == 0){
      $('.add_pic').dialog({
        type : 'alert',
        style: 'default',  // default、ios、android
        titleText: '<span class="icon iconfont iconGroup-"></span>提示',
        content: '您还未拍摄此次现场保养图片！',
        buttonTextConfirm: '立即去拍摄',
      });
      return;
    };
    //提交
    $('.submit').dialog({
      type : 'confirm',
      style: 'default',  // default、ios、android
      titleText: '确认',
      content: '确认提交此次保养记录？',
      onClickConfirmBtn: function(){
        var notice = $('.submit').dialog({
          type : 'notice',
          infoIcon: '../dist/asserts/imgs/icon/loading.gif',
          infoText: '正在提交中'
        });
        //文件上传
        $.ajax({
          type: "post",
          url: apiUrl+ 'filemanage/fileupload?type=maintain',
          dataType: "json",
          data: formData,
          cache: false,
          processData:false,
          contentType:false,
          beforeSend: function(request) {
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
            $.each(checkInput,(index,item)=>{
              maintenanceData.maintenanceitems.push({maintenance_items_id: item.id});
            });
            maintenanceData.remarks = $('.remarks textarea').val();
            console.log(maintenanceData);
            $.ajax({
              url: apiUrl + 'maintain/savemaintenancerecord',
              dataType:'text',
              type:'post',
              contentType: "application/json",
              data: JSON.stringify(maintenanceData),
              beforeSend: function(request) {
            　　request.setRequestHeader("Authorization", user_token);
              },
              success: function(res){
                if(res.IsSuccess){

                    notice.update({
                      infoIcon: '../dist/asserts/imgs/icon/success.png',
                      infoText: `提交成功！`,
                      autoClose: 1000,
                      onClosed: function(){
                        window.location.href = 'home.html';
                      }
                    });

                }
              },error: function(error){
                //alert(error.responseText);
                alert(JSON.stringify(error));
                // $('.submit').dialog({
                //   type : 'notice',
                //   infoIcon: '../dist/asserts/imgs/icon/loading.gif',
                //   infoText: error
                // });
              }
            })
          },error: function(error){
            alert(error);
            alert(JSON.stringify(error));
            // $('.submit').dialog({
            //   type : 'notice',
            //   infoIcon: '../dist/asserts/imgs/icon/loading.gif',
            //   infoText: error
            // });
          }
        });

      }
    });
  });
  var formData = new FormData();
  let url = window.location.href;
  // $.get('/api/account/getjsauth?url=' + 'http://app.esdgd.com/mobileApp/src/home.html', function (data) {
  $.get('/api/account/getjsauth?url=' + url, function (data) {

    // console.log(data);
    // $('.result').html(data);
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
  $('#fileInpBtn').on('click',function(e){
    var file = this.files[0];
    
      //首先判断是否使用微信内，因为微信JS-SDK只有在微信环境下才有用
      var environmental= window.navigator.userAgent.toLowerCase();
      if (environmental.match(/MicroMessenger/i) == 'micromessenger') {
          wx.ready(function() {

              wx.chooseImage({
                count: 1, // 默认9
                sizeType: ['compressed','compressed'], // 可以指定是原图还是压缩图，默认二者都有
                sourceType: ['camera','previewImage','uploadImage','uploadFile'],
                success: function (res) {
                  alert(JSON.stringify(res))
                  console.log(file)
                  var localIds = res.localIds[0].toString(); // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
                    $(".maintain_pictrue").append(`
                      <div class="pictrue">
                        <img src="${localIds}" alt="" isEnlarge="false">
                      </div>
                    `);

                  setTimeout(()=>{
		              $('.pictrue').on('click',function(e){
                    e.stopImmediatePropagation();
                      wx.previewImage({
                        current: e.currentTarget.dataset.src, // 当前显示图片的http链接
                        urls: res.localIds // 需要预览的图片http链接列表
                      });
                  })

                    //上传图片
                    $('div.submit button').on('click',(e)=>{
                      e.stopImmediatePropagation();
                      alert(1)
                      wx.uploadImage({
                        localId: res.localIds[0], // 需要上传的图片的本地ID，由chooseImage接口获得
                        isShowProgressTips: 0, // 默认为1，显示进度提示
                        success: function (res) {

                        }
                      })
                    })
                  },100);
                }
              })
            

          });
      }else {
          alert("请在微信中登录！");
      }
  });

})


