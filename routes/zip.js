import express from 'express';

import { rulesFor } from '../src/renameRules.js';
import { getTemplate } from '../src/templater.js';

var router = express.Router();

function resolveOptions(req) {
  const body = req.body || {};
  const bodyOptions = body.options || body;
  const query = req.query || {};

  return {
    name: bodyOptions.name || query.name,
    id: bodyOptions.id || query.id,
    group: bodyOptions.group || query.group,
    version: bodyOptions.version || query.version
  };
}

async function handleZipRequest(req, res) {
  try {
    const options = resolveOptions(req);
    const version = options.version || "1.21.11";

    if (!options.name || !options.id || !options.group) {
      res.status(400).send('Missing required fields: name, id, group');
      return;
    }

    const renamingRules = rulesFor(options.name, options.id, options.group);

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
}

router.get('/', handleZipRequest);
router.post('/', handleZipRequest);


export default router;
