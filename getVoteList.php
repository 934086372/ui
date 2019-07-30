<?php
/**
 * 网校易学仕
 * Author: Administrator
 * Date: 2018/9/7 0007
 * Time: 16:51
 */


header("Content-type:text/html;charset=utf-8");

include "simple_html_dom.php";

$requests = array();
for ($i = 235; $i <= 350; $i++) {
    array_push($requests, "http://cxwh.kexing100.com:82/index.php?app_act=detail&id={$i}");
}

//$requests = array('http://www.baidu.com', 'http://www.google.com');

$main = curl_multi_init();
$results = array();
$errors = array();
$info = array();

$count = count($requests);

for ($i = 0; $i < $count; $i++) {
    $handles[$i] = curl_init($requests[$i]);
    curl_setopt($handles[$i], CURLOPT_URL, $requests[$i]);
    curl_setopt($handles[$i], CURLOPT_RETURNTRANSFER, 1);
    curl_multi_add_handle($main, $handles[$i]);
}


$running = 0;

do {
    curl_multi_exec($main, $running);
} while ($running > 0);


$arr = array();

echo "<table>";
for ($i = 0; $i < $count; $i++) {
    $output = curl_multi_getcontent($handles[$i]);

    $html = new simple_html_dom();
    $html->load($output);
    $user = $html->find('div[class=dtitle]', 0)->text();
    $voteCount = $html->find('font[id=id_vote]', 0)->text();

    echo "<tr>";
    echo "<td>" . $user . "</td><td>" . $voteCount . "</td>";
    echo "</tr>";

    $errors[] = curl_error($handles[$i]);
    $info[] = curl_getinfo($handles[$i]);
    curl_multi_remove_handle($main, $handles[$i]);

}

echo "</table>";

curl_multi_close($main);


