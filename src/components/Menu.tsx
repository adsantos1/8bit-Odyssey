import React, { useState } from 'react';
import './Menu.css';

interface MenuProps {
  onMenuItemClick?: (item: string) => void;
}

const Menu: React.FC<MenuProps> = ({ onMenuItemClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (item: string) => {
    if (onMenuItemClick) {
      onMenuItemClick(item);
    }
    setIsOpen(false);
  };

  return (
    <div className="menu-container">
      <button className="menu-toggle" onClick={toggleMenu}>
        <div className="hamburger-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
      
      {isOpen && (
        <div className="menu-dropdown">
          <div className="menu-item" onClick={() => handleItemClick('Home')}>
            Home
          </div>
          <div className="menu-item" onClick={() => handleItemClick('Modern Games')}>
            Modern Games
          </div>
          <div className="menu-item" onClick={() => handleItemClick('Phantom Files')}>
            Phantom Files
          </div>
          <div className="menu-item" onClick={() => handleItemClick('settings')}>
            Settings
          </div>
          <div className="menu-item" onClick={() => handleItemClick('about')}>
            About
          </div>
          <div className="menu-item" onClick={() => handleItemClick('help')}>
            Help
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu; 