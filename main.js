// 1. 引入需要的工具
const express = require('express');
const path = require('path');
const xlsx = require('xlsx');
const app = express();
const port = 80;

// 存储登录状态
let loggedInUsers = [];

// 2. 基础设置
app.use(express.urlencoded({ extended: true })); // 解析表单提交的数据
app.use(express.static(__dirname)); // 允许访问当前文件夹里的html文件

// 3. 数据库操作
const dbFile = 'database.xlsx'; // 数据库文件名

// 初始化数据库
function initDatabase() {
  try {
    // 尝试读取已有文件，存在则不做处理
    xlsx.readFile(dbFile);
  } catch (error) {
    // 不存在则创建新表格，带表头和示例数据
    const newData = [
      ['用户名', '密码'],  // 表头
      ['Hacker', 'Hacker']  // 示例用户
    ];
    const worksheet = xlsx.utils.aoa_to_sheet(newData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, '用户表'); // 表格名用中文
    xlsx.writeFile(workbook, dbFile);
    console.log('数据库初始化完成');
  }
}

// 获取所有用户数据
function getAllUsers() {
  const workbook = xlsx.readFile(dbFile);
  const worksheet = workbook.Sheets['用户表'];
  // 强制按文本读取，避免Excel自动转换格式（比如数字变日期）
  return xlsx.utils.sheet_to_json(worksheet, { raw: false });
}

// 保存新用户
function saveNewUser(username, password) {
  const users = getAllUsers();
  const usernameTrimmed = username.trim(); // 自动去除空格
  
  // 检查用户名是否已存在
  for (let i = 0; i < users.length; i++) {
    if (users[i]['用户名'].trim() === usernameTrimmed) {
      return false; // 用户名已存在
    }
  }
  
  // 直接保存原始值
  users.push({
    '用户名': usernameTrimmed,
    '密码': password.trim() // 去除密码前后空格
  });
  
  // 写回Excel文件
  const worksheet = xlsx.utils.json_to_sheet(users);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, '用户表');
  xlsx.writeFile(workbook, dbFile);
  return true; // 保存成功
}

// 验证用户
function checkUser(username, password) {
  const users = getAllUsers();
  const usernameTrimmed = username.trim();
  const passwordTrimmed = password.trim();
  
  // 遍历用户列表，忽略前后空格
  for (let i = 0; i < users.length; i++) {
    if (users[i]['用户名'].trim() === usernameTrimmed && 
        users[i]['密码'].trim() === passwordTrimmed) {
      return true; // 验证通过
    }
  }
  return false; // 验证失败
}

// 检查用户是否已登录
function isLoggedIn(username) {
  return loggedInUsers.includes(username.trim());
}

// 4. 页面路由
// 首页
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 登录页
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// 注册页
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

// 登录后的欢迎页
app.get('/main', (req, res) => {
  const username = req.query.username; // 从URL中获取用户名参数
  
  // 验证登录状态：已登录则显示main.html，否则跳回登录页
  if (username && isLoggedIn(username)) {
    res.sendFile(path.join(__dirname, 'main.html'));
  } else {
    res.redirect('/login'); // 未登录强制跳回登录页
  }
});

// 5. 处理表单提交（登录和注册的逻辑）
// 处理登录请求（表单提交到 /login 时执行）
app.post('/login', (req, res) => {
  const username = req.body.username; // 从登录表单获取用户名
  const password = req.body.password; // 从登录表单获取密码
  
  if (checkUser(username, password)) {
    // 登录成功：记录状态并跳转到main.html（带用户名参数）
    loggedInUsers.push(username.trim());
    // 关键修复：使用redirect跳转到main页面，而不是直接显示文本
    res.redirect(`/main?username=${encodeURIComponent(username)}`);
  } else {
    // 登录失败：显示错误提示
    res.send(`登录失败，请检查您的用户名和密码 <br> <a href="/login">重新登录</a>`);
  }
});

// 处理注册请求（表单提交到 /register 时执行）
app.post('/register', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  
  if (saveNewUser(username, password)) {
    res.send(`注册成功！用户名：${username} <br> <a href="/login">去登录</a>`);
  } else {
    res.send(`注册失败，该用户名已存在 <br> <a href="/register">重新注册</a>`);
  }
});

// 6. 启动服务器
initDatabase(); // 先初始化数据库
app.listen(port, () => {
  console.log('服务器初始化成功');
  console.log(`服务器已启动，访问：http://localhost:${port}`);
  console.log(`您可以使用键盘快捷键Ctrl+C关闭服务器`);
});
