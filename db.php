<?php
/**
 * 网校易学仕
 * Author: Administrator
 * Date: 2018/9/6 0006
 * Time: 15:21
 */
$link = mysqli_connect("rm-bp11686mf82b8943ho.mysql.rds.aliyuncs.com","gz_developer","gz_developer_213213","gzteacher") or die("数据库链接失败");
$query = "select * from course" ;
$ret = mysqli_query($link,$query);
while($row = mysqli_fetch_assoc($ret)){
      print_r($row);
}


