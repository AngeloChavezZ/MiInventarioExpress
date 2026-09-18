function validateEnv() {
  const requiredVars = ['MONGO_URI', 'SESSION_SECRET', 'PORT'];
  const missing = [];
  
  for (let variable of requiredVars) {
    if (!process.env[variable]) {
      missing.push(variable);
    }
  }
  
  if (missing.length > 0) {
    console.error('ERROR: Faltan variables:');
    missing.forEach(v => console.error('   - ' + v));
    process.exit(1);
  }
  
  console.log('Variables validadas');
}

module.exports = validateEnv;