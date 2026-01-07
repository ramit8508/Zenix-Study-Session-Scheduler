const fs = require('fs');
const path = require('path');

exports.default = async function(context) {
  console.log('📦 Preparing offline package for Linux...');
  
  // Get the correct app directory path
  const appDir = context.appDir || path.dirname(context.packager.appDir) || process.cwd();
  
  // Ensure backend dependencies are included
  const backendPath = path.join(appDir, '../Backend');
  const backendNodeModules = path.join(backendPath, 'node_modules');
  
  if (fs.existsSync(backendNodeModules)) {
    console.log('✅ Backend node_modules found - will be bundled');
  } else {
    console.warn('⚠️  Backend node_modules not found. Run: cd Backend && npm install');
  }
  
  console.log('✅ Offline package preparation complete');
};
