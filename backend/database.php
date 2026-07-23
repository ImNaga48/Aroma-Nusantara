<?php
require_once 'config.php';

// Fungsi helper untuk menjalankan query
function query($sql, $params = []) {
    $db = getDB();
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    return $stmt;
}

function fetchAll($sql, $params = []) {
    return query($sql, $params)->fetchAll();
}

function fetchOne($sql, $params = []) {
    return query($sql, $params)->fetch();
}

function insert($sql, $params = []) {
    query($sql, $params);
    return getDB()->lastInsertId();
}