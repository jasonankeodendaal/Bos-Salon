import React from 'react';

const ShowroomIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || 'w-6 h-6'}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.125 3.875 16.5 2.25 19.875 3.875m-3.375 0V18m-3.375-14.125L9.75 2.25 6.375 3.875m3.375 0V18m6.375 0-3.375-1.625m-3.375 0L9.75 18m-3.375 0-3.375-1.625m13.5 1.625V21.75a2.25 2.25 0 0 1-2.25 2.25H6.375A2.25 2.25 0 0 1 4.125 21.75V16.375m13.5 1.625-3.375-1.625m-3.375 0L9.75 18m-3.375 0-3.375-1.625" />
    </svg>
);

export default ShowroomIcon;
