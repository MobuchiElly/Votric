"use client";

import { useState, useEffect, useRef } from "react";
import { FeatureCard } from "./FeatureCard";
import { Lightbulb, Share2, BarChart2 } from "lucide-react";

export function FeaturesSection() {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);


 useEffect(() => {
  if (!containerRef.current || isHovered) return;

  const container = containerRef.current;
  const scrollLeft = Math.floor(container.scrollLeft);
  const step = 1;

  const interval = setInterval(() => {
    const loopPoint = container.scrollWidth / 2;
    if (scrollLeft >= loopPoint) {
      container.scrollLeft = 0;
    } else {
      container.scrollLeft += step;
    }
  }, 16); // ~60fps

  return () => clearInterval(interval);
  }, [isHovered]);

  
  const features = [
    {
      id: 1,
      icon: <Lightbulb />,
      title: "Intuitive Poll Creation",
      description: "Craft engaging polls in minutes with our user-friendly interface. No coding required!",
    },
    {
      id: 2,
      icon: <Share2 />,
      title: "Seamless Sharing Options",
      description: "Distribute your polls effortlessly via unique links, QR codes, or social media.",
    },
    {
      id: 3,
      icon: <BarChart2 />,
      title: "Real-time Analytics",
      description: "Gain instant insights with live updates and comprehensive visualizations of your poll results.",
    },
    {
      id: 4,
      icon: <Lightbulb />,
      title: "Intuitive Poll Creation",
      description: "Craft engaging polls in minutes with our user-friendly interface. No coding required!",
    },
    {
      id: 5,
      icon: <Share2 />,
      title: "Seamless Sharing Options",
      description: "Distribute your polls effortlessly via unique links, QR codes, or social media.",
    },
    {
      id: 6,
      icon: <BarChart2 />,
      title: "Real-time Analytics",
      description: "Gain instant insights with live updates and comprehensive visualizations of your poll results.",
    },
  ]


  return (
    <section className="mt-24 px-2 md:px-8">
      <div className="max-w-sm md:max-w-5xl lg:max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl text-black font-semibold mb-6">
          Empower Your Decisions with Our Key Features
        </h2>
        <p className="text-lg text-gray-600">
          Type your question, drop in your choices, and your poll is ready to go. No complex setups or endless forms.
        </p>

        <div 
          ref = {containerRef}
          className="flex gap-4 mt-20 overflow-hidden scroll-smooth" 
          onMouseEnter={() => setIsHovered(true)} 
          onMouseLeave={() => setIsHovered(false)}>
          {
            features.map((feature) => (
              <FeatureCard
                key={feature.id}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))
          }
        </div>
      </div>
    </section>
  );
}