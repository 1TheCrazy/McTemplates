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
        newPath = newPath.replace("com.example.examplemod", nameRules.group); // META-INF
        newPath = newPath.replace("examplemod", nameRules.id);
        // Replace ModInitializer files
        newPath = newPath.replace("ExampleMod", nameRules.name.replace(/ /g, ""));

        // -- Apply File-Level renaming rules --
        // Java files
        // Rename packages etc.
        if(newPath.endsWith(".java")){
            let content = buf.toString("utf-8");
            content = content.replaceAll("com.example.examplemod", nameRules.group);
            content = content.replaceAll("ExampleMod", nameRules.name.replace(/ /g, ""));
            content = content.replaceAll("examplemod", nameRules.id);

            buf = Buffer.from(content, "utf8");
        }

        // gradle.properties
        if(newPath.endsWith("gradle.properties")){
            let content = buf.toString("utf-8");
            content = content.replaceAll("group=com.example.examplemod", `group=${nameRules.group}`);
            content = content.replaceAll("mod_name=ExampleMod", `mod_name=${nameRules.name}`);
            content = content.replaceAll("mod_id=examplemod", `mod_id=${nameRules.id}`);

            buf = Buffer.from(content, "utf8");
        }

        // Mixins and fabric.mod.json
        if(newPath.endsWith(".json")){
            let content = buf.toString("utf-8");
            content = content.replaceAll("com.example.examplemod.ExampleMod", `${nameRules.group}.${nameRules.name.replace(/ /g, "")}`); // Fabric Entrypoint
            content = content.replaceAll("com.example.examplemod", `${nameRules.group}`);

            buf = Buffer.from(content, "utf8");
        }

        // IPlatformHelper
        if(newPath.endsWith(".IPlatformHelper")){
            let content = buf.toString("utf-8");
            content = content.replaceAll("com.example.examplemod", `${nameRules.group}`);

            buf = Buffer.from(content, "utf8");
        }

        outZip.addBuffer(buf, newPath);
    }

    return outZip;
}