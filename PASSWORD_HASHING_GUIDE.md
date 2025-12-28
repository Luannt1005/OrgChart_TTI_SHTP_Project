# Hướng dẫn cập nhật Google Apps Script cho Password Hashing

## Tổng quan
Hệ thống đã được nâng cấp để sử dụng **bcrypt** hash cho password, đảm bảo security cao hơn.

## Các thay đổi

### 1. Password Hashing
- **Signup**: Password được hash bằng bcrypt (salt rounds = 10) trước khi lưu vào database
- **Login**: Password được verify bằng bcrypt.compare() thay vì so sánh plain text
- **Pattern**: Bcrypt hash format: `$2a$10$...` (60 ký tự)

### 2. Cập nhật Google Apps Script

Bạn cần cập nhật Google Apps Script để hỗ trợ action mới `getUser`:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    // Existing signup logic
    if (!action || action === 'signup') {
      return handleSignup(data);
    }
    
    // NEW: Get user for login verification
    if (action === 'getUser') {
      return getUser(data.username);
    }
    
    // Existing login logic (DEPRECATED - sẽ không dùng nữa)
    return handleLogin(data);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// NEW FUNCTION: Get user by username
function getUser(username) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
  const data = sheet.getDataRange().getValues();
  
  // Find user by username (case-insensitive)
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toLowerCase() === username.toLowerCase()) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        user: {
          username: data[i][0],
          password: data[i][1], // Hashed password
          name: data[i][2],
          email: data[i][3] || '',
          role: data[i][4] || 'user'
        }
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // User not found
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    message: 'User not found'
  })).setMimeType(ContentService.MimeType.JSON);
}

// UPDATE SIGNUP: Password đã được hash từ client
function handleSignup(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
  const { username, password, full_name } = data;
  
  // Check if username exists
  const existingData = sheet.getDataRange().getValues();
  for (let i = 1; i < existingData.length; i++) {
    if (existingData[i][0].toLowerCase() === username.toLowerCase()) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Username already exists'
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // Add new user (password is already hashed)
  sheet.appendRow([username, password, full_name, '', 'user', new Date()]);
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Account created successfully'
  })).setMimeType(ContentService.MimeType.JSON);
}
```

### 3. Cấu trúc Database (Google Sheets)

Sheet name: **Users**

| Column A | Column B | Column C | Column D | Column E | Column F |
|----------|----------|----------|----------|----------|----------|
| username | password | full_name | email | role | created_at |
| admin | $2a$10$... | Admin User | admin@example.com | admin | 2025-01-01 |

**Lưu ý**: 
- Column B (password) bây giờ lưu bcrypt hash (60 ký tự)
- Không thể đọc được password gốc từ hash

### 4. Migration cho User hiện tại

Nếu bạn có users với plain text password, cần:
1. Tạo tài khoản mới qua signup form (password sẽ tự động hash)
2. Hoặc sử dụng tool migration (tôi có thể tạo nếu cần)

### 5. Testing

Test signup:
```bash
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123","full_name":"Test User"}'
```

Test login:
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

## Security Benefits

✅ **Password không thể đọc được**: Ngay cả admin cũng không thể xem password gốc
✅ **Chống brute force**: Bcrypt rất chậm, khó brute force
✅ **Salt tự động**: Mỗi password có salt riêng
✅ **Industry standard**: Bcrypt được khuyến nghị bởi OWASP

## Troubleshooting

**Lỗi: "Sai tài khoản hoặc mật khẩu"**
- Kiểm tra Google Apps Script đã cập nhật action `getUser`
- Kiểm tra password trong database đã được hash chưa

**Lỗi: "Lỗi hệ thống"**
- Kiểm tra console log trong Next.js
- Kiểm tra Google Apps Script execution log
