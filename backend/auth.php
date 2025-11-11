<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$usersFile = __DIR__ . '/users.json';
$action = $_GET['action'] ?? '';

// Read users from file
function getUsers() {
    global $usersFile;
    if (!file_exists($usersFile)) {
        file_put_contents($usersFile, '[]');
        return [];
    }
    $content = file_get_contents($usersFile);
    return json_decode($content, true) ?: [];
}

// Save users to file
function saveUsers($users) {
    global $usersFile;
    file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));
}

// Register new user
if ($action === 'register') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['username']) || !isset($data['password'])) {
        echo json_encode(['success' => false, 'message' => 'Missing credentials']);
        exit();
    }
    
    $users = getUsers();
    
    // Check if user already exists
    foreach ($users as $user) {
        if ($user['username'] === $data['username']) {
            echo json_encode(['success' => false, 'message' => 'Username already exists']);
            exit();
        }
    }
    
    // Add new user
    $users[] = [
        'username' => $data['username'],
        'password' => $data['password'],
        'createdAt' => date('Y-m-d H:i:s'),
        'lastLogin' => null
    ];
    
    saveUsers($users);
    
    echo json_encode([
        'success' => true,
        'message' => 'User registered successfully',
        'user' => [
            'username' => $data['username'],
            'createdAt' => $users[count($users) - 1]['createdAt']
        ]
    ]);
    exit();
}

// Login user
if ($action === 'login') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['username']) || !isset($data['password'])) {
        echo json_encode(['success' => false, 'message' => 'Missing credentials']);
        exit();
    }
    
    $users = getUsers();
    
    // Find matching user
    $foundUser = null;
    $userIndex = -1;
    
    foreach ($users as $index => $user) {
        if ($user['username'] === $data['username'] && $user['password'] === $data['password']) {
            $foundUser = $user;
            $userIndex = $index;
            break;
        }
    }
    
    if ($foundUser) {
        // Update last login
        $users[$userIndex]['lastLogin'] = date('Y-m-d H:i:s');
        saveUsers($users);
        
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'username' => $foundUser['username'],
                'createdAt' => $foundUser['createdAt'],
                'lastLogin' => $users[$userIndex]['lastLogin']
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
    }
    exit();
}

// Get all users (for debugging)
if ($action === 'list') {
    $users = getUsers();
    echo json_encode([
        'success' => true,
        'total' => count($users),
        'users' => array_map(function($user) {
            return [
                'username' => $user['username'],
                'createdAt' => $user['createdAt'],
                'lastLogin' => $user['lastLogin']
            ];
        }, $users)
    ]);
    exit();
}

echo json_encode(['success' => false, 'message' => 'Invalid action']);
