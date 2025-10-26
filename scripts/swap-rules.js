#!/usr/bin/env node
/**
 * Firestore Rules Swapper
 * 
 * Swaps between production and development Firestore security rules.
 * Used to load dev rules (with test user exception) when running emulator.
 * 
 * Usage:
 *   node scripts/swap-rules.js dev   - Switch to dev rules (for emulator)
 *   node scripts/swap-rules.js prod  - Switch back to production rules
 */

const fs = require('fs');
const path = require('path');

const mode = process.argv[2] || 'dev';
const root = path.join(__dirname, '..');

const rulesFile = path.join(root, 'firestore.rules');
const devRulesFile = path.join(root, 'firestore.rules.dev');
const backupFile = path.join(root, 'firestore.rules.prod.bak');

if (mode === 'dev') {
  console.log('🔄 Switching to dev rules for emulator...');
  
  // Backup production rules
  if (fs.existsSync(rulesFile)) {
    fs.copyFileSync(rulesFile, backupFile);
    console.log('   ✅ Backed up production rules');
  }
  
  // Copy dev rules to main rules file (emulator uses this)
  if (!fs.existsSync(devRulesFile)) {
    console.error('   ❌ Error: firestore.rules.dev not found!');
    process.exit(1);
  }
  
  fs.copyFileSync(devRulesFile, rulesFile);
  console.log('   ✅ Copied dev rules to firestore.rules');
  console.log('');
  console.log('✨ Dev rules active! Emulator can now use test user.');
  console.log('   Remember to restore production rules after stopping emulator.');
  console.log('   Run: npm run emulator:restore');
  
} else if (mode === 'prod') {
  console.log('🔄 Restoring production rules...');
  
  // Restore production rules from backup
  if (!fs.existsSync(backupFile)) {
    console.warn('   ⚠️  No backup found. Production rules may already be active.');
    process.exit(0);
  }
  
  fs.copyFileSync(backupFile, rulesFile);
  fs.unlinkSync(backupFile);
  console.log('   ✅ Restored production rules');
  console.log('');
  console.log('✨ Production rules active! No test user backdoor.');
  
} else {
  console.error('❌ Invalid mode. Use "dev" or "prod".');
  console.error('   Example: node scripts/swap-rules.js dev');
  process.exit(1);
}

