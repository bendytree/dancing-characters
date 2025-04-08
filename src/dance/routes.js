
const _ = require('lodash');
const express = require('express');
const router = express.Router();
const pathutil = require('path');
const fsp = require('fs/promises');
const uploadDirectory = require('../config').uploadDirectory;

router.get('/dance', function(req, res, next) {
  res.render(`${__dirname}/page.ejs`);
});

router.get('/download-jpg', async (req, res) => {
  const path = req.query.path;
  res.sendFile(path);
});

router.get('/get-dance-model', async (req, res) => {
  const dir = uploadDirectory;
  const filenames = await (async () => {
    try {
      return (await fsp.readdir(dir));
    } catch (e) {
      console.log(`DIRECTORY NOT FOUND: ${dir}`);
      return [];
    }
  })();
  let images = [];
  for (const filename of filenames) {
    const fullpath = pathutil.join(dir, filename);
    if (!fullpath.endsWith('.jpg')) continue;
    images.push({
      fullpath,
      character: 'roblox',
      time: parseInt(filename.split('.')?.[0], 10),
      url: `/download-jpg?path=${encodeURIComponent(fullpath)}`,
    });
  }

  images = _.chain(images).sortBy(i => i.time).takeRight(4).value();

  res.send(images);
});

module.exports = router;
