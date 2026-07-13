'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import OrderRequestModal from '@/components/order-request-modal';
import { Phone, Zap, ArrowLeft } from 'lucide-react';

export default function FloatingOrderButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Floating Action Button Container */}
      <div
        className="fixed z-50 bottom-8 right-8"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Glow Effect Background */}
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/30 via-cyan-500/30 to-blue-500/30 blur-2xl animate-pulse"
            style={{ width: '140%', height: '140%', left: '-20%', top: '-20%' }}
          />
        </div>

        {/* Main Button Group */}
        <div
          className={`flex items-center gap-3 transition-all duration-500 ease-out ${
            isExpanded ? 'pr-0' : 'pr-0'
          }`}
        >
          {/* Text Label - Slides in from left */}
          <div
            className={`flex items-center gap-2 overflow-hidden transition-all duration-500 ${
              isExpanded ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'
            }`}
          >
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 font-bold text-white transition-all duration-300 shadow-lg cursor-pointer rounded-2xl bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 whitespace-nowrap backdrop-blur-sm hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 active:scale-95"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 animate-pulse" />
                <span className="text-base">سفارش سریع</span>
              </div>
            </button>
          </div>

          {/* Circular Action Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="relative group"
          >
            {/* Rotating Border */}
            <div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-500 animate-spin"
              style={{ animationDuration: '3s' }}
            />

            {/* Inner Background */}
            <div
              className={`relative m-1 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 transition-all duration-300 ${
                isExpanded
                  ? 'w-16 h-16 shadow-2xl shadow-blue-500/50'
                  : 'w-14 h-14 shadow-xl'
              }`}
            >
              {/* Shimmer Overlay */}
              <div className="absolute inset-0 overflow-hidden rounded-full">
                <div className="absolute inset-0 transition-transform duration-1000 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>

              {/* Icon */}
              <div className="relative flex items-center justify-center w-full h-full">
                <Phone
                  className={`text-white transition-all duration-300 ${
                    isExpanded ? 'w-7 h-7 rotate-12' : 'w-6 h-6'
                  }`}
                />
              </div>

              {/* Pulse Rings */}
              <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
            </div>

            {/* Floating Particles */}
            <div
              className={`absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full transition-all duration-300 ${
                isExpanded
                  ? 'opacity-100 scale-100 animate-bounce'
                  : 'opacity-0 scale-0'
              }`}
            />
            <div
              className={`absolute -bottom-1 -left-1 w-2 h-2 bg-blue-400 rounded-full transition-all duration-500 ${
                isExpanded
                  ? 'opacity-100 scale-100 animate-pulse'
                  : 'opacity-0 scale-0'
              }`}
            />
          </button>
        </div>

        {/* Minimal Tooltip - Shows when NOT expanded */}
        {!isExpanded && (
          <div className="absolute left-0 px-4 py-2 mr-3 text-sm font-medium text-white transition-all duration-300 transform -translate-x-full -translate-y-1/2 shadow-xl opacity-0 pointer-events-none top-1/2 group-hover:opacity-100 bg-gray-900/90 backdrop-blur-sm rounded-xl">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <ArrowLeft className="w-4 h-4" />
              <span>تماس و سفارش</span>
            </div>
          </div>
        )}
      </div>

      {/* Order Modal */}
      <OrderRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productName=""
        productSpecs=""
      />

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
