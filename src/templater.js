import { Readable } from "node:stream";
import unzipper from "unzipper";

import { renameTemplateFiles } from "./templateRenamer.js";

export async function getTemplate(version, nameRules){
    const zip = await fetchTemplate(version);
    return await renameTemplateFiles(zip, nameRules);
}

async function fetchTemplate(version){
    let url = `https://github.com/jaredlll08/MultiLoader-Template/archive/refs/heads/${version}.zip`;
    
    const res = await fetch(url);

    // Make sure we have valid stuff
    if(!res.ok) return null;

    const buffer = await res.arrayBuffer();
    const zip = await unzipper.Open.buffer(Buffer.from(buffer));

    return zip;
}