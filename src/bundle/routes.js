const express = require('express');
const router = express.Router();
const esbuild = require('esbuild');
const pathutil = require('path');

router.get('/bundle.js', async (req, res) => {
  try {
    const result = await esbuild.build({
      entryPoints: [req.query.entry],
      bundle: true,
      write: false,
      format: 'esm',
      loader: { '.ts': 'ts' },
    });

    res.set('Content-Type', 'application/javascript');
    res.send(result.outputFiles[0].text);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
