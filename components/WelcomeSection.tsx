import React from 'react';

interface WelcomeSectionProps {
  title?: string;
  text?: string;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ 
  title = "Welcome",
  text = "We are glad you are here."
}) => {
  return (
    <section className="relative bg-brand-dark py-12 sm:py-20 text-brand-light">
      <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center max-w-4xl">
          <h2 className="font-script text-3xl sm:text-6xl text-brand-green mb-4 leading-tight">
            {title}
          </h2>
          <div className="w-16 sm:w-24 h-0.5 sm:h-1 bg-brand-gold mx-auto mb-6 sm:mb-8"></div>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-xl whitespace-pre-wrap">
            {text}
          </p>
      </div>
    </section>
  );
};

export default WelcomeSection;
