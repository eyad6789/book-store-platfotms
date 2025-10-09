// Test the exact library books query used in the main books API
const http = require('http');

async function testLibraryQuery() {
  console.log('🧪 Testing Library Books Query...\n');
  
  try {
    // Test the main books API with explicit logging
    console.log('1️⃣ Testing main books API with include_library=true...');
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/books?include_library=true&limit=3',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log('📊 Response Status:', res.statusCode);
          console.log('📚 Total Books:', parsed.pagination?.totalItems);
          console.log('🔍 Sources:', parsed.sources);
          console.log('📖 Sample Books:');
          
          if (parsed.books && parsed.books.length > 0) {
            parsed.books.slice(0, 3).forEach((book, i) => {
              console.log(`   ${i+1}. "${book.title_ar || book.title}" (Source: ${book.source || 'regular'})`);
            });
          } else {
            console.log('   ❌ No books found');
          }
          
          // Test library books API separately
          console.log('\n2️⃣ Testing library books API directly...');
          testLibraryBooksAPI();
          
        } catch (e) {
          console.error('❌ Failed to parse response:', e.message);
          process.exit(1);
        }
      });
    });

    req.on('error', (err) => {
      console.error('❌ Request failed:', err.message);
      process.exit(1);
    });

    req.end();
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

function testLibraryBooksAPI() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/books/library?limit=3',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        console.log('📊 Library API Status:', res.statusCode);
        console.log('📚 Library Books Count:', parsed.pagination?.totalItems);
        console.log('📖 Library Books:');
        
        if (parsed.books && parsed.books.length > 0) {
          parsed.books.slice(0, 3).forEach((book, i) => {
            console.log(`   ${i+1}. "${book.title_ar || book.title}" (Status: ${book.status})`);
          });
        } else {
          console.log('   ❌ No library books found');
        }
        
        console.log('\n🔍 ANALYSIS:');
        console.log('=============');
        
        if (parsed.pagination?.totalItems > 0) {
          console.log('✅ Library books exist and are accessible via /api/books/library');
          console.log('❌ But they are NOT being included in /api/books');
          console.log('\n🔧 SOLUTION NEEDED:');
          console.log('   The library books query in the main books API is failing silently');
          console.log('   Check server logs for database errors');
          console.log('   Verify LibraryBook model associations');
        } else {
          console.log('❌ No library books found in database');
        }
        
        process.exit(0);
        
      } catch (e) {
        console.error('❌ Failed to parse library response:', e.message);
        process.exit(1);
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Library request failed:', err.message);
    process.exit(1);
  });

  req.end();
}

testLibraryQuery();
