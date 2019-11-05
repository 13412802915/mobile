$jQuery.namespace('esdpec.framework.core');

Date.prototype.format = function (format) {
  var o = {
    "M+": this.getMonth() + 1, //month
    "d+": this.getDate(), //day
    "h+": this.getHours(), //hour
    "m+": this.getMinutes(), //minute
    "s+": this.getSeconds(), //second
    "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
    "S": this.getMilliseconds() //millisecond
  }
  if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
    (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(format))
      format = format.replace(RegExp.$1,
        RegExp.$1.length == 1 ? o[k] :
          ("00" + o[k]).substr(("" + o[k]).length));
  return format;
}

Date.prototype.addDays = function (days) {
  this.setDate(this.getDate() + days);
  return this;
}

esdpec.framework.core.Config = {
  // BaseWebSiteUrl: 'http://172.17.1.10:8099/',
  APIBaseUrl: 'http://172.17.1.100:8089/api/',
  BaseWebSiteUrl: 'http://cloud.esdgd.com/',
  BaseSiteRoot: 'webapp/',
  ajaxProcessingText: "加载中....",
  ajaxProcessedText: "完成",
  dismissTime: 15000
}

esdpec.framework.core.BaseWeb = esdpec.framework.core.Config.BaseWebSiteUrl + esdpec.framework.core.Config.BaseSiteRoot;
esdpec.framework.core.user_token = () => localStorage.getItem('user_token');
esdpec.framework.core.redirectUrl = esdpec.framework.core.BaseWeb + 'login.html';
esdpec.framework.core.authprefix = 'BasicAuth ';
esdpec.framework.core.redirectLogin = () => {
  if (!!window.parent) window.parent.location.href = esdpec.framework.core.redirectUrl
  else window.location.href = esdpec.framework.core.redirectUrl;
};

esdpec.framework.core.completeRequest = function (XMLHttpRequest, textStatus, onCompleteCallBack) {
  var sessionstatus = XMLHttpRequest.getResponseHeader("sessionstatus");
  var unauthorize = XMLHttpRequest.getResponseHeader("authorize");
  if (sessionstatus === "timeout" || unauthorize === "unauthorize") {
    esdpec.framework.core.redirectLogin();
  }
  if (onCompleteCallBack != null) onCompleteCallBack;
};

esdpec.framework.core.getRequestRandom = function (url) {
  if (_.indexOf(url, '?') > -1) {
    return '&_t=' + new Date().getTime();
  } else
    return '?_t=' + new Date().getTime();
};

esdpec.framework.core.getJsonResult = function (url, successCallBack, failureCallBack) {
//  $.showPreloader('加载中...');
  setTimeout(function () {
    // $.hidePreloader();
  }, esdpec.framework.core.Config.dismissTime);
  
  $jQuery.ajaxSetup({
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", esdpec.framework.core.authprefix + esdpec.framework.core.user_token());
      xhr.setRequestHeader('origin',esdpec.framework.core.Config.BaseWebSiteUrl)
    },
    complete: function (XMLHttpRequest, textStatus) {
      esdpec.framework.core.completeRequest(XMLHttpRequest, textStatus);
    }
  });
  $jQuery.getJSON(this.Config.APIBaseUrl + url + esdpec.framework.core.getRequestRandom(url))
    .done(function (data) {
      debugger;
      $.hidePreloader();
      if (data.Code != undefined && data.Code != null && data.Code == 401) {
        esdpec.framework.core.redirectLogin();
      }
      successCallBack(data);
    })
    .fail(function OnError(xhr, textStatus, err) {
      debugger;
      if (err == "Unauthorized") {
        esdpec.framework.core.redirectLogin();
      }
      if (failureCallBack != null) {
        failureCallBack($jQuery.parseJSON(xhr.responseText));
      }
    });
};

esdpec.framework.core.getJsonResultSilent = function (url, successCallBack, failureCallBack) {
  $jQuery.ajaxSetup({
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", esdpec.framework.core.authprefix + esdpec.framework.core.user_token());
    },
    complete: function (XMLHttpRequest, textStatus) {
      esdpec.framework.core.completeRequest(XMLHttpRequest, textStatus);
    }
  });
  $jQuery.getJSON(this.Config.APIBaseUrl + url + esdpec.framework.core.getRequestRandom(url))
    .done(function (data) {
      if (data.Code != undefined && data.Code != null && data.Code == 401) {
        esdpec.framework.core.redirectLogin();
      }
      successCallBack(data);
    })
    .fail(function OnError(xhr, textStatus, err) {
      if (failureCallBack != null) {
        failureCallBack($jQuery.parseJSON(xhr.responseText));
      }
    });
};

