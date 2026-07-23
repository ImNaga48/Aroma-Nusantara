<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require_once 'database.php';

// Endpoint untuk melihat daftar pesanan (admin)
$orders = fetchAll("SELECT * FROM orders ORDER BY created_at DESC");
foreach ($orders as &$order) {
    $order['items'] = fetchAll("SELECT * FROM order_items WHERE order_id = ?", [$order['id']]);
}
echo json_encode($orders);