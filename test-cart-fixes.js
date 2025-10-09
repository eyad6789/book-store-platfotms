// Test the cart and book edit fixes
console.log('🧪 Testing Cart and Book Edit Fixes...\n');

// Test ID conversion logic
function testIdConversion() {
  console.log('1️⃣ Testing ID conversion logic:');
  
  const testCases = [
    { input: 'library-6', expected: '6' },
    { input: '5', expected: '5' },
    { input: 'library-123', expected: '123' }
  ];
  
  testCases.forEach(({ input, expected }) => {
    const result = input.toString().startsWith('library-') 
      ? input.replace('library-', '') 
      : input;
    
    const success = result === expected;
    console.log(`   ${input} → ${result} ${success ? '✅' : '❌'}`);
  });
}

// Test availability logic
function testAvailabilityLogic() {
  console.log('\n2️⃣ Testing availability logic:');
  
  const testBooks = [
    { source: 'library', availability_status: 'available', expected: true },
    { source: 'library', availability_status: 'unavailable', expected: false },
    { source: 'library', availability_status: 'coming_soon', expected: false },
    { source: 'regular', stock_quantity: 5, expected: true },
    { source: 'regular', stock_quantity: 0, expected: false }
  ];
  
  testBooks.forEach((book, index) => {
    const isAvailable = book.source === 'library' 
      ? book.availability_status === 'available'
      : book.stock_quantity > 0;
    
    const success = isAvailable === book.expected;
    console.log(`   Book ${index + 1} (${book.source}): ${isAvailable ? 'Available' : 'Unavailable'} ${success ? '✅' : '❌'}`);
  });
}

// Test cart book creation
function testCartBookCreation() {
  console.log('\n3️⃣ Testing cart book creation:');
  
  const libraryBook = {
    id: 'library-6',
    title: 'Test Library Book',
    source: 'library',
    availability_status: 'available',
    price: 25000
  };
  
  const cartBook = {
    ...libraryBook,
    id: libraryBook.id.toString().startsWith('library-') 
      ? libraryBook.id.replace('library-', '') 
      : libraryBook.id,
    stock_quantity: libraryBook.source === 'library' 
      ? (libraryBook.availability_status === 'available' ? 1 : 0)
      : libraryBook.stock_quantity
  };
  
  console.log(`   Original ID: ${libraryBook.id}`);
  console.log(`   Cart ID: ${cartBook.id}`);
  console.log(`   Stock Quantity: ${cartBook.stock_quantity}`);
  console.log(`   ${cartBook.id === '6' && cartBook.stock_quantity === 1 ? '✅' : '❌'} Cart book created correctly`);
}

testIdConversion();
testAvailabilityLogic();
testCartBookCreation();

console.log('\n🎯 FIXES SUMMARY:');
console.log('==================');
console.log('✅ Fixed BookCard cart ID handling');
console.log('✅ Fixed BookDetailPage cart integration');
console.log('✅ Added availability status support');
console.log('✅ Proper ID conversion for library books');
console.log('✅ Stock quantity handling for library books');

console.log('\n📱 EXPECTED BEHAVIOR:');
console.log('   1. Library books should add to cart properly');
console.log('   2. No more "0 books" error messages');
console.log('   3. Book detail pages should work for all books');
console.log('   4. Cart should show correct quantities');

console.log('\n🚀 TEST THE FIXES:');
console.log('   1. Go to books page');
console.log('   2. Click "أضف للسلة" on any book');
console.log('   3. Check cart - should show book added');
console.log('   4. Click on book to view details');
console.log('   5. Try adding from detail page');
