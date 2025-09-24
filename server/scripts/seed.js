const { User, Bookstore, Book } = require('../models');

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Create sample bookstore owner
    const owner = await User.create({
      email: 'owner@almutanabbi.com',
      password_hash: 'owner123',
      full_name: 'أحمد الكتبي',
      phone: '+964 770 123 4567',
      role: 'bookstore_owner',
      is_verified: true
    });
    
    // Create sample bookstore
    const bookstore = await Bookstore.create({
      owner_id: owner.id,
      name: 'مكتبة بغداد للتراث',
      name_arabic: 'مكتبة بغداد للتراث',
      description: 'مكتبة متخصصة في الكتب التراثية والأدبية العربية',
      description_arabic: 'مكتبة متخصصة في الكتب التراثية والأدبية العربية',
      address: 'شارع المتنبي، بغداد، العراق',
      address_arabic: 'شارع المتنبي، بغداد، العراق',
      phone: '+964 770 123 4567',
      email: 'info@baghdadheritage.com',
      is_approved: true,
      is_active: true
    });
    
    // Create sample books
    const sampleBooks = [
      {
        title: 'ديوان المتنبي',
        title_arabic: 'ديوان المتنبي',
        author: 'أبو الطيب المتنبي',
        author_arabic: 'أبو الطيب المتنبي',
        isbn: '978-977-416-123-4',
        category: 'شعر',
        category_arabic: 'شعر',
        description: 'ديوان شاعر العربية الأكبر أبو الطيب المتنبي',
        description_arabic: 'ديوان شاعر العربية الأكبر أبو الطيب المتنبي',
        price: 25.00,
        stock_quantity: 50,
        language: 'arabic',
        publication_year: 2020,
        publisher: 'دار الكتب العلمية',
        publisher_arabic: 'دار الكتب العلمية',
        pages: 320,
        is_featured: true
      },
      {
        title: 'الأسود يليق بك',
        title_arabic: 'الأسود يليق بك',
        author: 'أحلام مستغانمي',
        author_arabic: 'أحلام مستغانمي',
        isbn: '978-977-416-124-1',
        category: 'رواية',
        category_arabic: 'رواية',
        description: 'رواية عاطفية من أشهر الروايات العربية المعاصرة',
        description_arabic: 'رواية عاطفية من أشهر الروايات العربية المعاصرة',
        price: 18.50,
        stock_quantity: 30,
        language: 'arabic',
        publication_year: 2019,
        publisher: 'منشورات أحلام مستغانمي',
        publisher_arabic: 'منشورات أحلام مستغانمي',
        pages: 280,
        is_featured: true
      },
      {
        title: 'مئة عام من العزلة',
        title_arabic: 'مئة عام من العزلة',
        author: 'غابرييل غارسيا ماركيز',
        author_arabic: 'غابرييل غارسيا ماركيز',
        isbn: '978-977-416-125-8',
        category: 'رواية مترجمة',
        category_arabic: 'رواية مترجمة',
        description: 'رواية الواقعية السحرية الشهيرة مترجمة إلى العربية',
        description_arabic: 'رواية الواقعية السحرية الشهيرة مترجمة إلى العربية',
        price: 22.00,
        stock_quantity: 25,
        language: 'arabic',
        publication_year: 2021,
        publisher: 'دار الآداب',
        publisher_arabic: 'دار الآداب',
        pages: 420
      },
      {
        title: 'تاريخ بغداد',
        title_arabic: 'تاريخ بغداد',
        author: 'الخطيب البغدادي',
        author_arabic: 'الخطيب البغدادي',
        isbn: '978-977-416-126-5',
        category: 'تاريخ',
        category_arabic: 'تاريخ',
        description: 'كتاب تاريخي مهم عن تاريخ مدينة بغداد وعلمائها',
        description_arabic: 'كتاب تاريخي مهم عن تاريخ مدينة بغداد وعلمائها',
        price: 35.00,
        stock_quantity: 15,
        language: 'arabic',
        publication_year: 2018,
        publisher: 'دار الكتب العلمية',
        publisher_arabic: 'دار الكتب العلمية',
        pages: 650
      },
      {
        title: 'الجواهري - الأعمال الكاملة',
        title_arabic: 'الجواهري - الأعمال الكاملة',
        author: 'محمد مهدي الجواهري',
        author_arabic: 'محمد مهدي الجواهري',
        isbn: '978-977-416-127-2',
        category: 'شعر',
        category_arabic: 'شعر',
        description: 'الأعمال الشعرية الكاملة لشاعر العراق الكبير الجواهري',
        description_arabic: 'الأعمال الشعرية الكاملة لشاعر العراق الكبير الجواهري',
        price: 45.00,
        stock_quantity: 20,
        language: 'arabic',
        publication_year: 2020,
        publisher: 'دار الشؤون الثقافية',
        publisher_arabic: 'دار الشؤون الثقافية',
        pages: 800,
        is_featured: true
      }
    ];
    
    for (const bookData of sampleBooks) {
      await Book.create({
        ...bookData,
        bookstore_id: bookstore.id
      });
    }
    
    // Create sample customer
    await User.create({
      email: 'customer@example.com',
      password_hash: 'customer123',
      full_name: 'فاطمة القارئة',
      phone: '+964 771 987 6543',
      role: 'customer',
      is_verified: true
    });
    
    console.log('✅ Sample data created:');
    console.log('   - Admin: admin@almutanabbi.com / admin123');
    console.log('   - Bookstore Owner: owner@almutanabbi.com / owner123');
    console.log('   - Customer: customer@example.com / customer123');
    console.log('   - 1 Bookstore with 5 sample books');
    console.log('🎉 Seeding completed successfully!');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
