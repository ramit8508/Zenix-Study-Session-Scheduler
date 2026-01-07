// Before pack script to ensure offline dependencies are bundled
const fs = require('fs');
const path = require('path');

exports.default = async function(context) {
  console.log('📦 Preparing offline package for Linux...');
  
  // Ensure backend dependencies are included
  const backendPath = path.join(context.appDir, '../Backend');
  const backendNodeModules = path.join(backendPath, 'node_modules');
  
  if (fs.existsSync(backendNodeModules)) {
    console.log('✅ Backend node_modules found - will be bundled');
  } else {
    console.warn('⚠️  Backend node_modules not found. Run: cd Backend && npm install');
  }
  
  console.log('✅ Offline package preparation complete');
};
