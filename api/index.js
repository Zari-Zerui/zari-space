const express = require('express');
const app = express();
app.use(express.json());

// 内存存储（Vercel重启会清空，但先让网站跑起来）
let codes = [];
let articles = [];

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
  res.json(codes);
});

app.post('/api/codes', (req, res) => {
  const { name, code } = req.body;
  if (!name || !code) return res.status(400).json({ error: '名称和代码不能为空' });
  const newItem = { id: genId(), name, code, created_at: now() };
  codes.push(newItem);
  res.status(201).json(newItem);
});

app.delete('/api/codes/:id', (req, res) => {
  codes = codes.filter(c => c.id !== req.params.id);
  res.json({ ok: true });
});

// ========== 文章 API ==========
app.get('/api/articles', (req, res) => {
  res.json(articles);
});

app.post('/api/articles', (req, res) => {
  const { category, title, content } = req.body;
  const validCats = ['男同', '百合', '色情', '科幻'];
  if (!validCats.includes(category)) return res.status(400).json({ error: '无效分类' });
  if (!title || !content) return res.status(400).json({ error: '标题和正文不能为空' });
  const newItem = { id: genId(), category, title, content, created_at: now() };
  articles.push(newItem);
  res.status(201).json(newItem);
});

app.delete('/api/articles/:id', (req, res) => {
  articles = articles.filter(a => a.id !== req.params.id);
  res.json({ ok: true });
});

module.exports = app;