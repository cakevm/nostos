import React from 'react';

export const getBaseScanUrl = (hash: string): string => {
  return `https://sepolia.basescan.org/tx/${hash}`;
};

export const BlockExplorerLink = ({ hash, children }: { hash: string; children?: React.ReactNode }) => {
  return (
    <a
      href={getBaseScanUrl(hash)}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 hover:text-blue-600 underline inline-flex items-center gap-1"
    >
      {children || 'View on BaseScan'}
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    </a>
  );
};