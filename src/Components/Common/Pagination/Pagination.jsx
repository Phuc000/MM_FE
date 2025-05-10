import React from 'react';
import './Pagination.css';

const Pagination = ({ items, itemsPerPage = 10, children }) => {
  const [currentPage, setCurrentPage] = React.useState(1);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(items.length / itemsPerPage);

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
    const sideWindow = 2; // Show 2 pages before and after current page when possible

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
    <div className="pagination-container">
      <div style={{ marginLeft: '15px' }}>
        {children(currentItems, items.length, (
          items.length > itemsPerPage && (
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
    </div>
  );
};

export default Pagination;