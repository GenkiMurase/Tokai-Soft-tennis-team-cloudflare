import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X as XIcon, Instagram, Settings } from 'lucide-react';
import MatchSchedule from './MatchSchedule';

function Layout() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top when location changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const handleNavClick = () => {
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const navLinks = [
    { name: '部活動紹介', href: '/about' },
    { name: '選手一覧', href: '/players' },
    { name: '試合予定', href: '/matches' },
    { name: 'お知らせ', href: '/posts' },
    { name: 'お問い合わせ', href: '/contact' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div 
        className="fixed right-0 bottom-0 pointer-events-none z-0 w-[800px] h-[800px]"
        style={{
          backgroundImage: 'url(/images/logo1.png)',
          backgroundSize: 'contain',
          backgroundPosition: 'bottom right',
          backgroundRepeat: 'no-repeat',
          opacity: 0.15,
          transform: 'rotate(45deg) translate(200px, 100px)'
        }}
      />

      <div className="fixed top-0 left-0 right-0 z-50">
        <header 
          className={`w-full transition-all duration-300 site-header ${
            isScrolled ? 'bg-white shadow-md py-2' : 'bg-white/95 backdrop-blur-sm py-3'
          }`}
        >
          <div className="container mx-auto px-4">
            <nav className="flex items-center justify-between">
              <Link to="/" className="flex items-center">
                <img
                  src="/images/logo.png"
                  alt="東海大学ソフトテニス部"
                  className="h-12 w-auto"
                />
              </Link>
              
              <div className="hidden md:flex items-center space-x-10">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`transition-all duration-300 text-sm lg:text-base tracking-wider font-medium ${
                      location.pathname === link.href 
                        ? 'text-blue-600'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <button
                className="md:hidden text-gray-600"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <XIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </nav>

            {isMenuOpen && (
              <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg animate-slideDown">
                <div className="px-4 py-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      className={`block py-4 px-4 text-lg tracking-wider font-medium transition-all duration-300 rounded-lg ${
                        location.pathname === link.href 
                          ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                      onClick={handleNavClick}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>
      </div>

      <MatchSchedule />

      <main className="min-h-screen relative z-10" style={{ paddingTop: '96px' }}>
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center md:text-left">
                <img
                  src="/images/logo2.png"
                  alt="東海大学ソフトテニス部"
                  className="h-12 w-auto mx-auto md:mx-0 mb-6"
                />
                <div className="flex justify-center md:justify-start space-x-4">
                  <a 
                    href="https://www.instagram.com/tokai_soft_tennis_/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <Instagram className="w-6 h-6" />
                  </a>
                  <a 
                    href="https://x.com/tokaisofttennis" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <XIcon className="w-6 h-6" />
                  </a>
                </div>
              </div>

              <div className="text-center md:text-left">
                <h3 className="text-lg font-bold mb-6 footer-heading text-gray-800">メニュー</h3>
                <ul className="space-y-4">
                  <li>
                    <Link to="/about" className="text-gray-600 hover:text-gray-800 transition-colors">
                      部活動紹介
                    </Link>
                  </li>
                  <li>
                    <Link to="/players" className="text-gray-600 hover:text-gray-800 transition-colors">
                      選手一覧
                    </Link>
                  </li>
                  <li>
                    <Link to="/matches" className="text-gray-600 hover:text-gray-800 transition-colors">
                      試合予定
                    </Link>
                  </li>
                  <li>
                    <Link to="/posts" className="text-gray-600 hover:text-gray-800 transition-colors">
                      お知らせ
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-gray-600 hover:text-gray-800 transition-colors">
                      お問い合わせ
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="text-center md:text-left">
                <h3 className="text-lg font-bold mb-6 footer-heading text-gray-800">SNS</h3>
                <ul className="space-y-4">
                  <li>
                    <a 
                      href="https://www.instagram.com/tokai_soft_tennis_/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Instagram
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://x.com/tokaisofttennis" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      X
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col-reverse md:flex-row justify-between items-center">
              <div className="text-center md:text-left mt-4 md:mt-0">
                <p className="text-gray-500 text-sm mb-2">
                  © {new Date().getFullYear()} 東海大学男子ソフトテニス部
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-gray-400">
                  <Link to="/terms" className="hover:text-gray-600 transition-colors">
                    利用規約
                  </Link>
                  <span>|</span>
                  <Link to="/privacy" className="hover:text-gray-600 transition-colors">
                    プライバシーポリシー
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Link 
                  to="/admin" 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="管理者ページ"
                >
                  <Settings className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default Layout;
