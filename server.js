const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());

// 托管前端静态文件（把 index.html 放在 public 文件夹里）
app.use(express.static('public'));

// 数据目录
const DATA_DIR = path.join(__dirname, 'data');
const CODES_FILE = path.join(DATA_DIR, 'codes.json');
const ARTICLES_FILE = path.join(DATA_DIR, 'articles.json');

// 确保数据目录和文件存在
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(CODES_FILE)) fs.writeFileSync(CODES_FILE, '[]');
if (!fs.existsSync(ARTICLES_FILE)) fs.writeFileSync(ARTICLES_FILE, '[]');

// 工具函数
function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function now() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// ========== 代码模板 API ==========
app.get('/api/codes', (req, res) => {
  res.json(readJSON(CODES_FILE));
});

app.post('/api/codes', (req, res) => {
  const { name, code } = req.body;
  if (!name || !code) {
    return res.status(400).json({ error: '名称和代码不能为空' });
  }
  const codes = readJSON(CODES_FILE);
  const newItem = { id: genId(), name, code, created_at: now() };
  codes.push(newItem);
  writeJSON(CODES_FILE, codes);
  res.status(201).json(newItem);
});

app.delete('/api/codes/:id', (req, res) => {
  let codes = readJSON(CODES_FILE);
  const exist = codes.some(c => c.id === req.params.id);
  if (!exist) return res.status(404).json({ error: '未找到该模板' });
  codes = codes.filter(c => c.id !== req.params.id);
  writeJSON(CODES_FILE, codes);
  res.json({ ok: true });
});

// ========== 文章 API ==========
app.get('/api/articles', (req, res) => {
  res.json(readJSON(ARTICLES_FILE));
});

app.post('/api/articles', (req, res) => {
  const { category, title, content } = req.body;
  const validCats = ['男同', '百合', '色情', '科幻'];
  if (!validCats.includes(category)) {
    return res.status(400).json({ error: '无效分类' });
  }
  if (!title || !content) {
    return res.status(400).json({ error: '标题和正文不能为空' });
  }
  const articles = readJSON(ARTICLES_FILE);
  const newItem = { id: genId(), category, title, content, created_at: now() };
  articles.push(newItem);
  writeJSON(ARTICLES_FILE, articles);
  res.status(201).json(newItem);
});

app.delete('/api/articles/:id', (req, res) => {
  let articles = readJSON(ARTICLES_FILE);
  const exist = articles.some(a => a.id === req.params.id);
  if (!exist) return res.status(404).json({ error: '未找到该文章' });
  articles = articles.filter(a => a.id !== req.params.id);
  writeJSON(ARTICLES_FILE, articles);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`✅ 服务已启动：http://localhost:${PORT}`);
});