// PaginationFilter.jsx
import React from 'react';
import './PaginationFilter.css';

const PaginationFilter = ({ items, itemsPerPage = 50, showOnSaleFilter = false, children }) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [filters, setFilters] = React.useState({
    aisle: 'All',
    priceRange: { min: '', max: '' },
    // consistency: 'All',
    onSale: false
  });

  // Get unique values for filters
  const uniqueAisles = ['All', ...new Set(items.map(item => item.aisle).filter(Boolean))];
  // const uniqueConsistencies = ['All', ...new Set(items.map(item => item.consistency).filter(Boolean))];

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesAisle = filters.aisle === 'All' || item.aisle === filters.aisle;
    const discountedPrice = item.discountedPrice || 0;
    const minPrice = filters.priceRange.min ? parseFloat(filters.priceRange.min) : -Infinity;
    const maxPrice = filters.priceRange.max ? parseFloat(filters.priceRange.max) : Infinity;
    const matchesPrice = discountedPrice >= minPrice && discountedPrice <= maxPrice;
    // const matchesConsistency = filters.consistency === 'All' || item.consistency === filters.consistency;
    const matchesSale = !showOnSaleFilter || !filters.onSale || (item.discount > 0);
    
    // return matchesAisle && matchesPrice && matchesConsistency && matchesSale;
    return matchesAisle && matchesPrice && matchesSale;
  });

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Filter handler
  const handleFilterChange = (filterType, value) => {
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters };
      if (filterType === 'aisle') newFilters.aisle = value;
      else if (filterType === 'priceMin') newFilters.priceRange.min = value;
      else if (filterType === 'priceMax') newFilters.priceRange.max = value;
      // else if (filterType === 'consistency') newFilters.consistency = value;
      else if (filterType === 'onSale') newFilters.onSale = value;
      return newFilters;
    });
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Render pagination buttons
  const renderPaginationButtons = () => {
    if (totalPages <= 5) {
      // Show all pages if 5 or fewer
      return Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
        <button
          key={page}
          onClick={() => goToPage(page)}
          className={`btn btn--secondary ${currentPage === page ? 'active' : ''}`}
        >
          {page}
        </button>
      ));
    }

    const buttons = [];
    const maxButtons = 5; // Show up to 5 numbers (including first and last)
    const sideWindow = 2; // Show 2 pages Oprahbefore and after current page when possible

    // Always show first page
    buttons.push(
      <button
        key={1}
        onClick={() => goToPage(1)}
        className={`btn btn--secondary ${currentPage === 1 ? 'active' : ''}`}
      >
        1
      </button>
    );

    // Determine the range of pages to show around currentPage
    let startPage = Math.max(2, currentPage - sideWindow);
    let endPage = Math.min(totalPages - 1, currentPage + sideWindow);

    // Adjust if near the start or end
    if (currentPage <= sideWindow + 1) {
      endPage = maxButtons - 1; // Show more at the start
    } else if (currentPage >= totalPages - sideWindow) {
      startPage = totalPages - maxButtons + 2; // Show more at the end
    }

    // Add ellipsis if there's a gap between 1 and startPage
    if (startPage > 2) {
      buttons.push(<span key="ellipsis-start" className="pagination-ellipsis">...</span>);
    }

    // Add pages around currentPage
    for (let page = startPage; page <= endPage; page++) {
      buttons.push(
        <button
          key={page}
          onClick={() => goToPage(page)}
          className={`btn btn--secondary ${currentPage === page ? 'active' : ''}`}
        >
          {page}
        </button>
      );
    }

    // Add ellipsis if there's a gap between endPage and last page
    if (endPage < totalPages - 1) {
      buttons.push(<span key="ellipsis-end" className="pagination-ellipsis">...</span>);
    }

    // Always show last page
    if (totalPages > 1) {
      buttons.push(
        <button
          key={totalPages}
          onClick={() => goToPage(totalPages)}
          className={`btn btn--secondary ${currentPage === totalPages ? 'active' : ''}`}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="pagination-filter">
      <div className="filter-controls">
        <div className="filter-group">
          <label htmlFor="aisle-filter">Category: </label>
          <select
            id="aisle-filter"
            value={filters.aisle}
            onChange={(e) => handleFilterChange('aisle', e.target.value)}
            className="filter-dropdown"
          >
            {uniqueAisles.map((aisle) => (
              <option key={aisle} value={aisle}>{aisle}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Price Range: </label>
          <input
            type="number"
            placeholder="Min"
            value={filters.priceRange.min}
            onChange={(e) => handleFilterChange('priceMin', e.target.value)}
            className="filter-input"
            min="0"
            step="0.01"
          />
          <span> - </span>
          <input
            type="number"
            placeholder="Max"
            value={filters.priceRange.max}
            onChange={(e) => handleFilterChange('priceMax', e.target.value)}
            className="filter-input"
            min="0"
            step="0.01"
          />
        </div>
        {/* <div className="filter-group">
          <label htmlFor="consistency-filter">Consistency: </label>
          <select
            id="consistency-filter"
            value={filters.consistency}
            onChange={(e) => handleFilterChange('consistency', e.target.value)}
            className="filter-dropdown"
          >
            {uniqueConsistencies.map((consistency) => (
              <option key={consistency} value={consistency}>{consistency}</option>
            ))}
          </select>
        </div> */}
        {showOnSaleFilter && (
          <div className="filter-group">
            <label>
              <input
                type="checkbox"
                checked={filters.onSale}
                onChange={(e) => handleFilterChange('onSale', e.target.checked)}
              />
              On Sale Only
            </label>
          </div>
        )}
      </div>

      {children(currentItems, filteredItems.length, (
        filteredItems.length > itemsPerPage && (
          <div className="pagination">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="btn btn--secondary"
            >
              Previous
            </button>
            {renderPaginationButtons()}
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="btn btn--secondary"
            >
              Next
            </button>
          </div>
        )
      ))}
    </div>
  );
};

export default PaginationFilter;