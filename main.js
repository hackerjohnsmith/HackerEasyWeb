// 1. 引入需要的工具
const http = require('http');
const https = require('https');
const express = require('express');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const app = express();
const httpPort = 80;
const httpsPort = 443;

// 存储登录状态
let loggedInUsers = [];

// 2. 基础设置
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// 3. 数据库操作
const dbFile = 'database.xlsx';

function initDatabase() {
  try {
    xlsx.readFile(dbFile);
  } catch (error) {
    const newData = [
      ['用户名', '密码'],
      ['Hacker', 'Hacker']
    ];
    const worksheet = xlsx.utils.aoa_to_sheet(newData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, '用户表');
    xlsx.writeFile(workbook, dbFile);
    console.log('数据库初始化完成');
  }
}

function getAllUsers() {
  const workbook = xlsx.readFile(dbFile);
  const worksheet = workbook.Sheets['用户表'];
  return xlsx.utils.sheet_to_json(worksheet, { raw: false });
}

function saveNewUser(username, password) {
  const users = getAllUsers();
  const usernameTrimmed = username.trim();
  
  for (let i = 0; i < users.length; i++) {
    if (users[i]['用户名'].trim() === usernameTrimmed) {
      return false;
    }
  }
  
  users.push({
    '用户名': usernameTrimmed,
    '密码': password.trim()
  });
  
  const worksheet = xlsx.utils.json_to_sheet(users);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, '用户表');
  xlsx.writeFile(workbook, dbFile);
  return true;
}

function checkUser(username, password) {
  const users = getAllUsers();
  const usernameTrimmed = username.trim();
  const passwordTrimmed = password.trim();
  
  for (let i = 0; i < users.length; i++) {
    if (users[i]['用户名'].trim() === usernameTrimmed && 
        users[i]['密码'].trim() === passwordTrimmed) {
      return true;
    }
  }
  return false;
}

function isLoggedIn(username) {
  return loggedInUsers.includes(username.trim());
}

// 4. 页面路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/main', (req, res) => {
  const username = req.query.username;
  if (username && isLoggedIn(username)) {
    res.sendFile(path.join(__dirname, 'main.html'));
  } else {
    res.redirect('/login');
  }
});

// 5. 处理表单提交
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  
  if (checkUser(username, password)) {
    loggedInUsers.push(username.trim());
    res.redirect(`/main?username=${encodeURIComponent(username)}`);
  } else {
    res.send(`登录失败，请检查您的用户名和密码 <br> <a href="/login">重新登录</a>`);
  }
});

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
initDatabase();

// 配置HTTPS证书
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, 'cert', 'private.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert', 'certificate.pem'))
};

// 启动HTTPS服务器
https.createServer(httpsOptions, app).listen(httpsPort, () => {
  console.log(`HTTPS服务器已启动，访问：https://localhost:${httpsPort}`);
});

// 启动HTTP服务器
http.createServer((req, res) => {
  // 将所有HTTP请求重定向到HTTPS
  res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
  res.end();
}).listen(httpPort, () => {
  console.log(`HTTP服务器已启动，访问：http://localhost:${httpPort}`);
  console.log(`您可以使用键盘快捷键Ctrl+C关闭服务器`);
});