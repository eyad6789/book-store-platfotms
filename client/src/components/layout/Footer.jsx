import { Link } from 'react-router-dom'
import {
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Heart
} from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary-dark text-primary-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center">
              <img
                src="/logoDarkBg.png"
                alt="المتنبي"
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-gray-300 leading-relaxed">
              مكتبة العراق الرقمية - نجمع أفضل الكتب العربية والمترجمة من المكتبات العراقية المختارة لنقدمها لك في مكان واحد.
            </p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <a
                href="#"
                className="text-gray-400 hover:text-primary-gold transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary-gold transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary-gold transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-gold">
              روابط سريعة
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/books"
                  className="text-gray-300 hover:text-primary-gold transition-colors"
                >
                  تصفح الكتب
                </Link>
              </li>
              <li>
                <Link
                  to="/bookstores"
                  className="text-gray-300 hover:text-primary-gold transition-colors"
                >
                  المكتبات الشريكة
                </Link>
              </li>
              <li>
                <Link
                  to="/books?featured=true"
                  className="text-gray-300 hover:text-primary-gold transition-colors"
                >
                  الكتب المميزة
                </Link>
              </li>
              <li>
                <Link
                  to="/books?category=شعر"
                  className="text-gray-300 hover:text-primary-gold transition-colors"
                >
                  الشعر العربي
                </Link>
              </li>
              <li>
                <Link
                  to="/books?category=رواية"
                  className="text-gray-300 hover:text-primary-gold transition-colors"
                >
                  الروايات
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-gold">
              خدمة العملاء
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/help"
                  className="text-gray-300 hover:text-primary-gold transition-colors"
                >
                  المساعدة والدعم
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="text-gray-300 hover:text-primary-gold transition-colors"
                >
                  الشحن والتوصيل
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="text-gray-300 hover:text-primary-gold transition-colors"
                >
                  الإرجاع والاستبدال
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-300 hover:text-primary-gold transition-colors"
                >
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-300 hover:text-primary-gold transition-colors"
                >
                  الشروط والأحكام
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-gold">
              تواصل معنا
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <MapPin className="w-5 h-5 text-primary-gold flex-shrink-0" />
                <span className="text-gray-300">
                  شارع المتنبي، بغداد، العراق
                </span>
              </div>
              <a
                href="tel:+9647723198890"
                className="flex items-center space-x-3 rtl:space-x-reverse hover:text-primary-gold transition-colors group"
              >
                <Phone className="w-5 h-5 text-primary-gold flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-gray-300 english-text group-hover:text-primary-gold" dir="ltr">
                  07723198890
                </span>
              </a>
              <a
                href="mailto:moham231med@gmail.com"
                className="flex items-center space-x-3 rtl:space-x-reverse hover:text-primary-gold transition-colors group"
              >
                <Mail className="w-5 h-5 text-primary-gold flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-gray-300 english-text group-hover:text-primary-gold" dir="ltr">
                  moham231med@gmail.com
                </span>
              </a>
            </div>

            {/* For Bookstore Owners */}
            <div className="pt-4 border-t border-gray-700">
              <h4 className="text-sm font-semibold text-primary-gold mb-2">
                لأصحاب المكتبات
              </h4>
              <Link
                to="/bookstore/register"
                className="text-sm text-gray-300 hover:text-primary-gold transition-colors"
              >
                انضم إلى شبكة المتنبي
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear} المتنبي. جميع الحقوق محفوظة.
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-400 text-sm">
              <span>صُنع بـ</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>في العراق</span>
            </div>

            <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm">
              <Link
                to="/privacy"
                className="text-gray-400 hover:text-primary-gold transition-colors"
              >
                الخصوصية
              </Link>
              <Link
                to="/terms"
                className="text-gray-400 hover:text-primary-gold transition-colors"
              >
                الشروط
              </Link>
              <Link
                to="/sitemap"
                className="text-gray-400 hover:text-primary-gold transition-colors"
              >
                خريطة الموقع
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
