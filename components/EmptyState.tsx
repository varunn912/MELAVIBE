import React from 'react';

interface EmptyStateProps {
  Icon: React.FC<{ className?: string }>;
  title: string;
  message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ Icon, title, message }) => {
  return (
    <div className="text-center py-16 px-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark">
      <div className="flex justify-center items-center mb-6">
        <div className="bg-primary/10 p-4 rounded-full">
            <Icon className="w-16 h-16 text-primary" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-copy-primary-light dark:text-copy-primary-dark mb-2">{title}</h3>
      <p className="text-copy-secondary-light dark:text-copy-secondary-dark max-w-sm mx-auto">{message}</p>
    </div>
  );
};

export default EmptyState;