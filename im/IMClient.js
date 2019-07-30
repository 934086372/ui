// importScripts("https://cdn.bootcss.com/socket.io/2.0.3/socket.io.js");

(function (window) {

})(window);

var IMClient = function () {
};

if (typeof io !== 'undefined') {
    IMClient = function () {
        //const host = 'http://192.168.1.18:8080'; // 私有属性
        //const imageServer = 'http://192.168.1.18/socketio/src/php/getOssSignature.php';
        const host = 'http://116.62.208.158:8081'; // 服务器环境
        const imageServer = 'http://im.seevin.com/src/php/getOssSignature.php';  //服务器环境
        let connectUser = {};
        this.client = {};
        this.get = function () {
            return host;
        };
        this.getImageServer = function () {
            return imageServer;
        };
        this.setSelfUser = function (user) {
            connectUser = user;
        };

        this.getSelfUser = function () {
            return connectUser;
        };
    };

    // 参数检测公共方法
    IMClient.prototype.paramsCheck = function (params) {

        // 参数检测
        var checkResult = {};
        if (typeof params !== 'object') {
            checkResult.code = 10010;
            checkResult.msg = 'unexpected arguments!';
            return;
        }
        if (typeof params.userId === 'undefined') {
            checkResult.code = 10011;
            checkResult.msg = 'missing argument userId!';
        }
        else if (typeof params.chatRoomId === 'undefined') {
            checkResult.code = 10012;
            checkResult.msg = 'missing argument chatRoomId!';
            return;
        }
        else if (typeof params.userId !== 'string' || typeof params.chatRoomId !== 'string') {
            checkResult.code = 10013;
            checkResult.msg = 'arguments userId & chatRoomId should be string!';
            return;
        } else {
            checkResult = true;
        }
        return checkResult;
    };

    // 初始化操作
    IMClient.prototype.connect = function (param, callback) {

        // 参数检测
        if (typeof callback !== 'function') {
            callback = function (data) {
                console.log.call(this, data);
            };
        }

        if (typeof param === 'object') {
            if (typeof param.uid === 'undefined') {
                callback('uid is required');
                return;
            } else if (typeof param.username === 'undefined') {
                callback('username is required');
                return;
            }
            else if (typeof param.portrait === 'undefined') {
                callback('portrait is required');
                return;
            }
            else if (typeof param.token === 'undefined') {
                callback('token is required');
                return;
            }
        } else {
            callback('invalid init param!');
            return;
        }

        this.setSelfUser({
            id: param.uid,
            name: param.username,
            portrait: param.portrait,
        });

        var host = this.get();
        this.client = io(host, {
            forceNew: false,
            query: param
        });

        this.client.on('connect', function () {
            callback('connecting');
        });

    };

    // 连接状态监听器
    IMClient.prototype.setConnectionStatusListener = function (callback) {
        if (typeof callback === 'function') {
            this.client.on('connectStatus', function (status) {
                callback(status);
            })
        } else {
            console.log.call(this, 'missing arguments');
        }
    };

    // 消息监听器
    IMClient.prototype.setOnReceiveMessageListener = function (callback) {
        if (typeof callback === 'function') {
            this.client.on('new_message', function (data) {
                callback(data);
            });
        } else {
            console.log.call(this, 'missing arguments');
        }
    };

    // 发送消息
    IMClient.prototype.sendMessage = function (params, callback = '') {

        var _self = this;

        var error = {
            code: 0,
            msg: '',
        };

        // 回调参数检测, 先检测回调函数是否存在
        if (typeof callback !== 'function') {
            callback = function (data) {
                console.log.call(_self, data);
            }
        }

        // 请求参数检测
        if (typeof params !== 'object') {
            error.code = 10010;
            error.msg = 'unexpected arguments!';
            callback(error);
            return;
        }
        var conversationType = params.conversationType;
        var target = params.target;
        var message = params.message;
        if (typeof conversationType === 'undefined') {
            error.code = 10011;
            error.msg = "missing arguments 'conversationType' ";
            callback(error);
            return;
        } else if (typeof target !== 'object' || !target.id) {
            error.code = 10012;
            error.msg = "missing arguments 'target'!";
            callback(error);
            return;
        } else if (typeof message !== 'object' || !message.type) {
            error.code = 10013;
            error.msg = "missing arguments 'msg'!";
            callback(error);
            return;
        }

        // 组装发送的消息对象
        var sendMsgItem = {
            conversationType: conversationType,
            message: message,
            target: target,
            sender: _self.getSelfUser(),
        };

        switch (message.type) {
            case 'IM:ImgMsg':
                // 发送的图片消息
                var imageServer = _self.getImageServer();
                var fileItem = message.file;
                new Promise(function (resolve, reject) {
                    // 第一步 获取签名
                    var request = new XMLHttpRequest();
                    request.open('post', imageServer);
                    request.send({'folder': sendMsgItem.sender.id});
                    request.onreadystatechange = function () {
                        if (request.readyState === 4) {
                            if (request.status === 200) {
                                var responseData = JSON.parse(request.response);
                                resolve(responseData);
                            } else {
                                reject('oss签名获取失败');
                            }
                        }
                    }
                }).then(function (signatureData) {
                    // 第二步 上传图片
                    return new Promise(function (resolve, reject) {
                        var filename = new Date().getTime() + '_' + fileItem.name;
                        var fileUrl = signatureData.host + '/' + signatureData.dir + filename;

                        var formData = new FormData();
                        formData.append('OSSAccessKeyId', signatureData.accessid);
                        formData.append('policy', signatureData.policy);
                        formData.append('Signature', signatureData.signature);
                        formData.append('key', signatureData.dir + filename);
                        formData.append('success_action_status', '200');
                        formData.append('file', fileItem);

                        var uploadRequest = new XMLHttpRequest();
                        uploadRequest.open('post', signatureData.host);
                        // 返回进度
                        uploadRequest.upload.onprogress = function (ev) {
                            var progress = ev.loaded / ev.total * 100;
                            var progressCallback = {
                                code: 204,
                                msg: 'uploading',
                                data: progress,
                            };
                            callback(progressCallback);
                        };
                        uploadRequest.onreadystatechange = function () {
                            if (uploadRequest.readyState === 4) {
                                if (uploadRequest.status == 200) {
                                    resolve(fileUrl);
                                } else {
                                    reject();
                                }
                            }
                        };
                        uploadRequest.send(formData);
                    });
                }, function () {
                    error.code = 10014;
                    error.msg = "image server get signature fail!";
                    callback(error);
                }).then(function (imgUrl) {
                    // 第三步，组装图片消息对象
                    sendMsgItem.message = {
                        type: 'IM:ImgMsg',
                        content: imgUrl, // 图片
                        extra: sendMsgItem.message.extra
                    };
                    // 发送消息
                    _self.client.emit('send_message', sendMsgItem, function (response) {
                        callback(JSON.parse(response));
                    });
                }, function () {
                    // 图片上传失败
                    error.code = 10015;
                    error.msg = "image upload fail!";
                    callback(error);
                });
                break;
            default:
                console.log(sendMsgItem);
                // 发送消息, 文本消息
                _self.client.emit('send_message', sendMsgItem, function (response) {
                    callback(JSON.parse(response));
                });
        }

    };

    // 加入聊天室
    IMClient.prototype.joinChatRoom = function (params, callback = '') {
        // 参数检测
        var error = {};
        if (typeof callback !== 'function') {
            callback = function (data) {
                console.log.call(this, data);
            };
        }
        if (typeof params !== 'object') {
            error.code = 10010;
            error.msg = 'unexpected arguments!';
            callback(error);
            return;
        }
        if (typeof params.chatRoomId === 'undefined') {
            error.code = 10011;
            error.msg = 'missing argument chatRoomId!';
            callback(error);
            return;
        }
        this.client.emit('joinChatRoom', params.chatRoomId, function (data) {
            callback(JSON.parse(data));
        });
    };

    // 离开聊天室
    IMClient.prototype.quitChatRoom = function (params, callback = '') {
        // 参数检测
        var error = {};
        if (typeof callback !== 'function') {
            callback = function (data) {
                console.log.call(this, data);
            };
        }
        if (typeof params !== 'object') {
            error.code = 10010;
            error.msg = 'unexpected arguments!';
            callback(error);
            return;
        }
        if (typeof params.chatRoomId === 'undefined') {
            error.code = 10011;
            error.msg = 'missing argument chatRoomId!';
            callback(error);
            return;
        }
        this.client.emit('quitChatRoom', params.chatRoomId, function (data) {
            callback(JSON.parse(data));
        });
    };

    // 获取聊天室信息
    IMClient.prototype.getChatRoomInfo = function (params, callback = '') {
        // 参数检测
        var error = {};
        if (typeof callback !== 'function') {
            callback = function (data) {
                console.log.call(this, data);
            };
        }
        if (typeof params !== 'object') {
            error.code = 10010;
            error.msg = 'unexpected arguments!';
            callback(error);
            return;
        }
        if (typeof params.chatRoomId === 'undefined') {
            error.code = 10011;
            error.msg = 'missing argument chatRoomId!';
            callback(error);
            return;
        }
        this.client.emit('getChatRoomInfo', params.chatRoomId, function (data) {
            if (typeof callback === 'function') {
                callback(JSON.parse(data));
            }
        });
    };

    // 禁言用户, 不传所有地方都禁言
    IMClient.prototype.addToBlockList = function (params, callback = '') {

        // 参数检测
        var checkResult = this.paramsCheck(params);
        if (checkResult !== true) {
            if (typeof callback === 'function') callback(checkResult);
            return;
        }
        this.client.emit('addToBlockList', params.userId, params.chatRoomId, function (response) {
            if (typeof callback === 'function') callback(JSON.parse(response));
        });
    };

    // 封禁用户，不传所有地方都封禁
    IMClient.prototype.addToBlackList = function (params, callback = '') {
        // 参数检测
        var checkResult = this.paramsCheck(params);
        if (checkResult !== true) {
            if (typeof callback === 'function') callback(checkResult);
            return;
        }
        this.client.emit('addToBlackList', params.userId, params.chatRoomId, function (response) {
            if (typeof callback === 'function') callback(JSON.parse(response));
        });
    };

    // 解除禁言
    IMClient.prototype.removeFromBlockList = function (params, callback = '') {
        // 参数检测
        var checkResult = this.paramsCheck(params);
        if (checkResult !== true) {
            if (typeof callback === 'function') callback(checkResult);
            return;
        }
        this.client.emit('removeFromBlockList', params.userId, params.chatRoomId, function (response) {
            if (typeof callback === 'function') callback(JSON.parse(response));
        });
    };

    // 解除封禁
    IMClient.prototype.removeFromBlackList = function (params, callback) {
        // 参数检测
        var checkResult = this.paramsCheck(params);
        if (checkResult !== true) {
            if (typeof callback === 'function') callback(checkResult);
            return;
        }
        this.client.emit('removeFromBlackList', params.userId, params.chatRoomId, function (response) {
            if (typeof callback === 'function') callback(JSON.parse(response));
        });
    };

    // 获取禁言用户列表
    IMClient.prototype.getBlockList = function (params, callback) {
        // 参数检测
        var error = {};
        if (typeof callback !== 'function') {
            callback = function (data) {
                console.log.call(this, data);
            };
        }
        if (typeof params !== 'object') {
            error.code = 10010;
            error.msg = 'unexpected arguments type!';
            callback(error);
            return;
        }
        else if (typeof params.chatRoomId === 'undefined') {
            error.code = 10012;
            error.msg = 'missing argument chatRoomId!';
            callback(error);
            return;
        }
        else if (typeof params.chatRoomId !== 'string') {
            error.code = 10012;
            error.msg = "arguments 'chatRoomId' should be string!";
            callback(error);
            return;
        }
        this.client.emit('getBlockList', params.chatRoomId, function (response) {
            callback(JSON.parse(response));
        });
    };

    // 获取封禁用户列表
    IMClient.prototype.getBlackList = function (params, callback) {
        // 参数检测
        var error = {};
        if (typeof callback !== 'function') {
            callback = function (data) {
                console.log.call(this, data);
            };
        }
        if (typeof params !== 'object') {
            error.code = 10010;
            error.msg = 'unexpected arguments type!';
            callback(error);
            return;
        }
        else if (typeof params.chatRoomId === 'undefined') {
            error.code = 10012;
            error.msg = 'missing argument chatRoomId!';
            callback(error);
            return;
        }
        else if (typeof params.chatRoomId !== 'string') {
            error.code = 10012;
            error.msg = "arguments 'chatRoomId' should be string!";
            callback(error);
            return;
        }
        this.client.emit('getBlackList', params.chatRoomId, function (response) {
            callback(JSON.parse(response));
        });
    };

    // 获取直播状态
    IMClient.prototype.getLivingStatus = function (params, callback) {
        // 参数检测
        var error = {};
        if (typeof callback !== 'function') {
            callback = function (data) {
                console.log.call(this, data);
            };
        }
        if (typeof params !== 'object') {
            error.code = 10010;
            error.msg = 'unexpected arguments type!';
            callback(error);
            return;
        }
        else if (typeof params.chatRoomId === 'undefined') {
            error.code = 10012;
            error.msg = 'missing argument chatRoomId!';
            callback(error);
            return;
        }
        else if (typeof params.chatRoomId !== 'string') {
            error.code = 10012;
            error.msg = "arguments 'chatRoomId' should be string!";
            callback(error);
            return;
        }
        this.client.emit('getLivingStatus', params.chatRoomId, function (response) {
            callback(JSON.parse(response));
        });
    }

} else {
    console.log.call(this, "missing socket.io dependency!");
}

