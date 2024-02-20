import fs from "fs";
import path from "path";
import os from "os";

const main = () => {
  const rootDir = process.argv[2];
  const tmpDir =  path.join(process.cwd(),  './_tmp_');
  const libDir =  path.join(process.cwd(),  './lib');

  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true });
  }

  //if (fs.existsSync(libDir)) {
  //  fs.rmSync(libDir, { recursive: true });
  //}
  
  fs.cpSync(rootDir, tmpDir, { recursive: true });
  

  if (process.argv.length <= 2) {
    console.error("Please specify path.");
    return;
  }

  const iterFiles = async (
    pathname: string,
    callback: (file: fs.Dirent, path: string) => void,
    visited: string[] = []
  ) => {
    const d = fs.opendirSync(pathname);
    let entry = d.readSync();
    //const files = fs.readdirSync(pathname, { withFileTypes: true, recursive: false, encoding: 'utf8' });

    while (!!entry) {
      if (entry.isDirectory()) {
        iterFiles(entry.path, callback);
      } else {
        callback(entry, pathname);
      }

      entry = d.readSync();
    }
  };

  const generateExports = () => {

    const generate = (basedir?: string) => {
      let buffer = "";
      iterFiles(tmpDir, (file: fs.Dirent) => {
        if (!file.isFile()) return;
        if (file.isDirectory()) return;
        if (!file.name.endsWith(".ts")) return;
        const filepath = file.path;
        if (filepath.startsWith("src/index.ts")) return;

        
        let importpath = ((basedir ? ('./' + path.join(basedir, filepath.replace(process.cwd(), '')).replace('xchart/_tmp_', '').slice(1)) : filepath.replace("src/xchart", ".")).replace(".ts", "")).replace('tmp_/', '');

        if (basedir === './') importpath = importpath.replace('xchart/', '');

        if (importpath.startsWith('./index')) return;

        buffer += `export * from '${importpath}';\n`;
      });
      return buffer;
    }


    fs.writeFileSync(path.join(tmpDir, 'xchart/index.ts'), generate('./'), { encoding: 'utf8' });
    fs.writeFileSync(path.join(tmpDir, 'index.ts'), generate('./xchart'), { encoding: 'utf8' });
  };

  generateExports();
};

main();
