"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  avatar?: string;
  content: string;
  rating: number;
  eventType?: string;
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    role: "Bride",
    content: "InviteGenerator made our wedding invitations absolutely stunning! The AI suggested designs that perfectly matched our garden theme. Our guests couldn't believe we made them ourselves.",
    rating: 5,
    eventType: "Wedding",
  },
  {
    id: "2",
    name: "Michael Chen",
    role: "Event Planner",
    company: "Elegant Events Co.",
    content: "As a professional event planner, I've tried many invitation tools. InviteGenerator is by far the most intuitive and produces the highest quality results. It's now my go-to for all client events.",
    rating: 5,
    eventType: "Corporate",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    role: "Mom of 3",
    content: "Planning birthday parties for my kids used to be so stressful. With InviteGenerator, I can create amazing invitations in minutes. The RSVP tracking feature is a game-changer!",
    rating: 5,
    eventType: "Birthday",
  },
  {
    id: "4",
    name: "David Thompson",
    role: "Marketing Director",
    company: "TechStart Inc.",
    content: "We use InviteGenerator for all our corporate events now. The professional templates and customization options make our invitations stand out. Plus, the analytics help us track engagement.",
    rating: 5,
    eventType: "Corporate",
  },
  {
    id: "5",
    name: "Jennifer Park",
    role: "New Mom",
    content: "The baby shower invitations I created were beautiful! The AI feature understood exactly what I wanted and created options that were perfect for our woodland theme. Highly recommend!",
    rating: 5,
    eventType: "Baby Shower",
  },
  {
    id: "6",
    name: "Robert Williams",
    role: "Groom",
    content: "My fiancée and I were overwhelmed with wedding planning until we found InviteGenerator. Creating our save-the-dates and invitations became the fun part of planning. Worth every penny!",
    rating: 5,
    eventType: "Wedding",
  },
];

interface TestimonialsProps {
  variant?: "grid" | "carousel" | "featured";
  className?: string;
  maxItems?: number;
}

export function Testimonials({ variant = "grid", className = "", maxItems = 6 }: TestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const displayedTestimonials = testimonials.slice(0, maxItems);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % displayedTestimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? displayedTestimonials.length - 1 : prev - 1
    );
  };

  if (variant === "carousel") {
    return (
      <div className={`relative ${className}`}>
        <div className="overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-surface-200"
            >
              <TestimonialCard testimonial={displayedTestimonials[currentIndex]} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={prev}
            className="p-2 rounded-full bg-surface-100 hover:bg-surface-200 transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            {displayedTestimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? "bg-brand-500" : "bg-surface-300"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="p-2 rounded-full bg-surface-100 hover:bg-surface-200 transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (variant === "featured") {
    const featured = displayedTestimonials[0];
    return (
      <div className={`relative bg-brand-50 rounded-3xl p-8 md:p-12 ${className}`}>
        <Quote className="absolute top-6 right-6 w-16 h-16 text-brand-200" />
        <div className="relative">
          <div className="flex items-center gap-1 mb-4">
            {[...Array(featured.rating)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <blockquote className="text-2xl md:text-3xl font-heading text-surface-900 mb-6">
            &ldquo;{featured.content}&rdquo;
          </blockquote>
          <div className="flex items-center gap-4">
            {featured.avatar ? (
              <Image
                src={featured.avatar}
                alt={featured.name}
                width={56}
                height={56}
                className="rounded-full"
              />
            ) : (
              <div className="w-14 h-14 bg-brand-200 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-brand-700">
                  {featured.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <p className="font-semibold text-surface-900">{featured.name}</p>
              <p className="text-surface-600">{featured.role}</p>
              {featured.eventType && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-brand-100 text-brand-700 text-xs rounded-full">
                  {featured.eventType}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid variant (default)
  return (
    <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {displayedTestimonials.map((testimonial) => (
        <div
          key={testimonial.id}
          className="bg-white rounded-2xl p-6 shadow-sm border border-surface-200 hover:shadow-md transition-shadow"
        >
          <TestimonialCard testimonial={testimonial} />
        </div>
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <blockquote className="text-surface-700 mb-4">
        &ldquo;{testimonial.content}&rdquo;
      </blockquote>
      <div className="flex items-center gap-3">
        {testimonial.avatar ? (
          <Image
            src={testimonial.avatar}
            alt={testimonial.name}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
            <span className="font-semibold text-brand-700">
              {testimonial.name.charAt(0)}
            </span>
          </div>
        )}
        <div>
          <p className="font-semibold text-surface-900 text-sm">{testimonial.name}</p>
          <p className="text-surface-500 text-xs">
            {testimonial.role}
            {testimonial.company && ` at ${testimonial.company}`}
          </p>
        </div>
        {testimonial.eventType && (
          <span className="ml-auto px-2 py-0.5 bg-surface-100 text-surface-600 text-xs rounded-full">
            {testimonial.eventType}
          </span>
        )}
      </div>
    </div>
  );
}
