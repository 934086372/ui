<?php

    $uid = $_REQUEST['uid'];
    $username = $_REQUEST['username'];
    $portrait = $_REQUEST['portrait'];
    $token = $_REQUEST['token'];


    ?>


<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    <script src="./socket.io.js"> </script>
    <script src="./IMClient.js"></script>
</head>
<body>
    
</body>
<script>
    let client = new IMClient();

    client.connect({
        uid: '<?php echo $uid; ?>',                // 用户id
        username: '<?php echo $username; ?>',           // 用户名
        portrait: '<?php echo $portrait; ?>',           // 头像
        token: '<?php echo $token; ?>',              // 登录token
    },function(data){
        console.log(data);
    });

    client.joinChatRoom({
        chatRoomId: 'room2019'
    }, function(data){
        console.log(data);
    });

</script>
</html>