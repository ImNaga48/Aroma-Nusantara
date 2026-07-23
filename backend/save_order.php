<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['items'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Data tidak lengkap']);
    exit;
}

$customer_name = $input['customer_name'] ?? 'Tanpa Nama';
$table_number = $input['table_number'] ?? '0';
$total = $input['total'] ?? 0;
$payment_method = $input['payment_method'] ?? 'qris';
$items = $input['items'];

try {
    $db = getDB();
    $db->beginTransaction();

    // Insert order
    $orderId = insert(
        "INSERT INTO orders (customer_name, table_number, total, payment_method, created_at) VALUES (?, ?, ?, ?, NOW())",
        [$customer_name, $table_number, $total, $payment_method]
    );

    // Insert order items
    $stmt = $db->prepare("INSERT INTO order_items (order_id, menu_id, menu_name, price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?)");
    foreach ($items as $item) {
        $stmt->execute([
            $orderId,
            $item['menu_id'],
            $item['nama'],
            $item['harga'],
            $item['quantity'],
            $item['subtotal']
        ]);
    }

    $db->commit();
    echo json_encode(['success' => true, 'order_id' => $orderId]);
} catch (Exception $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Gagal menyimpan pesanan: ' . $e->getMessage()]);
}