const fs = require('fs');
const shell = require('shelljs');

const defaultPkg = '{}';
const branch = shell.exec('git branch --show-current', { silent: true }).stdout.trim(),
  nextPkg = shell.exec(`git show ${branch}~0:package.json`, { silent: true }).stdout.trim() || defaultPkg,
  prePkg = shell.exec(`git show ${branch}~1:package.json`, { silent: true }).stdout.trim() || defaultPkg

// dependencies, devDependencies; peerDependencies optionalDependencies bundleDependencies 忽略
const next = JSON.parse(nextPkg), pre = JSON.parse(prePkg);
// devDependencies
const nextDev = next.devDependencies, preDev = pre.devDependencies;
const diffDev = shallowDiffers(nextDev, preDev);
// dependencies
const nextProd = next.dependencies, preProd = pre.dependencies;
const diffProd = shallowDiffers(nextProd, preProd);

fs.writeFileSync('../../package.changelog.json', JSON.stringify({ dependencies: diffProd, devDependencies: diffDev }, null, 2));

// package.json 浅比较
function shallowDiffers(next = {}, pre = {}) {
  const diff = {};
  for (const key in next) {
    if (!pre[key]) {
      if (!diff.add) diff.add = {}
      Object.assign(diff.add, { [key]: next[key] })
    } else if (pre[key] !== next[key]) {
      if (!diff.update) diff.update = {}
      Object.assign(diff.update, { [key]: next[key] })
    }
  }

  for (const key in pre) {
    if (!(key in next)) {
      if (!diff.remove) diff.remove = {}
      Object.assign(diff.remove, { [key]: next[key] })
    }
  }
  return diff;
}