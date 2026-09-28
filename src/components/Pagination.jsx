export default function Pagination({ currentPage, totalPages, totalElements, pageSize, onPageChange, disabled = false }) {
    const safeCurrentPage = Number.isFinite(currentPage) ? currentPage : 0;
    const safeTotalPages = Number.isFinite(totalPages) ? Math.max(totalPages, 1) : 1;

    if (!totalElements && totalElements !== 0) {
        return null;
    }

    return (
        <div className="pagination">
            <div>
                Tổng: <strong>{totalElements}</strong>
            </div>

            <div className="pagination-controls">
                <button
                    type="button"
                    className="secondary-button"
                    onClick={() => onPageChange(Math.max(safeCurrentPage - 1, 0))}
                    disabled={disabled || safeCurrentPage <= 0}
                >
                    Trước
                </button>

                <span>
                    Trang {safeCurrentPage + 1} / {safeTotalPages}
                </span>

                <button
                    type="button"
                    className="secondary-button"
                    onClick={() => onPageChange(Math.min(safeCurrentPage + 1, safeTotalPages - 1))}
                    disabled={disabled || safeCurrentPage >= safeTotalPages - 1}
                >
                    Sau
                </button>
            </div>

            <div>
                {pageSize} / trang
            </div>
        </div>
    );
}
