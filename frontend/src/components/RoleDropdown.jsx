import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './RoleDropdown.css';

const DEFAULT_OPTIONS = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Analyst',
  'ML Engineer',
];

const RoleDropdown = ({ 
  value, 
  onChange, 
  options = DEFAULT_OPTIONS, 
  defaultLabel = 'All Specializations' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (role) => {
    const filterValue = role === defaultLabel ? '' : role;
    onChange(filterValue);
    setIsOpen(false);
  };

  const displayValue = value || defaultLabel;

  const allOptions = [defaultLabel, ...options];

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <button 
        className={`dropdown-trigger ${isOpen ? 'is-active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="dropdown-label">{displayValue}</span>
        <ChevronDown 
          size={18} 
          className={`dropdown-chevron ${isOpen ? 'rotate' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="dropdown-list glass-card"
          >
            {allOptions.map((role) => {
              const roleVal = role === defaultLabel ? '' : role;
              const isSelected = value === roleVal;
              
              return (
                <li 
                  key={role} 
                  className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(role)}
                >
                  {role}
                  {isSelected && <Check size={14} className="check-icon" />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoleDropdown;
