import { MapPin } from 'lucide-react';
import './SearchSuggestions.css';

const SearchSuggestions = ({ suggestions, activeIndex, onSelect, isLoading }) => {
  if (isLoading) {
    return (
      <div className="search-suggestions-dropdown">
        <div className="search-suggestion-item loading">
          <span className="search-suggestion-text">Searching...</span>
        </div>
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <ul className="search-suggestions-dropdown" role="listbox">
      {suggestions.map((item, index) => {
        const isActive = index === activeIndex;
        
        return (
          <li 
            key={item.id}
            role="option"
            aria-selected={isActive}
            className={`search-suggestion-item ${isActive ? 'active' : ''}`}
            onClick={() => onSelect(item)}
            onMouseEnter={() => {}}
          >
            <div className="search-suggestion-icon">
              <MapPin size={18} />
            </div>
            <div className="search-suggestion-content">
              <div className="search-suggestion-name">{item.name}</div>
              <div className="search-suggestion-subtitle">{item.subtitle}</div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default SearchSuggestions;
