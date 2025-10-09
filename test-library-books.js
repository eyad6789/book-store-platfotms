// Test script to verify library books are showing up
// Run this in browser console or as a Node.js script

const testLibraryBooksAPI = async () => {
  console.log('🧪 Testing Library Books API...\n');
  
  try {
    // Test 1: Get all books (should include library books)
    console.log('📚 Test 1: Getting all books...');
    const allBooksResponse = await fetch('/api/books');
    const allBooksData = await allBooksResponse.json();
    
    console.log('✅ All Books Response:', {
      success: allBooksData.success,
      totalBooks: allBooksData.pagination?.totalItems,
      sources: allBooksData.sources
    });
    
    // Test 2: Get library books only
    console.log('\n📖 Test 2: Getting library books only...');
    const libraryBooksResponse = await fetch('/api/books/library');
    const libraryBooksData = await libraryBooksResponse.json();
    
    console.log('✅ Library Books Response:', {
      success: libraryBooksData.success,
      totalLibraryBooks: libraryBooksData.pagination?.totalItems,
      books: libraryBooksData.books?.length || 0
    });
    
    // Test 3: Search with library books
    console.log('\n🔍 Test 3: Searching books...');
    const searchResponse = await fetch('/api/books/search?q=test');
    const searchData = await searchResponse.json();
    
    console.log('✅ Search Response:', {
      success: searchData.success,
      totalResults: searchData.pagination?.totalItems,
      books: searchData.books?.length || 0
    });
    
    // Test 4: Check if any books have library source
    if (allBooksData.books && allBooksData.books.length > 0) {
      const librarySourceBooks = allBooksData.books.filter(book => book.source === 'library');
      console.log(`\n📊 Found ${librarySourceBooks.length} books with library source`);
      
      if (librarySourceBooks.length > 0) {
        console.log('📝 Sample library book:', {
          id: librarySourceBooks[0].id,
          title: librarySourceBooks[0].title_ar || librarySourceBooks[0].title,
          source: librarySourceBooks[0].source,
          bookstore: librarySourceBooks[0].bookstore?.name_arabic
        });
      }
    }
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testLibraryBooksAPI();
