
const express = require('express');
const router = express.Router();
const pathutil = require('path');
const fsp = require('fs/promises');
const uploadDirectory = require('../config').uploadDirectory;

router.get('/', function(req, res, next) {
  res.render(`${__dirname}/page.ejs`);
});

router.post('/upload-jpg', async (req, res) => {
  const base64Data = req.body.jpg.replace(/^data:image\/jpeg;base64,/, '');
  const dir = uploadDirectory;
  await fsp.mkdir(dir, { recursive: true });
  const filepath = pathutil.join(dir, `${Date.now()}.jpg`);

  try {
    await fsp.writeFile(filepath, base64Data, 'base64');
    res.json({ ok: true });
  }catch (err){
    res.json({ error: String(err) });
  }
});

module.exports = router;
