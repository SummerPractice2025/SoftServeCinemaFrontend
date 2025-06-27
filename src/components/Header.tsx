import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black/90 backdrop-blur' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold">
              <span className="text-gradient">SOFTSERVE</span> CINEMA
            </h1>
            
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#movies" className="hover:text-pink-500 transition-colors">Фільми</a>
              <a href="#schedule" className="hover:text-pink-500 transition-colors">Розклад</a>
              <a href="#news" className="hover:text-pink-500 transition-colors">Новинки</a>
              <a href="#about" className="hover:text-pink-500 transition-colors">Про нас</a>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Мобільне меню */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-800 animate-slideIn">
            <nav className="flex flex-col space-y-3">
              <a href="#movies" className="hover:text-pink-500 transition-colors">Фільми</a>
              <a href="#schedule" className="hover:text-pink-500 transition-colors">Розклад</a>
              <a href="#news" className="hover:text-pink-500 transition-colors">Новинки</a>
              <a href="#about" className="hover:text-pink-500 transition-colors">Про нас</a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;