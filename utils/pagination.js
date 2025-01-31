export const getPagination = (totalItems, currentPage, pageSize = 8) => {
    const totalPages = Math.ceil(totalItems / pageSize);
    currentPage = Math.max(1, Math.min(currentPage, totalPages));
    
    return {
        currentPage,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
        nextPage: currentPage + 1,
        prevPage: currentPage - 1
    };
};