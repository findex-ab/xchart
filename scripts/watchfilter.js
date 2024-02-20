/**
 * @param  {string} f Filename
 * @param  {object} stat File System @see {@link http://nodejs.org/api/fs.html File System}
 */
const myFilter = (f, stat) => stat.isFile() && ['./src/xchart/index.ts', './src/index.ts'].includes(f) === false;

module.exports = myFilter;
