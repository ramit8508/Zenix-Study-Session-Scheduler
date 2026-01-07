const fs = require('fs');
const path = require('path');

exports.default = async function(context) {
  console.log('📦 Preparing offline package for Linux...');
  
  // Use __dirname to get reliable path (scripts directory)
  const frontendDir = path.resolve(__dirname, '..');
  const backendPath = path.join(frontendDir, '../Backend');
  const backendNodeModules = path.join(backendPath, 'node_modules');
  
  console.log('Frontend dir:', frontendDir);
  console.log('Backend path:', backendPath);
  
  if (fs.existsSync(backendNodeModules)) {
    console.log('✅ Backend node_modules found - will be bundled');
  } else {
    console.warn('⚠️  Backend node_modules not found. Run: cd Backend && npm install');
  }
  
  console.log('✅ Offline package preparation complete');
};
