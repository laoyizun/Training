define('KMLang', function () {
    var config = {};

    config['zh-cn'] = {
        code:'zh-cn',
        window: {
            title: '系统提示',
            btnOk: '确定',
            btnCancel:'取消'
        },
        ajax: {
            successMsg: '提交成功',
            errorMsg: '提交失败',
            sysErrMsg: '服务器发生错误',
            formValidateErrMsg: '表单验证错误'
        }
    };

    config['en'] = {
        code:'en',
        window:{
            title: 'Tips',
            btnOk: 'OK',
            btnCancel: 'Cancel'
        },
        ajax: {
            successMsg: 'Submit Success',
            errorMsg: 'Submit Error',
            sysErrMsg: 'System Error',
            formValidateErrMsg: 'Validate Error'
        }
    };

    return config;
});