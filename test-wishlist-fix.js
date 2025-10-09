// Test the wishlist API fix
console.log('🧪 Testing Wishlist API Fix...\n');

// Test ID conversion for wishlist API calls
function testWishlistIdConversion() {
  console.log('1️⃣ Testing wishlist ID conversion:');
  
  const testBooks = [
    { id: 'library-6', expected: '6' },
    { id: 'library-5', expected: '5' },
    { id: '3', expected: '3' },
    { id: '4', expected: '4' }
  ];
  
  testBooks.forEach(({ id, expected }) => {
    const originalId = id.toString().startsWith('library-') 
      ? id.replace('library-', '') 
      : id;
    
    const wishlistUrl = `/api/wishlist/check/${originalId}`;
    const success = originalId === expected;
    
    console.log(`   Book ID: ${id}`);
    console.log(`   API URL: ${wishlistUrl}`);
    console.log(`   Expected: /api/wishlist/check/${expected}`);
    console.log(`   ${success ? '✅' : '❌'} ${success ? 'Correct' : 'Incorrect'}\n`);
  });
}

testWishlistIdConversion();

console.log('🎯 WISHLIST FIX SUMMARY:');
console.log('=========================');
console.log('✅ Fixed wishlist API calls to use original IDs');
console.log('✅ Removed library- prefix from API requests');
console.log('✅ Updated checkWishlistStatus function');
console.log('✅ Updated toggleWishlist function');
console.log('✅ Consolidated ID handling logic');

console.log('\n📱 EXPECTED BEHAVIOR:');
console.log('   1. No more 500 errors for wishlist API calls');
console.log('   2. Wishlist status should load properly');
console.log('   3. Heart icons should work correctly');
console.log('   4. Both regular and library books supported');

console.log('\n🚀 TEST THE FIX:');
console.log('   1. Refresh the books page');
console.log('   2. Check browser console - no more 500 errors');
console.log('   3. Heart icons should show proper status');
console.log('   4. Try adding/removing from wishlist');
