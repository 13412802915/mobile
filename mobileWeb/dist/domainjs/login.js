/**author: angus qing date: 2019-06-08 des: login page */
$(function () {
  'use strict';
  const authUri = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx9775e49a795e2523&redirect_uri=http://cloud.esdgd.com/webapp/src/login.html&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect';
  let authorizationCode = '';
  let isEmail = function (email) {
    var regex = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
    return regex.test(email);
  };
  let getQueryString = pName => {
    let url = location.search;
    let theRequest = [];
    if (url.indexOf("?") !== -1) {
      let str = url.substr(1);
      let strs = str.split("&");
      for (let i = 0; i < strs.length; i++) {
        theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
      }
    }
    return theRequest[pName];
  };
  let hasLogined = () => {
    let currentUri = window.location.href;
    if (_.includes(currentUri, 'code')) {
      authorizationCode = getQueryString('code');
      return true;
    }
    return false;
  }
  // console.log(apiUrl)
  $(document).on("pageInit", "#login-page", function (e, id, page) {
    $(page).on("click", "#login-btn", function (e) {
      //should write the login logic at here
      var account = $jQuery('#account').val();
      var password = $jQuery('#password').val();
      if (account === '') {
        $.toast('请输入账号');
        return;
      }
      // else if (!isEmail(account)) {
      //   $.toast('账号格式错误，请输入例如xxx@mail.com');
      //   return;
      // }
      // if (password === '') {
      //   $.toast('密码不能为空');
      //   return;
      // }
      let data = JSON.stringify({
        userName: account,
        passWord: password
      })
      var notice = jQuery('.binding-btn').dialog({
        type : 'notice',
        infoIcon: './dist/asserts/imgs/icon/loading.gif',
        infoText: '登录中'
      });
      var ajaxTimeOut = $.ajax({
        url: apiUrl + 'account/login',
        dataType:'json',
        type:'post',
        contentType: "application/json",
        data: data,
        timeout: 10000,
        success: function(res){
          if(res.IsSuccess){
            if(res.Code == '00'){
              sessionStorage.setItem('user_token',"auth "+res.Content.token);
              let use_department = sessionStorage.getItem('use_department');
              let user_msg = {
                dpId: res.Content.dpId,
                isAdmin: res.Content.isAdmin,
                name: res.Content.name
              }
              sessionStorage.setItem("user_msg", JSON.stringify(user_msg));
              notice.update({
                infoIcon: './dist/asserts/imgs/icon/success.png',
                infoText: `登录成功！`,
                autoClose: 1000,
                onClosed: function(){
                  if(use_department == null){
                    jQuery('.binding-btn').dialog({
                      type: 'confirm',
                      style: 'default', // default、ios、android
                      titleText: '确认',
                      content: '此设备不属于您的部门，您没有权限查看该设备！',
                      onClickConfirmBtn: function () {
                        window.location.href = 'src/home.html';
                      }
                    });
                    return;
                  }
                  if(use_department != user_msg.dpId && user_msg.isAdmin == false){
                    jQuery('.binding-btn').dialog({
                      type: 'confirm',
                      style: 'default', // default、ios、android
                      titleText: '确认',
                      content: '此设备不属于您的部门，您没有权限查看该设备！',
                      onClickConfirmBtn: function () {
                        window.location.href = 'src/home.html';
                      }
                    });
                    return;
                  }
                 window.location.href = 'src/ledgerDetail.html';
                }
              });
            }else{
              $jQuery('.binding-btn').dialog({
                type : 'notice',
                // infoIcon: '../dist/asserts/imgs/icon/loading.gif', 
                autoClose: 1000,
                infoText: res.Content
              });
              notice.close();
            }
          }
        },
    　　complete : function(XMLHttpRequest,status){
  　　　　if(status=='timeout'){
  　　　　　 ajaxTimeOut.abort(); 
            $jQuery('.binding-btn').dialog({
              type : 'notice',
              // infoIcon: '../dist/asserts/imgs/icon/loading.gif', 
              autoClose: 1000,
              infoText: '通讯异常遗产，请联系管理员！'
            });
            notice.close();
  　　　　}
    　　}
      })
    });
  });

  $.init();
});