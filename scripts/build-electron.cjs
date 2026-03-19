const { execFileSync } = require('child_process');

const pad2 = (value) => String(value).padStart(2, '0');
const now = new Date();
const buildVersion =
  process.env.BUILD_VERSION ||
  `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}${pad2(now.getHours())}${pad2(now.getMinutes())}`;

const env = {
  ...process.env,
  VITE_BASE: './',
  BUILD_VERSION: buildVersion,
};

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';

execFileSync(npmCmd, ['run', 'build'], { stdio: 'inherit', env });
execFileSync(npxCmd, ['electron-builder'], { stdio: 'inherit', env });
