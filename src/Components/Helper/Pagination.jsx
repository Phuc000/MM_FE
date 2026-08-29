// Pagination.jsx
import React from "react";

const Pagination = ({ productsPerPage, totalProducts, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalProducts / productsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="pagination">
      <ul className="pagination__list">
        <li>
          <button
            className="pagination__button"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &laquo;
          </button>
        </li>
        {pageNumbers.map((number) => (
          <li key={number} className="pagination__item">
            <button
              onClick={() => paginate(number)}
              className={`pagination__button ${currentPage === number ? "active" : ""}`}
            >
              {number}
            </button>
          </li>
        ))}
        <li>
          <button
            className="pagination__button"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === pageNumbers.length}
          >
            &raquo;
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
