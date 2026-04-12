import React from 'react';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({ end, duration = 2000, suffix = '', className = '' }: AnimatedCounterProps) {
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = 0;
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentValue = Math.floor(progress * (end - startValue) + startValue);
      
      setCount(currentValue);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [end, duration]);
  
  return <span className={className}>{count.toLocaleString()}{suffix}</span>;
}

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
  delay?: number;
}

export function FeatureCard({ icon: Icon, title, description, color, delay = 0 }: FeatureCardProps) {
  return (
    <div 
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 group hover-glow animate-fadeInUp"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

interface TestimonialCardProps {
  name: string;
  role: string;
  company: string;
  icon: React.ComponentType<{ className?: string }>;
  quote: string;
  rating: number;
}

export function TestimonialCard({ name, role, company, icon: Icon, quote, rating }: TestimonialCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover-glow transition-all duration-300">
      <div className="flex items-center mb-4">
        {[...Array(rating)].map((_, i) => (
          <svg
            key={i}
            className="h-4 w-4 text-yellow-400 fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      
      <blockquote className="text-neutral-700 mb-4 italic leading-relaxed text-sm">
        "{quote}"
      </blockquote>
      
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mr-3">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-semibold text-dark text-sm">{name}</div>
          <div className="text-xs text-neutral-600">{role}</div>
          <div className="text-xs text-neutral-500">{company}</div>
        </div>
      </div>
    </div>
  );
}

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  onCtaClick: () => void;
}

export function PricingCard({ 
  name, 
  price, 
  period, 
  description, 
  features, 
  cta, 
  popular, 
  onCtaClick 
}: PricingCardProps) {
  return (
    <div className={`rounded-xl border-2 p-6 relative hover-glow transition-all duration-300 ${
      popular 
        ? 'border-primary-300 bg-gradient-to-br from-primary-50 to-accent-50 transform scale-105' 
        : 'border-neutral-200 bg-white'
    }`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-3 py-1.5 rounded-full text-xs font-medium">
            Le plus populaire
          </span>
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-dark mb-2">{name}</h3>
        <p className="text-neutral-600 mb-3 text-sm">{description}</p>
        <div className="flex items-baseline justify-center">
          <span className="text-3xl font-bold text-dark">{price}</span>
          {period && <span className="text-neutral-600 ml-1 text-sm">{period}</span>}
        </div>
      </div>

      <ul className="space-y-3 mb-6">
        {features.map((feature, featureIndex) => (
          <li key={featureIndex} className="flex items-start">
            <svg className="h-4 w-4 text-primary-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-neutral-700 text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onCtaClick}
        className={`w-full py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 text-sm ${
          popular
            ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:shadow-lg transform hover:scale-105'
            : 'bg-neutral-100 text-dark hover:bg-neutral-200'
        }`}
      >
        {cta}
      </button>
    </div>
  );
}




