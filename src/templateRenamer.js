import yazl from "yazl";

export async function renameTemplateFiles(zip, nameRules){
    const outZip = new yazl.ZipFile();

    for (const element of zip.files) {
        if (element.type !== "File") continue;

        const oldPath = element.path;
        let buf = await element.buffer();
        
        let newPath = oldPath;
        // -- Apply Path-Level renaming rules --

        // Remove top-level folder
        newPath = newPath.split("/").slice(1).join("/"); 
        // Replace paths
        newPath = newPath.replace("com/example/examplemod", nameRules.group.replace(/\./g, "/"));
        newPath = newPath.replace("com.example.examplemod", nameRules.group.replace(/\./g, "/")); // META-INF
        newPath = newPath.replace("examplemod", nameRules.id);
        // Replace ModInitializer files
        newPath = newPath.replace("ExampleMod", nameRules.name);

        // -- Apply File-Level renaming rules --
        if(newPath.endsWith(".java")){
            let content = buf.toString("utf-8");
            content = content.replaceAll("com.example.examplemod", nameRules.group);

            buf = Buffer.from(content, "utf8");
        }

        if(newPath.endsWith("gradle.properties")){
            let content = buf.toString("utf-8");
            content = content.replaceAll("group=com.example.examplemod", `group=${nameRules.group}`);
            content = content.replaceAll("mod_name=ExampleMod", `mod_name=${nameRules.name}`);
            content = content.replaceAll("mod_id=examplemod", `mod_id=${nameRules.id}`);

            buf = Buffer.from(content, "utf8");
        }

        outZip.addBuffer(buf, newPath);
    }

    return outZip;
}