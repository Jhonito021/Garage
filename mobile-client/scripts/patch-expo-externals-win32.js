/**
 * Expo SDK 50: Node 24+ lists builtins like `node:sea` that cannot be used as
 * folder names on Windows. Re-apply the win32 filter after npm install.
 */
const fs = require('fs');
const path = require('path');

if (process.platform !== 'win32') {
  process.exit(0);
}

const file = path.join(
  __dirname,
  '../node_modules/@expo/cli/build/src/start/server/metro/externals.js'
);

if (!fs.existsSync(file)) {
  process.exit(0);
}

const needle =
  '].includes(x)\n    ), \n].sort();';
const patched =
  '].includes(x) && !(process.platform === "win32" && /[:]/.test(x))\n    ), \n].sort();';

let content = fs.readFileSync(file, 'utf8');
if (content.includes('process.platform === "win32" && /[:]/')) {
  process.exit(0);
}
if (!content.includes(needle)) {
  console.warn('patch-expo-externals-win32: unexpected @expo/cli externals.js format');
  process.exit(0);
}

content = content.replace(needle, patched);
fs.writeFileSync(file, content);
console.log('patch-expo-externals-win32: applied Windows externals fix');
