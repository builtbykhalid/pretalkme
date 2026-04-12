import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    siblingCount?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    siblingCount = 1,
}) => {
    if (totalPages <= 1) return null;

    const range = (start: number, end: number) => {
        let length = end - start + 1;
        return Array.from({ length }, (_, idx) => idx + start);
    };

    const paginationRange = () => {
        const totalPageNumbers = siblingCount + 5;

        if (totalPageNumbers >= totalPages) {
            return range(1, totalPages);
        }

        const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
        const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

        const shouldShowLeftDots = leftSiblingIndex > 2;
        const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

        const firstPageIndex = 1;
        const lastPageIndex = totalPages;

        if (!shouldShowLeftDots && shouldShowRightDots) {
            let leftItemCount = 3 + 2 * siblingCount;
            let leftRange = range(1, leftItemCount);
            return [...leftRange, '...', totalPages];
        }

        if (shouldShowLeftDots && !shouldShowRightDots) {
            let rightItemCount = 3 + 2 * siblingCount;
            let rightRange = range(totalPages - rightItemCount + 1, totalPages);
            return [firstPageIndex, '...', ...rightRange];
        }

        if (shouldShowLeftDots && shouldShowRightDots) {
            let middleRange = range(leftSiblingIndex, rightSiblingIndex);
            return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
        }

        return [];
    };

    const pages = paginationRange();

    return (
        <nav className="flex items-center justify-center space-x-2 mt-8 py-6">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2.5 rounded-xl border border-neutral-100 transition-all ${currentPage === 1
                        ? 'text-neutral-300 bg-neutral-50/50 cursor-not-allowed'
                        : 'text-dark bg-white hover:bg-neutral-50 hover:shadow-lg active:scale-95'
                    }`}
                aria-label="Page précédente"
            >
                <ChevronLeft size={18} strokeWidth={2.5} />
            </button>

            <div className="flex items-center space-x-1.5">
                {pages.map((pageNumber, idx) => {
                    if (pageNumber === '...') {
                        return (
                            <div key={`dots-${idx}`} className="p-2 text-neutral-300">
                                <MoreHorizontal size={18} strokeWidth={2} />
                            </div>
                        );
                    }

                    const page = pageNumber as number;
                    const isActive = page === currentPage;

                    return (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`min-w-[44px] h-[44px] rounded-xl text-sm font-semibold transition-all border ${isActive
                                    ? 'bg-dark text-white border-dark shadow-xl shadow-black/10 scale-105'
                                    : 'bg-white text-neutral-500 border-neutral-100 hover:border-neutral-300 hover:text-dark'
                                }`}
                        >
                            {page}
                        </button>
                    );
                })}
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2.5 rounded-xl border border-neutral-100 transition-all ${currentPage === totalPages
                        ? 'text-neutral-300 bg-neutral-50/50 cursor-not-allowed'
                        : 'text-dark bg-white hover:bg-neutral-50 hover:shadow-lg active:scale-95'
                    }`}
                aria-label="Page suivante"
            >
                <ChevronRight size={18} strokeWidth={2.5} />
            </button>
        </nav>
    );
};
