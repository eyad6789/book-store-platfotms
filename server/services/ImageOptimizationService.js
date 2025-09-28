const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

class ImageOptimizationService {
  constructor() {
    this.supportedFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif'];
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.optimizedDir = path.join(__dirname, '..', 'uploads', 'optimized');
    this.thumbnailDir = path.join(__dirname, '..', 'uploads', 'thumbnails');
    
    this.ensureDirectories();
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(this.optimizedDir, { recursive: true });
      await fs.mkdir(this.thumbnailDir, { recursive: true });
      console.log('Image optimization directories created');
    } catch (error) {
      console.error('Error creating image directories:', error);
    }
  }

  // Optimize uploaded image
  async optimizeImage(inputBuffer, originalName, options = {}) {
    try {
      const {
        width = 800,
        height = 1200,
        quality = 85,
        format = 'webp',
        generateThumbnail = true
      } = options;

      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.round(Math.random() * 1E9);
      const filename = `${timestamp}-${randomId}.${format}`;
      const outputPath = path.join(this.optimizedDir, filename);

      // Optimize main image
      const optimizedBuffer = await sharp(inputBuffer)
        .resize(width, height, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .toFormat(format, { quality })
        .toBuffer();

      // Save optimized image
      await fs.writeFile(outputPath, optimizedBuffer);

      const result = {
        filename,
        path: outputPath,
        url: `/uploads/optimized/${filename}`,
        size: optimizedBuffer.length,
        dimensions: await this.getImageDimensions(optimizedBuffer),
        format
      };

      // Generate thumbnail if requested
      if (generateThumbnail) {
        const thumbnailResult = await this.generateThumbnail(inputBuffer, filename);
        result.thumbnail = thumbnailResult;
      }

      console.log(`Image optimized: ${originalName} -> ${filename}`);
      return result;

    } catch (error) {
      console.error('Image optimization error:', error);
      throw new Error('فشل في تحسين الصورة');
    }
  }

  // Generate thumbnail
  async generateThumbnail(inputBuffer, originalFilename, options = {}) {
    try {
      const {
        width = 200,
        height = 300,
        quality = 80,
        format = 'webp'
      } = options;

      const thumbnailFilename = `thumb_${originalFilename}`;
      const thumbnailPath = path.join(this.thumbnailDir, thumbnailFilename);

      const thumbnailBuffer = await sharp(inputBuffer)
        .resize(width, height, { 
          fit: 'cover',
          position: 'center'
        })
        .toFormat(format, { quality })
        .toBuffer();

      await fs.writeFile(thumbnailPath, thumbnailBuffer);

      return {
        filename: thumbnailFilename,
        path: thumbnailPath,
        url: `/uploads/thumbnails/${thumbnailFilename}`,
        size: thumbnailBuffer.length,
        dimensions: { width, height },
        format
      };

    } catch (error) {
      console.error('Thumbnail generation error:', error);
      throw new Error('فشل في إنشاء الصورة المصغرة');
    }
  }

  // Get image dimensions
  async getImageDimensions(buffer) {
    try {
      const metadata = await sharp(buffer).metadata();
      return {
        width: metadata.width,
        height: metadata.height
      };
    } catch (error) {
      console.error('Error getting image dimensions:', error);
      return { width: 0, height: 0 };
    }
  }

  // Validate image file
  validateImage(file) {
    const errors = [];

    // Check file size
    if (file.size > this.maxFileSize) {
      errors.push(`حجم الملف كبير جداً. الحد الأقصى ${this.maxFileSize / (1024 * 1024)}MB`);
    }

    // Check file type
    const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);
    if (!this.supportedFormats.includes(fileExtension)) {
      errors.push(`نوع الملف غير مدعوم. الأنواع المدعومة: ${this.supportedFormats.join(', ')}`);
    }

    // Check MIME type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/gif'
    ];
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      errors.push('نوع MIME غير مدعوم');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Process multiple images
  async processMultipleImages(files, options = {}) {
    const results = [];
    const errors = [];

    for (const file of files) {
      try {
        const validation = this.validateImage(file);
        if (!validation.isValid) {
          errors.push({
            filename: file.originalname,
            errors: validation.errors
          });
          continue;
        }

        const result = await this.optimizeImage(file.buffer, file.originalname, options);
        results.push({
          original: file.originalname,
          optimized: result
        });

      } catch (error) {
        errors.push({
          filename: file.originalname,
          errors: [error.message]
        });
      }
    }

    return {
      success: results,
      errors,
      totalProcessed: results.length,
      totalErrors: errors.length
    };
  }

  // Delete optimized image and thumbnail
  async deleteOptimizedImage(filename) {
    try {
      const imagePath = path.join(this.optimizedDir, filename);
      const thumbnailPath = path.join(this.thumbnailDir, `thumb_${filename}`);

      // Delete main image
      try {
        await fs.unlink(imagePath);
        console.log(`Deleted optimized image: ${filename}`);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.error(`Error deleting optimized image: ${error.message}`);
        }
      }

      // Delete thumbnail
      try {
        await fs.unlink(thumbnailPath);
        console.log(`Deleted thumbnail: thumb_${filename}`);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.error(`Error deleting thumbnail: ${error.message}`);
        }
      }

      return true;
    } catch (error) {
      console.error('Error in deleteOptimizedImage:', error);
      return false;
    }
  }

  // Convert image to different format
  async convertFormat(inputPath, outputFormat, options = {}) {
    try {
      const { quality = 85 } = options;
      const inputBuffer = await fs.readFile(inputPath);
      
      const convertedBuffer = await sharp(inputBuffer)
        .toFormat(outputFormat, { quality })
        .toBuffer();

      const outputFilename = `converted_${Date.now()}.${outputFormat}`;
      const outputPath = path.join(this.optimizedDir, outputFilename);
      
      await fs.writeFile(outputPath, convertedBuffer);

      return {
        filename: outputFilename,
        path: outputPath,
        url: `/uploads/optimized/${outputFilename}`,
        size: convertedBuffer.length,
        format: outputFormat
      };

    } catch (error) {
      console.error('Format conversion error:', error);
      throw new Error('فشل في تحويل تنسيق الصورة');
    }
  }

  // Resize image to specific dimensions
  async resizeImage(inputBuffer, width, height, options = {}) {
    try {
      const {
        fit = 'cover',
        position = 'center',
        quality = 85,
        format = 'webp'
      } = options;

      const resizedBuffer = await sharp(inputBuffer)
        .resize(width, height, { fit, position })
        .toFormat(format, { quality })
        .toBuffer();

      return {
        buffer: resizedBuffer,
        size: resizedBuffer.length,
        dimensions: { width, height },
        format
      };

    } catch (error) {
      console.error('Image resize error:', error);
      throw new Error('فشل في تغيير حجم الصورة');
    }
  }

  // Add watermark to image
  async addWatermark(inputBuffer, watermarkPath, options = {}) {
    try {
      const {
        position = 'southeast',
        opacity = 0.5,
        margin = 10
      } = options;

      const watermarkedBuffer = await sharp(inputBuffer)
        .composite([{
          input: watermarkPath,
          gravity: position,
          blend: 'over'
        }])
        .toBuffer();

      return {
        buffer: watermarkedBuffer,
        size: watermarkedBuffer.length
      };

    } catch (error) {
      console.error('Watermark error:', error);
      throw new Error('فشل في إضافة العلامة المائية');
    }
  }

  // Get image metadata
  async getImageMetadata(inputBuffer) {
    try {
      const metadata = await sharp(inputBuffer).metadata();
      
      return {
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        channels: metadata.channels,
        density: metadata.density,
        hasAlpha: metadata.hasAlpha,
        orientation: metadata.orientation,
        size: inputBuffer.length
      };

    } catch (error) {
      console.error('Metadata extraction error:', error);
      throw new Error('فشل في استخراج معلومات الصورة');
    }
  }

  // Clean up old optimized images
  async cleanupOldImages(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const directories = [this.optimizedDir, this.thumbnailDir];
      let deletedCount = 0;

      for (const directory of directories) {
        try {
          const files = await fs.readdir(directory);
          
          for (const file of files) {
            const filePath = path.join(directory, file);
            const stats = await fs.stat(filePath);
            
            if (stats.mtime < cutoffDate) {
              await fs.unlink(filePath);
              deletedCount++;
              console.log(`Deleted old image: ${file}`);
            }
          }
        } catch (error) {
          console.error(`Error cleaning directory ${directory}:`, error);
        }
      }

      console.log(`Cleanup completed. Deleted ${deletedCount} old images.`);
      return deletedCount;

    } catch (error) {
      console.error('Image cleanup error:', error);
      return 0;
    }
  }

  // Get storage statistics
  async getStorageStats() {
    try {
      const directories = [
        { name: 'optimized', path: this.optimizedDir },
        { name: 'thumbnails', path: this.thumbnailDir }
      ];

      const stats = {};

      for (const dir of directories) {
        try {
          const files = await fs.readdir(dir.path);
          let totalSize = 0;
          
          for (const file of files) {
            const filePath = path.join(dir.path, file);
            const fileStats = await fs.stat(filePath);
            totalSize += fileStats.size;
          }

          stats[dir.name] = {
            fileCount: files.length,
            totalSize: totalSize,
            totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100
          };

        } catch (error) {
          stats[dir.name] = {
            fileCount: 0,
            totalSize: 0,
            totalSizeMB: 0,
            error: error.message
          };
        }
      }

      return stats;

    } catch (error) {
      console.error('Storage stats error:', error);
      return {};
    }
  }
}

// Create singleton instance
const imageOptimizationService = new ImageOptimizationService();

module.exports = imageOptimizationService;
