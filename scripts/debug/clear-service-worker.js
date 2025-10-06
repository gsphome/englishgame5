#!/usr/bin/env node

/**
 * Clear Service Worker Debug Script
 * Helps diagnose and clear any cached service workers
 */

console.log('🔍 Service Worker Debug Information');
console.log('=====================================');

console.log('\n📋 To clear any cached service workers:');
console.log('1. Open your browser DevTools (F12)');
console.log('2. Go to Application tab');
console.log('3. Click on "Service Workers" in the left sidebar');
console.log('4. If you see any registered service workers for this domain:');
console.log('   - Click "Unregister" for each one');
console.log('5. Go to "Storage" in the left sidebar');
console.log('6. Click "Clear site data" to remove all cached data');

console.log('\n🧹 Alternative: Clear via browser settings:');
console.log('1. Open browser settings');
console.log('2. Go to Privacy/Security');
console.log('3. Clear browsing data');
console.log('4. Select "Cached images and files" and "Site data"');
console.log('5. Clear data for the last hour or day');

console.log('\n🔧 If the error persists:');
console.log('1. Check if you have any browser extensions that might interfere');
console.log('2. Try opening the site in an incognito/private window');
console.log('3. Check the browser console for more specific error details');

console.log('\n✅ After clearing, refresh the page and check if the error is gone.');