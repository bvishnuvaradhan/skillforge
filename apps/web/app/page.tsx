import React from "react";
import Navbar from "../components/marketing/Navbar";
import Hero from "../components/marketing/Hero";
import Features from "../components/marketing/Features";
import Workflow from "../components/marketing/Workflow";
import Pricing from "../components/marketing/Pricing";
import Footer from "../components/marketing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col">
        <Hero />
        <Features />
        <Workflow />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
