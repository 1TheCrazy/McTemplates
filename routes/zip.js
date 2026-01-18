import express from 'express';

import { rulesFor } from '../src/renameRules.js';
import { getTemplate } from '../src/templater.js';

var router = express.Router();

router.get('/', async function(req, res, next) {
  try {
    const options = req.body.options;
    const version = "1.21.11"; //req.body.version;
    const renamingRules = rulesFor("NewMod", "newmod", "net.mrgeil.newmod"); //options.name, options.id, options.group

console.log("Generating template with options:", version, renamingRules);

    const zip = await getTemplate(version, renamingRules);

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="template.zip"');

    zip.outputStream.pipe(res);
    zip.end();
  } catch (e) {
    console.error(e); 
    res.status(500).send('Internal Server Error');
  }
});


export default router;