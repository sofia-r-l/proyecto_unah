<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Información de debug
$debug = [
    'current_dir' => __DIR__,
    'parent_dir' => dirname(__DIR__),
    'root_dir' => dirname(dirname(dirname(__FILE__))),
    'upload_dir' => dirname(dirname(dirname(__FILE__))) . '/upload/',
    'upload_exists' => is_dir(dirname(dirname(dirname(__FILE__))) . '/upload/'),
    'upload_writable' => is_writable(dirname(dirname(dirname(__FILE__))) . '/upload/'),
    'php_version' => PHP_VERSION,
    'upload_max_filesize' => ini_get('upload_max_filesize'),
    'post_max_size' => ini_get('post_max_size'),
    'max_file_uploads' => ini_get('max_file_uploads')
];

echo json_encode($debug, JSON_PRETTY_PRINT);
?> 