// Web api - Http put operation - record update
esdpec.framework.core.doPutOperation = function (url, object, successCallBack, failureCallBack) {
  $jQuery.ajax({
    url: this.Config.APIBaseUrl + url,
    cache: false,
    type: 'PUT',
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify(object),
    statusCode: {
      200: function (data) {
        successCallBack(data);
      }
    },
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", esdpec.framework.core.authprefix + esdpec.framework.core.user_token());
    },
    complete: function (XMLHttpRequest, textStatus) {
      esdpec.framework.core.completeRequest(XMLHttpRequest, textStatus);
    },
    error: function OnError(xhr, textStatus, err) {
      if (failureCallBack != null) {
        failureCallBack($jQuery.parseJSON(xhr.responseText));
      }
    }
  });
}

// Web api - Http post operation - create record
esdpec.framework.core.doPostOperation = function (url, object, successCallBack, failureCallBack) {
  $jQuery.ajax({
    url: this.Config.APIBaseUrl + url,
    cache: false,
    type: 'POST',
    contentType: 'application/json',
    dataType: "json",
    data: JSON.stringify(object),
    statusCode: {
      200: function (data) {
        successCallBack(data);
      }
    },
    beforeSend: function (xhr) {
      $.showPreloader('加载中...');
      setTimeout(function () {
        $.hidePreloader();
      }, esdpec.framework.core.Config.dismissTime);
      xhr.setRequestHeader("Authorization", esdpec.framework.core.authprefix + esdpec.framework.core.user_token());
    },
    complete: function (XMLHttpRequest, textStatus) {
      $.hidePreloader();
      esdpec.framework.core.completeRequest(XMLHttpRequest, textStatus);
    },
    error: function OnError(xhr, textStatus, err) {
      if (failureCallBack != null) {
        failureCallBack($jQuery.parseJSON(xhr.responseText));
      }
    }
  });
}

// Web api - Http GET operation - create record
esdpec.framework.core.GETget = function (url, object, successCallBack, failureCallBack) {
  $jQuery.ajax({
    url: this.Config.APIBaseUrl + url,
    cache: false,
    type: 'GET',
    contentType: 'application/json',
    dataType: "json",
    data: JSON.stringify(object),
    statusCode: {
      200: function (data) {
        successCallBack(data);
      }
    },
    beforeSend: function (xhr) {
      $.showPreloader('加载中...');
      setTimeout(function () {
        $.hidePreloader();
      }, esdpec.framework.core.Config.dismissTime);
      xhr.setRequestHeader("Authorization", esdpec.framework.core.authprefix + esdpec.framework.core.user_token());
    },
    complete: function (XMLHttpRequest, textStatus) {
      $.hidePreloader();
      esdpec.framework.core.completeRequest(XMLHttpRequest, textStatus);
    },
    error: function OnError(xhr, textStatus, err) {
      if (failureCallBack != null) {
        failureCallBack($jQuery.parseJSON(xhr.responseText));
      }
    }
  });
}

// Web api - Http delete operation - delete a record
esdpec.framework.core.doDeleteOperation = function (url, object, successCallBack, failureCallBack) {
  $jQuery.ajax({
    url: this.Config.APIBaseUrl + url,
    cache: false,
    type: 'DELETE',
    data: JSON.stringify(object),
    contentType: 'application/json; charset=utf-8',
    statusCode: {
      200: function (data) {
        successCallBack(data);
      }
    },
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", esdpec.framework.core.authprefix + esdpec.framework.core.user_token());
    },
    complete: function (XMLHttpRequest, textStatus) {
      esdpec.framework.core.completeRequest(XMLHttpRequest, textStatus);
    },
    error: function OnError(xhr, textStatus, err) {
      if (failureCallBack != null)
        failureCallBack(xhr, textStatus, err);
    }
  });
}