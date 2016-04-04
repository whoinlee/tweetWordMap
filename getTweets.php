<?php
session_start();
require_once("twitteroauth/twitteroauth/twitteroauth.php");

$twitteruser = "aRollingBall";
$notweets = 100;
$consumerkey = "ubr6TmhS6aWQtQvbMeCEchLiO";
$consumersecret = "fGww6mxhF307GkC7FDNvQY96l9pzQ9KNoASyXqM669Clmuitui";
$accesstoken = "45594040-Lf9errYA5311y02ObTX6RNFDN8z2EH4pisaBUNZ8f";
$accesstokensecret = "RUO7z6aFZqkTLTLiMyFFFKKGpx8stiwhgNgkZalrIFDMz";

$connection = new TwitterOAuth($consumerkey, $consumersecret, $accesstoken, $accesstokensecret);
$tweets = $connection->get("https://api.twitter.com/1.1/statuses/home_timeline.json?count=".$notweets."&exclude_replies=true");
echo json_encode($tweets);
?>
