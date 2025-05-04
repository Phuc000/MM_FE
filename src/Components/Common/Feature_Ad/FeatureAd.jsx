import React, { useEffect, useRef, useState } from 'react';
import './FeatureAd.css';

const FeatureAd = () => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  // Set up Intersection Observer to detect when component is in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once we've seen it, no need to keep observing
          observer.disconnect();
        }
      },
      {
        threshold: 0.15, // Trigger when 15% of the component is visible
        rootMargin: '0px 0px -50px 0px' // Adjust trigger point slightly
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  const features = [
    {
      icon: 'ad1.png', 
      title: 'Best prices & offers',
      description: 'Orders now'
    },
    {
      icon: 'ad2.png',
      title: 'Free delivery',
      description: '24/7 amazing services'
    },
    {
      icon: 'ad3.png',
      title: 'Great daily deal',
      description: 'When you sign up'
    },
    {
      icon: 'ad4.png',
      title: 'Wide assortment',
      description: 'Mega Discounts'
    },
    {
      icon: 'ad5.png',
      title: 'Easy returns',
      description: 'Within 30 days'
    }
  ];

  return (
    <div 
      ref={containerRef} 
      className="feature-ad-container"
    >
      {features.map((feature, index) => (
        <div 
          key={index} 
          className="feature-card"
          style={{
            animation: isVisible 
              ? `fadeInUp 0.6s ease forwards ${index * 0.15}s` 
              : 'none',
            opacity: 0, // Start invisible
          }}
        >
          <div className="feature-icon">
            <img src={`/Images/ad/${feature.icon}`} alt={feature.title} />
          </div>
          <div className="feature-info">
            <h4 className="feature-title">{feature.title}</h4>
            <p className="feature-description">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeatureAd;