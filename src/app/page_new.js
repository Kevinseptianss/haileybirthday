'use client';
import Image from "next/image";
import { useState } from "react";
import FloatingBalloons from "../components/FloatingBalloons";
import ConfettiButton from "../components/ConfettiButton";

export default function Home() {
  const [showRSVP, setShowRSVP] = useState(false);
  const [rsvpData, setRsvpData] = useState({
    name: '',
    attending: '',
    adults: 1,
    children: 0,
    message: ''
  });
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  const handleRSVPSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to a backend
    console.log('RSVP Data:', rsvpData);
    setRsvpSubmitted(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRsvpData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Floating Background Elements */}
      <FloatingBalloons />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm shadow-sm z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-pink-600" style={{ fontFamily: 'Sour Gummy, cursive' }}>
              Hailey's 1st Birthday
            </h1>
            <button
              onClick={() => setShowRSVP(!showRSVP)}
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              RSVP 💌
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12 relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <div className="text-9xl">🎂</div>
            </div>
            <div className="relative z-10">
              <h1 className="text-6xl md:text-8xl font-bold text-pink-400 mb-4" 
                  style={{ 
                    fontFamily: 'Sour Gummy, cursive',
                    textShadow: '2px 2px 4px rgba(214, 184, 186, 0.3)',
                    background: 'linear-gradient(45deg, #f472b6, #ec4899, #db2777)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                Hailey
              </h1>
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-16 h-1 bg-gradient-to-r from-pink-300 to-pink-400 rounded"></div>
                <span className="text-3xl animate-bounce">🎂</span>
                <div className="w-16 h-1 bg-gradient-to-l from-pink-300 to-pink-400 rounded"></div>
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl text-pink-600 mb-4 font-semibold">
              is turning <span className="text-pink-500 font-bold text-5xl">ONE!</span>
            </h2>
            
            <p className="text-xl text-pink-500 mb-8">
              Join us for a magical celebration 🎈✨
            </p>
            
            {/* Countdown Timer */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto shadow-lg">
              <h3 className="text-pink-600 font-semibold mb-4" style={{ fontFamily: 'Sour Gummy, cursive' }}>
                Celebration in:
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-pink-100 rounded-xl p-3">
                  <div className="text-2xl font-bold text-pink-600">8</div>
                  <div className="text-xs text-pink-500">Days</div>
                </div>
                <div className="bg-pink-100 rounded-xl p-3">
                  <div className="text-2xl font-bold text-pink-600">Aug</div>
                  <div className="text-xs text-pink-500">Month</div>
                </div>
                <div className="bg-pink-100 rounded-xl p-3">
                  <div className="text-2xl font-bold text-pink-600">2025</div>
                  <div className="text-xs text-pink-500">Year</div>
                </div>
              </div>
            </div>
          </div>

          {/* Image Carousel */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-white rounded-3xl shadow-2xl p-8 relative overflow-hidden">
              <div className="absolute top-4 left-4 text-2xl opacity-20">🌟</div>
              <div className="absolute top-4 right-4 text-2xl opacity-20">🎈</div>
              <div className="absolute bottom-4 left-4 text-2xl opacity-20">🎁</div>
              <div className="absolute bottom-4 right-4 text-2xl opacity-20">💖</div>
              
              <h3 className="text-2xl font-bold text-pink-600 text-center mb-6" style={{ fontFamily: 'Sour Gummy, cursive' }}>
                Our Little Star ⭐
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative h-64 rounded-2xl overflow-hidden group">
                  <Image
                    src="/carousel.jpg"
                    alt="Hailey's Photo 1"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-pink-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="relative h-64 rounded-2xl overflow-hidden group">
                  <Image
                    src="/carousl2.jpg"
                    alt="Hailey's Photo 2"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-pink-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="relative h-64 rounded-2xl overflow-hidden group">
                  <Image
                    src="/carousel3.jpg"
                    alt="Hailey's Photo 3"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-pink-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-300 via-pink-400 to-pink-500"></div>
              
              <h3 className="text-3xl font-bold text-pink-600 text-center mb-8" 
                  style={{ fontFamily: 'Sour Gummy, cursive' }}>
                Celebration Details 🎉
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-pink-50 to-pink-100 rounded-2xl border-l-4 border-pink-400 hover:shadow-lg transition-shadow duration-300">
                  <div className="text-4xl animate-pulse">📅</div>
                  <div>
                    <h4 className="font-semibold text-pink-700 text-lg">Date</h4>
                    <p className="text-pink-600 font-medium">8 Agustus 2025</p>
                    <p className="text-pink-500 text-sm">Friday</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-pink-50 to-pink-100 rounded-2xl border-l-4 border-pink-400 hover:shadow-lg transition-shadow duration-300">
                  <div className="text-4xl animate-pulse">🕕</div>
                  <div>
                    <h4 className="font-semibold text-pink-700 text-lg">Time</h4>
                    <p className="text-pink-600 font-medium">18:00 WIB</p>
                    <p className="text-pink-500 text-sm">6:00 PM</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-pink-50 to-pink-100 rounded-2xl border-l-4 border-pink-400 hover:shadow-lg transition-shadow duration-300">
                  <div className="text-4xl animate-pulse">📍</div>
                  <div>
                    <h4 className="font-semibold text-pink-700 text-lg">Venue</h4>
                    <p className="text-pink-600 font-medium">Aroem Restaurant & Ballroom</p>
                    <p className="text-pink-500 text-sm">
                      Jl. Dr. Wahidin No.213, Kaliwiru<br />
                      Kec. Candisari, Kota Semarang<br />
                      Jawa Tengah 50253
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-pink-50 to-pink-100 rounded-2xl border-l-4 border-pink-400 hover:shadow-lg transition-shadow duration-300">
                  <div className="text-4xl animate-pulse">👗</div>
                  <div>
                    <h4 className="font-semibold text-pink-700 text-lg">Dress Code</h4>
                    <p className="text-pink-600 font-medium">Pastel Colors</p>
                    <p className="text-pink-500 text-sm">Soft pinks, blues, lavenders, mint greens</p>
                    <div className="flex gap-2 mt-2">
                      <div className="w-6 h-6 rounded-full bg-pink-200 border-2 border-pink-300"></div>
                      <div className="w-6 h-6 rounded-full bg-blue-200 border-2 border-blue-300"></div>
                      <div className="w-6 h-6 rounded-full bg-purple-200 border-2 border-purple-300"></div>
                      <div className="w-6 h-6 rounded-full bg-green-200 border-2 border-green-300"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RSVP Modal */}
      {showRSVP && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border-t-4 border-pink-400">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-bold text-pink-600" 
                    style={{ fontFamily: 'Sour Gummy, cursive' }}>
                  RSVP 💌
                </h3>
                <button
                  onClick={() => setShowRSVP(false)}
                  className="text-gray-500 hover:text-gray-700 text-3xl hover:bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center transition-colors duration-200"
                >
                  ×
                </button>
              </div>

              {!rsvpSubmitted ? (
                <form onSubmit={handleRSVPSubmit} className="space-y-6">
                  <div>
                    <label className="block text-pink-700 font-semibold mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={rsvpData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full p-4 border-2 border-pink-200 rounded-xl focus:border-pink-400 focus:outline-none transition-colors duration-200"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-pink-700 font-semibold mb-3">
                      Will you be attending? *
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center p-3 bg-pink-50 rounded-xl cursor-pointer hover:bg-pink-100 transition-colors duration-200">
                        <input
                          type="radio"
                          name="attending"
                          value="yes"
                          checked={rsvpData.attending === 'yes'}
                          onChange={handleInputChange}
                          className="text-pink-500 mr-3 w-5 h-5"
                        />
                        <span className="text-pink-600 font-medium">Yes, I'll be there! 🎉</span>
                      </label>
                      <label className="flex items-center p-3 bg-pink-50 rounded-xl cursor-pointer hover:bg-pink-100 transition-colors duration-200">
                        <input
                          type="radio"
                          name="attending"
                          value="no"
                          checked={rsvpData.attending === 'no'}
                          onChange={handleInputChange}
                          className="text-pink-500 mr-3 w-5 h-5"
                        />
                        <span className="text-pink-600 font-medium">Sorry, I can't make it 😢</span>
                      </label>
                    </div>
                  </div>

                  {rsvpData.attending === 'yes' && (
                    <div className="bg-pink-50 p-4 rounded-xl">
                      <h4 className="text-pink-700 font-semibold mb-3">Party Size</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-pink-700 font-medium mb-2">
                            Adults
                          </label>
                          <select
                            name="adults"
                            value={rsvpData.adults}
                            onChange={handleInputChange}
                            className="w-full p-3 border-2 border-pink-200 rounded-xl focus:border-pink-400 focus:outline-none"
                          >
                            {[1,2,3,4,5].map(num => (
                              <option key={num} value={num}>{num}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-pink-700 font-medium mb-2">
                            Children
                          </label>
                          <select
                            name="children"
                            value={rsvpData.children}
                            onChange={handleInputChange}
                            className="w-full p-3 border-2 border-pink-200 rounded-xl focus:border-pink-400 focus:outline-none"
                          >
                            {[0,1,2,3,4,5].map(num => (
                              <option key={num} value={num}>{num}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-pink-700 font-semibold mb-2">
                      Special Message for Hailey 💕
                    </label>
                    <textarea
                      name="message"
                      value={rsvpData.message}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full p-4 border-2 border-pink-200 rounded-xl focus:border-pink-400 focus:outline-none resize-none"
                      placeholder="Share your birthday wishes for our little princess..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Submit RSVP 🎈
                  </button>
                </form>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4 animate-bounce">🎉</div>
                  <h3 className="text-2xl font-bold text-pink-600 mb-4" style={{ fontFamily: 'Sour Gummy, cursive' }}>
                    Thank You!
                  </h3>
                  <p className="text-pink-500 mb-6 leading-relaxed">
                    Your RSVP has been received. We can't wait to celebrate Hailey's special day with you!
                  </p>
                  <div className="bg-pink-100 p-4 rounded-xl mb-6">
                    <p className="text-pink-600 text-sm">
                      💌 You'll receive more details closer to the celebration date.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowRSVP(false);
                      setRsvpSubmitted(false);
                      setRsvpData({
                        name: '',
                        attending: '',
                        adults: 1,
                        children: 0,
                        message: ''
                      });
                    }}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full transition-colors duration-300 font-medium"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Elements */}
      <ConfettiButton />
      
      {/* Decorative Elements */}
      <div className="fixed bottom-4 right-16 text-4xl animate-bounce z-20">
        🎈
      </div>
      <div className="fixed bottom-4 left-4 text-4xl animate-pulse z-20">
        🎂
      </div>
      <div className="fixed top-1/2 left-4 text-2xl opacity-60 animate-bounce" style={{ animationDelay: '1s' }}>
        ⭐
      </div>
      <div className="fixed top-1/3 right-4 text-2xl opacity-60 animate-bounce" style={{ animationDelay: '2s' }}>
        🌟
      </div>
    </div>
  );
}
