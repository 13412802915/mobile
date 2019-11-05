
/* jshint unused:false*/
(function($) {
    "use strict";

    var today = new Date();

    var getDays = function(max) {
        var days = [];
        for(var i=1; i<= (max||31);i++) {
            days.push(i < 10 ? "0"+i : i);
        }
        return days;
    };

    var getMinutes   = function () {
        var arr = [];
        for (var i = 0; i <= 59; i++) { arr.push(i < 10 ? '0' + i : i); }
        return arr;
    };
    var getSeconds = getMinutes;

    var getDaysByMonthAndYear = function(month, year) {
        var int_d = new Date(year, parseInt(month)+1-1, 1);
        var d = new Date(int_d - 1);
        return getDays(d.getDate());
    };

    var formatNumber = function (n) {
        return n < 10 ? "0" + n : n;
    };

    var initMonthes = ('01 02 03 04 05 06 07 08 09 10 11 12').split(' ');

    var initYears = (function () {
        var arr = [];
        for (var i = 1950; i <= 2030; i++) { arr.push(i); }
        return arr;
    })();



    var defaults = {
        cssClass: "datetime-picker",
        rotateEffect: false,  //为了性能
        onChange: function (picker, values, displayValues) {
            var days = getDaysByMonthAndYear(picker.cols[1].value, picker.cols[0].value);
            var currentValue = picker.cols[2].value;
            if(currentValue > days.length) currentValue = days.length;
            picker.cols[2].setValue(currentValue);
        }
    };


    // 自定义日期格式
    function getDatetimeConfig(params){
        params = params||{};
        var reg = /yyyy|mm|dd|hh|ii|ss|.+?/g;

        var str = params.format||"yyyy-mm-dd"; // yyyy-mm-dd hh:ii:ss

        var value = [];
        var cols = [];

        var result = null;
        while(result=reg.exec(str)){
            var res = result[0];
            if(res=="yyyy"){
                value.push(today.getFullYear());
                cols.push({
                    values: initYears
                });
            }else if(res=="mm"){
                value.push(formatNumber(today.getMonth()+1));
                cols.push({
                    values: initMonthes
                });
            }else if(res=="dd"){
                value.push(formatNumber(today.getDate()));
                cols.push({
                    values: getDays()
                });
            }else if(res=="hh"){
                value.push(today.getHours());
                cols.push({
                    values: (function () {
                        var arr = [];
                        for (var i = 0; i <= 23; i++) { arr.push(i); }
                        return arr;
                    })()
                });
            }else if(res=="ii"){
                value.push(formatNumber(today.getMinutes()));
                cols.push({
                    values: getSeconds()
                });
            }else if(res=="ss"){
                value.push(formatNumber(today.getSeconds()));
                cols.push({
                    values: getSeconds()
                });
            }else{
                cols.push({
                    divider: true,
                    content: res
                });
            }
        }

        params.value = params.value||value;
        params.cols = params.cols||cols;

        var config = $.extend({},defaults,params);

        return config;
    }

    function DatetimePicker(params){
        var p = getDatetimeConfig(params);
        Picker.call(this,p);
    }

    window.DatetimePicker = DatetimePicker;
})(jQuery);