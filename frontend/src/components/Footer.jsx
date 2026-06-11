import { 
  FaCar, FaWhatsapp, FaTwitter, FaInstagram, FaLinkedin, 
  FaYoutube, FaGooglePlay, FaApple 
} from 'react-icons/fa';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <FaCar className="text-white text-xl" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                Rydex
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              India's most trusted carpooling platform. Safe, affordable, and eco-friendly travel for everyone.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-all transform hover:scale-110">
                <FaWhatsapp className="text-green-400 hover:text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-all transform hover:scale-110">
                <FaTwitter className="text-blue-400 hover:text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-all transform hover:scale-110">
                <FaInstagram className="text-pink-400 hover:text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-all transform hover:scale-110">
                <FaLinkedin className="text-blue-500 hover:text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-all transform hover:scale-110">
                <FaYoutube className="text-red-500 hover:text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4 relative inline-block">
              Quick Links
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary-500 to-transparent"></div>
            </h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="text-gray-400 hover:text-primary-400 transition flex items-center gap-2 group">
                <span className="w-1 h-1 bg-primary-500 rounded-full group-hover:w-2 transition-all"></span>
                Home
              </Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-primary-400 transition flex items-center gap-2 group">
                <span className="w-1 h-1 bg-primary-500 rounded-full group-hover:w-2 transition-all"></span>
                About Us
              </Link></li>
              <li><Link to="/careers" className="text-gray-400 hover:text-primary-400 transition flex items-center gap-2 group">
                <span className="w-1 h-1 bg-primary-500 rounded-full group-hover:w-2 transition-all"></span>
                Careers
                <span className="text-xs bg-primary-600 px-2 py-0.5 rounded-full ml-2">Hiring!</span>
              </Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-primary-400 transition flex items-center gap-2 group">
                <span className="w-1 h-1 bg-primary-500 rounded-full group-hover:w-2 transition-all"></span>
                Blog
              </Link></li>
              <li><Link to="/press" className="text-gray-400 hover:text-primary-400 transition flex items-center gap-2 group">
                <span className="w-1 h-1 bg-primary-500 rounded-full group-hover:w-2 transition-all"></span>
                Press & Media
              </Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-lg mb-4 relative inline-block">
              Support
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary-500 to-transparent"></div>
            </h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/help" className="text-gray-400 hover:text-primary-400 transition flex items-center gap-2 group">
                <span className="w-1 h-1 bg-primary-500 rounded-full group-hover:w-2 transition-all"></span>
                Help Center
              </Link></li>
              <li><Link to="/safety" className="text-gray-400 hover:text-primary-400 transition flex items-center gap-2 group">
                <span className="w-1 h-1 bg-primary-500 rounded-full group-hover:w-2 transition-all"></span>
                Safety Tips
              </Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-primary-400 transition flex items-center gap-2 group">
                <span className="w-1 h-1 bg-primary-500 rounded-full group-hover:w-2 transition-all"></span>
                Contact Us
              </Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-primary-400 transition flex items-center gap-2 group">
                <span className="w-1 h-1 bg-primary-500 rounded-full group-hover:w-2 transition-all"></span>
                FAQs
              </Link></li>
              <li><Link to="/community" className="text-gray-400 hover:text-primary-400 transition flex items-center gap-2 group">
                <span className="w-1 h-1 bg-primary-500 rounded-full group-hover:w-2 transition-all"></span>
                Community Guidelines
              </Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-4 relative inline-block">
              Get in Touch
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary-500 to-transparent"></div>
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-gray-400">
                <MdPhone className="text-primary-500 mt-0.5 flex-shrink-0" />
                <span>+91 12345 67890</span>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <MdEmail className="text-primary-500 mt-0.5 flex-shrink-0" />
                <span>support@rydex.com</span>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <MdLocationOn className="text-primary-500 mt-0.5 flex-shrink-0" />
                <span>Bengaluru, Karnataka, India</span>
              </li>
            </ul>
            
            {/* Newsletter */}
            <div className="mt-6">
              <h5 className="font-semibold text-sm mb-2">Subscribe to Newsletter</h5>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button className="px-4 py-2 bg-primary-600 rounded-lg text-sm font-semibold hover:bg-primary-700 transition">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* App Download Section */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h4 className="font-semibold mb-2">Download Rydex App</h4>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700 transition">
                  <FaGooglePlay className="text-xl" />
                  <div className="text-left">
                    <div className="text-xs">GET IT ON</div>
                    <div className="text-sm font-semibold">Google Play</div>
                  </div>
                </button>
                <button className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700 transition">
                  <FaApple className="text-xl" />
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="text-sm font-semibold">App Store</div>
                  </div>
                </button>
              </div>
            </div>
            <div className="flex gap-4">
              <img src="https://cdn-icons-png.flaticon.com/128/919/919826.png" alt="Visa" className="h-8 opacity-50 hover:opacity-100 transition" />
              <img src="https://cdn-icons-png.flaticon.com/128/349/349221.png" alt="Mastercard" className="h-8 opacity-50 hover:opacity-100 transition" />
              <img src="https://cdn-icons-png.flaticon.com/128/5968/5968308.png" alt="UPI" className="h-8 opacity-50 hover:opacity-100 transition" />
              <img src="https://cdn-icons-png.flaticon.com/128/196/196566.png" alt="PayPal" className="h-8 opacity-50 hover:opacity-100 transition" />
            </div>
          </div>
        </div>

        {/* Legal Links */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex flex-wrap gap-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-primary-400 transition">Privacy Policy</Link>
              <Link to="/terms" className="text-gray-400 hover:text-primary-400 transition">Terms of Service</Link>
              <Link to="/cookies" className="text-gray-400 hover:text-primary-400 transition">Cookie Policy</Link>
              <Link to="/refund" className="text-gray-400 hover:text-primary-400 transition">Refund Policy</Link>
            </div>
            <div className="text-sm text-gray-500">
              © {currentYear} Rydex. All rights reserved. Made with ❤️ for India.
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex justify-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
            <span>SSL Secure</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
            <span>100% Verified Users</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
            <span>PCI Compliant</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
            <span>GDPR Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}