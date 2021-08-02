<?php
 class AjaxResponse {
	var $special;
	var $message;
	var $response;
	var $data;
	
	function __construct($special=false, $message='', $response='', $data=array()) {
		$this->special = $special;
		$this->message = $message;
		$this->response = $response;
		$this->data = $data;
	}
	
	function spit() {
		echo(json_encode($this));
	}
}

$op = '';
if (isset($_GET['op'])) {
	$op = $_GET['op'];
}
else if (isset($_POST['op'])) {
	$op = $_POST['op'];
}


$headers = 'From:'. $from . "\r\n"; // Set from headers

 
mail($op, "Make a map on Reprsentable!", "test", $headers);

$rval = new AjaxResponse(false, $op, 'email sent!', array());
$rval->spit();

?>