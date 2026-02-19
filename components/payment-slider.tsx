"use client";

import { useEffect, useState } from "react";

const names = ["Rahul", "Priya", "Amit", "Sneha", "Vikram", "Anjali", "Rohit", "Kavita", "Arjun", "Neha"];
const amounts = [10, 20, 50, 100, 150];

export default function PaymentSlider() {
  const [slide, setSlide] = useState({ name: "Rahul", amount: 20 });
  const [animClass, setAnimClass] = useState("active");

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimClass("exit");
      setTimeout(() => {
        setSlide({
          name: names[Math.floor(Math.random() * names.length)],
          amount: amounts[Math.floor(Math.random() * amounts.length)],
        });
        setAnimClass("active");
      }, 500);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card rounded-xl mb-6 border border-yellow-500/10 bg-yellow-500/5 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-[#0f172a] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[#0f172a] to-transparent z-10" />
      <div className="payment-slider-container flex items-center justify-center">
        <div className={`payment-slide ${animClass}`}>
          <div className="flex items-center gap-2">
            <img
              src={`https://ui-avatars.com/api/?name=${slide.name}&background=random`}
              alt=""
              className="w-6 h-6 rounded-full"
              crossOrigin="anonymous"
            />
            <span className="text-xs text-slate-300">
              {slide.name} withdrew{" "}
              <span className="text-green-400 font-bold">
                {"$"}{slide.amount}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
