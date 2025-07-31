'use client';
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useParams } from 'next/navigation';
import FloatingBalloons from "../../../components/FloatingBalloons";
import ConfettiButton from "../../../components/ConfettiButton";

export default function GuestInvitation() {
  const params = useParams();
  const guestId = params.id;
  
  // Guest data state
  const [guestData, setGuestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [rsvpData, setRsvpData] = useState({
    attending: '',
    guestCount: 1,
    customCount: '',
    message: ''
  });
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [submittedWishes, setSubmittedWishes] = useState([]);
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Background music effect
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      audio.volume = 0.3; // Set volume to 30%
      audio.loop = true; // Loop the audio
      
      // Add event listeners for audio state
      const handlePlay = () => setAudioPlaying(true);
      const handlePause = () => setAudioPlaying(false);
      const handleEnded = () => setAudioPlaying(false);
      
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);
      
      // Start playing immediately
      const playAudio = () => {
        audio.play().catch(e => {
          console.log('Audio autoplay failed, trying again on user interaction:', e);
        });
      };
      
      playAudio();

      // Cleanup event listeners
      return () => {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, []);

  // Add click listener to start audio on any user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(e => {
          console.log('Audio play failed:', e);
        });
      }
    };

    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  // Countdown timer effect
  useEffect(() => {
    const targetDate = new Date('2025-08-08T18:00:00');
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;
      
      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        setCountdown({ days, hours, minutes, seconds });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    
    updateCountdown(); // Initial call
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch guest data and existing wishes
  useEffect(() => {
    if (guestId) {
      fetchGuestData();
      fetchExistingWishes();
    }
  }, [guestId]);

  const fetchGuestData = async () => {
    try {
      const response = await fetch(`/api/guests/${guestId}`);
      if (response.ok) {
        const guest = await response.json();
        setGuestData(guest);
        
        // Check if already RSVP'd
        if (guest.rsvpStatus && guest.rsvpStatus !== 'pending') {
          setRsvpSubmitted(true);
          const totalGuests = guest.additionalGuests ? parseInt(guest.additionalGuests) + 1 : 1;
          setRsvpData({
            attending: guest.rsvpStatus,
            guestCount: totalGuests <= 3 ? totalGuests : 'custom',
            customCount: totalGuests > 3 ? totalGuests.toString() : '',
            message: guest.message || ''
          });
        }
      } else {
        console.error('Guest not found');
      }
    } catch (error) {
      console.error('Error fetching guest data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingWishes = async () => {
    try {
      const response = await fetch('/api/rsvp');
      if (response.ok) {
        const rsvpResponses = await response.json();
        const wishes = rsvpResponses
          .filter(rsvp => rsvp.message && rsvp.message.trim())
          .map(rsvp => ({
            id: rsvp.id,
            name: rsvp.guestName || 'Guest',
            message: rsvp.message,
            attending: rsvp.attending
          }));
        setSubmittedWishes(wishes);
      }
    } catch (error) {
      console.error('Error fetching wishes:', error);
    }
  };

  // Function to add event to calendar
  const addToCalendar = () => {
    const startDate = new Date('2025-08-08T18:00:00');
    const endDate = new Date('2025-08-08T22:00:00');
    
    const title = encodeURIComponent("Hailey's 1st Birthday Celebration");
    const details = encodeURIComponent("Join us for Hailey's magical 1st birthday party!");
    const location = encodeURIComponent("Aroem Restaurant & Ballroom, Jl. Dr. Wahidin No.213, Kaliwiru, Kec. Candisari, Kota Semarang, Jawa Tengah 50253");
    
    const startTime = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endTime = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&location=${location}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  // Function to open Google Maps
  const openGoogleMaps = () => {
    window.open('https://maps.app.goo.gl/hpKE9kBqJjR7KGpr6?g_st=ipc', '_blank');
  };

  // Function to trigger confetti
  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleRSVPSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Calculate additional guests (excluding the main guest)
      let additionalGuests = 0;
      if (rsvpData.attending === 'yes') {
        if (rsvpData.guestCount === 'custom') {
          additionalGuests = parseInt(rsvpData.customCount) - 1;
        } else {
          additionalGuests = parseInt(rsvpData.guestCount) - 1;
        }
        // Ensure additionalGuests is not negative
        additionalGuests = Math.max(0, additionalGuests);
      }

      // Save RSVP to Firebase
      const rsvpPayload = {
        guestId: guestId,
        attending: rsvpData.attending,
        additionalGuests: additionalGuests,
        message: rsvpData.message
      };

      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rsvpPayload),
      });

      if (response.ok) {
        // Add the wish to the wishes list if message exists
        if (rsvpData.message.trim() && guestData) {
          setSubmittedWishes(prev => [...prev, {
            name: guestData.name,
            message: rsvpData.message,
            attending: rsvpData.attending,
            id: Date.now()
          }]);
        }
        console.log('RSVP Data saved successfully');
        setRsvpSubmitted(true);
        
        // Refresh guest data to get updated RSVP status
        await fetchGuestData();
      } else {
        const errorData = await response.json();
        console.error('Failed to save RSVP:', errorData);
        alert(`Failed to save RSVP: ${errorData.error || 'Unknown error'}. Please try again.`);
      }
    } catch (error) {
      console.error('Error saving RSVP:', error);
      alert('Error saving RSVP. Please check your connection and try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRsvpData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-400 mx-auto mb-4"></div>
          <p className="text-pink-600 text-lg">Loading invitation...</p>
        </div>
      </div>
    );
  }

  // Guest not found state
  if (!guestData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-pink-600 mb-4">Invitation Not Found</h1>
          <p className="text-gray-600">This invitation link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 relative overflow-hidden" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Background Music */}
      <audio ref={audioRef} loop>
        <source src="/backsound.mp3" type="audio/mpeg" />
      </audio>

      {/* Background Images */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Multiple Continuous Floating Hot Air Balloons */}
        {/* Left side balloons */}
        <div className="absolute left-5 opacity-15">
          <Image src="/hot-baloon.png" alt="Hot Air Balloon" width={120} height={120} className="animate-float-up" />
        </div>
        <div className="absolute left-12 opacity-12">
          <Image src="/hot-baloon2.png" alt="Hot Air Balloon" width={100} height={100} className="animate-float-up-slow" style={{ animationDelay: '4s' }} />
        </div>
        <div className="absolute left-20 opacity-14">
          <Image src="/hot-baloon3.png" alt="Hot Air Balloon" width={90} height={90} className="animate-float-up-medium" style={{ animationDelay: '8s' }} />
        </div>
        <div className="absolute left-8 opacity-13">
          <Image src="/hot-baloon.png" alt="Hot Air Balloon" width={80} height={80} className="animate-float-up-fast" style={{ animationDelay: '12s' }} />
        </div>
        <div className="absolute left-16 opacity-11">
          <Image src="/hot-baloon2.png" alt="Hot Air Balloon" width={110} height={110} className="animate-float-up" style={{ animationDelay: '16s' }} />
        </div>
        
        {/* Center balloons */}
        <div className="absolute left-1/4 opacity-12">
          <Image src="/hot-baloon3.png" alt="Hot Air Balloon" width={95} height={95} className="animate-float-up-medium" style={{ animationDelay: '2s' }} />
        </div>
        <div className="absolute left-1/3 opacity-15">
          <Image src="/hot-baloon.png" alt="Hot Air Balloon" width={105} height={105} className="animate-float-up-slow" style={{ animationDelay: '6s' }} />
        </div>
        <div className="absolute left-2/5 opacity-13">
          <Image src="/hot-baloon2.png" alt="Hot Air Balloon" width={85} height={85} className="animate-float-up-fast" style={{ animationDelay: '10s' }} />
        </div>
        <div className="absolute left-1/2 opacity-14">
          <Image src="/hot-baloon3.png" alt="Hot Air Balloon" width={75} height={75} className="animate-float-up" style={{ animationDelay: '14s' }} />
        </div>
        
        {/* Right side balloons */}
        <div className="absolute right-5 opacity-13">
          <Image src="/hot-baloon.png" alt="Hot Air Balloon" width={115} height={115} className="animate-float-up-medium" style={{ animationDelay: '3s' }} />
        </div>
        <div className="absolute right-12 opacity-15">
          <Image src="/hot-baloon2.png" alt="Hot Air Balloon" width={90} height={90} className="animate-float-up" style={{ animationDelay: '7s' }} />
        </div>
        <div className="absolute right-20 opacity-12">
          <Image src="/hot-baloon3.png" alt="Hot Air Balloon" width={100} height={100} className="animate-float-up-slow" style={{ animationDelay: '11s' }} />
        </div>
        <div className="absolute right-8 opacity-14">
          <Image src="/hot-baloon.png" alt="Hot Air Balloon" width={80} height={80} className="animate-float-up-fast" style={{ animationDelay: '15s' }} />
        </div>
        <div className="absolute right-16 opacity-11">
          <Image src="/hot-baloon2.png" alt="Hot Air Balloon" width={95} height={95} className="animate-float-up-medium" style={{ animationDelay: '19s' }} />
        </div>
        <div className="absolute right-1/4 opacity-13">
          <Image src="/hot-baloon3.png" alt="Hot Air Balloon" width={110} height={110} className="animate-float-up" style={{ animationDelay: '1s' }} />
        </div>
        <div className="absolute right-1/3 opacity-12">
          <Image src="/hot-baloon.png" alt="Hot Air Balloon" width={85} height={85} className="animate-float-up-slow" style={{ animationDelay: '5s' }} />
        </div>
        <div className="absolute right-2/5 opacity-15">
          <Image src="/hot-baloon2.png" alt="Hot Air Balloon" width={70} height={70} className="animate-float-up-fast" style={{ animationDelay: '9s' }} />
        </div>
        
        {/* Additional scattered balloons */}
        <div className="absolute left-24 opacity-10">
          <Image src="/hot-baloon3.png" alt="Hot Air Balloon" width={60} height={60} className="animate-float-up-medium" style={{ animationDelay: '13s' }} />
        </div>
        <div className="absolute right-24 opacity-14">
          <Image src="/hot-baloon.png" alt="Hot Air Balloon" width={125} height={125} className="animate-float-up" style={{ animationDelay: '17s' }} />
        </div>
        
        {/* Static Carousel Images for decoration */}
        <div className="absolute top-1/3 left-5 opacity-8">
          <Image src="/carousel.png" alt="Carousel 1" width={80} height={80} className="animate-float rounded-full" style={{ animationDelay: '0.5s' }} />
        </div>
        <div className="absolute bottom-1/4 right-8 opacity-10">
          <Image src="/carousel2.png" alt="Carousel 2" width={70} height={70} className="animate-float rounded-full" style={{ animationDelay: '1.5s' }} />
        </div>
        <div className="absolute top-1/2 right-1/4 opacity-8">
          <Image src="/carousel3.png" alt="Carousel 3" width={85} height={85} className="animate-float rounded-full" style={{ animationDelay: '2.5s' }} />
        </div>
        <div className="absolute top-20 right-1/3 opacity-10">
          <Image src="/carousel.png" alt="Carousel 4" width={50} height={50} className="animate-float rounded-full" style={{ animationDelay: '4s' }} />
        </div>
      </div>
      
      {/* Floating Background Elements */}
      <FloatingBalloons />
      
      {/* Hero Section */}
      <div className="pt-8 pb-16 relative z-10">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12 relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-5">
              <div className="text-9xl">🎂</div>
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl text-pink-600 mb-2 drop-shadow-lg">
                Hello {guestData.name}! 👋
              </h2>
              <p className="text-xl text-pink-500 mb-6 font-medium drop-shadow-lg" 
                 style={{ fontFamily: 'Sour Gummy, cursive' }}>
                You are specially invited to
              </p>
              <h1 className="text-6xl md:text-8xl font-bold text-pink-400 mb-4 h-28 drop-shadow-lg" 
                  style={{ 
                    fontFamily: 'Sour Gummy, cursive',
                    textShadow: '3px 3px 6px rgba(214, 184, 186, 0.5)',
                    background: 'linear-gradient(45deg, #f472b6, #ec4899, #db2777)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                Hailey's
              </h1>
              <div className="flex items-center justify-center">
                <Image src="/carousel2.png" alt="Carousel" width={300} height={300} />
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl text-pink-600 mb-4 font-semibold drop-shadow-lg">
              <span className="text-pink-500 font-bold text-5xl">1st</span> Birthday Celebration
            </h2>
            
            <p className="text-xl text-pink-500 mb-8 drop-shadow-lg">
              Join us for a magical celebration 🎈✨
            </p>
            
            {/* Countdown Timer */}
            <div className="relative max-w-lg mx-auto">
              {/* Glowing background */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400/30 via-purple-400/30 to-pink-400/30 rounded-3xl blur-xl animate-pulse"></div>
              
              <div className="relative bg-white/50 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-pink-200/60 overflow-hidden">
                {/* Animated border */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 via-purple-500 to-pink-400 animate-pulse"></div>
                
                <div className="text-center">
                  <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-6" 
                      style={{ fontFamily: 'var(--font-playwrite-au-nsw), Playwrite AU NSW, cursive' }}>
                    🎊 Countdown to Magic 🎊
                  </h3>
                  
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-300/50 to-pink-400/50 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-pink-200 group-hover:scale-105 transition-transform duration-300">
                        <div className="text-2xl font-bold text-pink-600 animate-pulse">{countdown.days}</div>
                        <div className="text-xs font-medium text-pink-500 uppercase tracking-wide">Hari</div>
                      </div>
                    </div>
                    
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-300/50 to-purple-400/50 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-purple-200 group-hover:scale-105 transition-transform duration-300">
                        <div className="text-2xl font-bold text-purple-600 animate-pulse" style={{ animationDelay: '0.5s' }}>{countdown.hours}</div>
                        <div className="text-xs font-medium text-purple-500 uppercase tracking-wide">Jam</div>
                      </div>
                    </div>
                    
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-300/50 to-blue-400/50 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-blue-200 group-hover:scale-105 transition-transform duration-300">
                        <div className="text-2xl font-bold text-blue-600 animate-pulse" style={{ animationDelay: '1s' }}>{countdown.minutes}</div>
                        <div className="text-xs font-medium text-blue-500 uppercase tracking-wide">Menit</div>
                      </div>
                    </div>
                    
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-300/50 to-green-400/50 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-green-200 group-hover:scale-105 transition-transform duration-300">
                        <div className="text-2xl font-bold text-green-600 animate-pulse" style={{ animationDelay: '1.5s' }}>{countdown.seconds}</div>
                        <div className="text-xs font-medium text-green-500 uppercase tracking-wide">Detik</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce"></div>
                    <p className="text-sm font-medium text-pink-600">Until Hailey's Special Day</p>
                    <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="max-w-6xl mx-auto mb-20 relative">
            {/* Decorative background elements */}
            <div className="absolute -top-8 -left-8 w-32 bg-pink-200/20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-purple-200/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            
            <div className="text-center mb-16 relative">
              <div className="inline-block relative">
                <h3 className="text-3xl md:text-6xl pt-10 font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 mb-4 drop-shadow-lg" 
                    style={{ 
                      fontFamily: 'var(--font-playwrite-au-nsw), Playwrite AU NSW, cursive',
                      textShadow: '0 0 30px rgba(236, 72, 153, 0.3)'
                    }}>
                  Join the Celebration
                </h3>
                <div className="flex justify-center items-center gap-4 mb-6">
                  <div className="w-12 h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent rounded-full"></div>
                  <span className="text-4xl animate-spin" style={{ animationDuration: '3s' }}>🎉</span>
                  <div className="w-12 h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent rounded-full"></div>
                </div>
              </div>
              <p className="text-xl text-pink-600 font-medium max-w-2xl mx-auto leading-relaxed">
                Mark your calendars for a magical day filled with joy, laughter, and unforgettable memories! ✨
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">
              {/* Date Card - Clickable to add to calendar */}
              <div className="group relative cursor-pointer" onClick={addToCalendar}>
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                <div className="relative bg-white/40 backdrop-blur-md rounded-3xl p-8 border border-pink-200/50 hover:border-pink-300/70 transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl">
                  <div className="flex items-start gap-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-pink-400/30 rounded-2xl blur-lg animate-pulse"></div>
                      <div className="relative text-7xl group-hover:scale-110 transition-transform duration-500 filter drop-shadow-lg">📅</div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-pink-800 text-2xl mb-3 drop-shadow-sm" style={{ fontFamily: 'var(--font-playwrite-au-nsw), Playwrite AU NSW, cursive' }}>
                        Special Date
                      </h4>
                      <div className="space-y-2">
                        <p className="text-pink-700 font-bold text-xl">8 Agustus 2025</p>
                        <p className="text-pink-600 text-lg font-medium">Friday</p>
                        <p className="text-pink-500 text-sm font-medium mt-3">Click to add to calendar</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Card - Clickable to add to calendar */}
              <div className="group relative cursor-pointer" onClick={addToCalendar}>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                <div className="relative bg-white/40 backdrop-blur-md rounded-3xl p-8 border border-purple-200/50 hover:border-purple-300/70 transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl">
                  <div className="flex items-start gap-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-purple-400/30 rounded-2xl blur-lg animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                      <div className="relative text-7xl group-hover:scale-110 transition-transform duration-500 filter drop-shadow-lg">🕕</div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-purple-800 text-2xl mb-3 drop-shadow-sm" style={{ fontFamily: 'var(--font-playwrite-au-nsw), Playwrite AU NSW, cursive' }}>
                        Time
                      </h4>
                      <div className="space-y-2">
                        <p className="text-purple-700 font-bold text-xl">18:00 WIB</p>
                        <p className="text-purple-600 text-lg font-medium">6:00 PM</p>
                        <p className="text-purple-500 text-sm font-medium mt-3">Click to add to calendar</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Card - Clickable to open Google Maps */}
              <div className="group relative cursor-pointer" onClick={openGoogleMaps}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-pink-400/20 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                <div className="relative bg-white/40 backdrop-blur-md rounded-3xl p-8 border border-blue-200/50 hover:border-blue-300/70 transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl">
                  <div className="flex items-start gap-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-400/30 rounded-2xl blur-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
                      <div className="relative text-7xl group-hover:scale-110 transition-transform duration-500 filter drop-shadow-lg">📍</div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-blue-800 text-xl mb-3 drop-shadow-sm" style={{ fontFamily: 'var(--font-playwrite-au-nsw), Playwrite AU NSW, cursive' }}>
                        Location
                      </h4>
                      <div className="space-y-2">
                        <p className="text-blue-700 font-bold text-lg">Lupper</p>
                        <p className="text-blue-600 text-sm leading-relaxed">
                        Jl. Indraprasta No.8<br />
                        Pendrikan Kidul, Kec. Semarang Tengah<br />
                        Kota Semarang, Jawa Tengah 50131
                        </p>
                        <p className="text-blue-500 text-sm font-medium mt-3">Click to open in Google Maps</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dress Code Card - Clickable to trigger confetti */}
              <div className="group relative cursor-pointer" onClick={triggerConfetti}>
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-pink-400/20 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                <div className="relative bg-white/40 backdrop-blur-md rounded-3xl p-8 border border-green-200/50 hover:border-green-300/70 transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl">
                  <div className="flex items-start gap-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-green-400/30 rounded-2xl blur-lg animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                      <div className="relative text-7xl group-hover:scale-110 transition-transform duration-500 filter drop-shadow-lg">👗</div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-green-800 text-2xl mb-3 drop-shadow-sm" style={{ fontFamily: 'var(--font-playwrite-au-nsw), Playwrite AU NSW, cursive' }}>
                        Dress Code
                      </h4>
                      <div className="space-y-3">
                        <p className="text-green-700 font-bold text-xl">Free Pastel Colors</p>
                        <p className="text-red-500 text-sm font-medium mb-4">❌ No Blue or Pink pastels allowed</p>
                        <div className="flex gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-300 to-blue-400 shadow-lg border-2 border-white opacity-50"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-red-500 font-bold text-lg">❌</div>
                          </div>
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-300 to-pink-400 shadow-lg border-2 border-white opacity-50"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-red-500 font-bold text-lg">❌</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hailey's Wishes Section */}
          <div className="max-w-4xl mx-auto mt-16 mb-16">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 relative overflow-hidden border border-pink-200">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-300 via-pink-400 to-pink-500"></div>
              
              <h3 className="text-2xl font-bold text-pink-600 text-center mb-8 drop-shadow-lg" 
                  style={{ fontFamily: 'var(--font-playwrite-au-nsw), Playwrite AU NSW, cursive' }}>
                Hailey's Wishes 💕
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {submittedWishes.map((wish) => (
                  <div key={wish.id} className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-pink-300">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">
                        {wish.attending === 'yes' ? '🎉' : '💕'}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-pink-700 mb-2">
                          {wish.name}
                          <span className="text-sm text-pink-500 ml-2">
                            ({wish.attending === 'yes' ? 'Will attend' : 'Cannot attend'})
                          </span>
                        </h4>
                        <p className="text-pink-600 italic">"{wish.message}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RSVP Section */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border-t-4 border-pink-400">
              <h3 className="text-3xl font-bold text-pink-600 text-center mb-8" 
                  style={{ fontFamily: 'var(--font-playwrite-au-nsw), Playwrite AU NSW, cursive' }}>
                RSVP 💌
              </h3>

              {!rsvpSubmitted ? (
                <form onSubmit={handleRSVPSubmit} className="space-y-6">
                  <div>
                    <label className="block text-pink-700 font-semibold mb-3">
                      Apakah anda bisa hadir? *
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
                        <span className="text-pink-600 font-medium">Iya, saya akan hadir! 🎉</span>
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
                        <span className="text-pink-600 font-medium">Tidak, saya tidak bisa hadir 😢</span>
                      </label>
                    </div>
                  </div>

                  {rsvpData.attending === 'yes' && (
                    <div className="bg-pink-50 p-4 rounded-xl">
                      <h4 className="text-pink-700 font-semibold mb-3">Jumlah Tamu</h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          {[1, 2, 3].map(num => (
                            <label key={num} className="flex items-center p-2 bg-white rounded-lg cursor-pointer hover:bg-pink-100 transition-colors">
                              <input
                                type="radio"
                                name="guestCount"
                                value={num}
                                checked={rsvpData.guestCount === num}
                                onChange={handleInputChange}
                                className="text-pink-500 mr-2"
                              />
                              <span className="text-pink-600">{num} orang</span>
                            </label>
                          ))}
                        </div>
                        <div>
                          <label className="flex items-center p-2 bg-white rounded-lg cursor-pointer hover:bg-pink-100 transition-colors">
                            <input
                              type="radio"
                              name="guestCount"
                              value="custom"
                              checked={rsvpData.guestCount === 'custom'}
                              onChange={handleInputChange}
                              className="text-pink-500 mr-2"
                            />
                            <span className="text-pink-600 mr-2">Isi sendiri:</span>
                            <input
                              type="number"
                              name="customCount"
                              value={rsvpData.customCount}
                              onChange={handleInputChange}
                              min="1"
                              max="10"
                              className="w-16 p-1 border border-pink-200 rounded text-center focus:border-pink-400 focus:outline-none"
                              placeholder="0"
                              disabled={rsvpData.guestCount !== 'custom'}
                            />
                            <span className="text-pink-600 ml-1">orang</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-pink-700 font-semibold mb-2">
                      Birthday Wishes untuk Hailey 💕
                    </label>
                    <textarea
                      name="message"
                      value={rsvpData.message}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full p-4 border-2 border-pink-200 rounded-xl focus:border-pink-400 focus:outline-none resize-none"
                      placeholder="Tuliskan ucapan selamat ulang tahun untuk Hailey..."
                      required
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
                  <h3 className="text-2xl font-bold text-pink-600 mb-4" style={{ fontFamily: 'var(--font-playwrite-au-nsw), Playwrite AU NSW, cursive' }}>
                    Thank You!
                  </h3>
                  <p className="text-pink-500 mb-6 leading-relaxed">
                    RSVP Anda telah diterima. Kami sangat menantikan untuk merayakan hari istimewa Hailey bersama Anda!
                  </p>
                  <div className="bg-pink-100 p-4 rounded-xl mb-6">
                    <p className="text-pink-600 text-sm">
                      💌 Anda akan menerima detail lebih lanjut menjelang hari perayaan.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setRsvpSubmitted(false);
                      setRsvpData({
                        attending: '',
                        guestCount: 1,
                        customCount: '',
                        message: ''
                      });
                    }}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full transition-colors duration-300 font-medium"
                  >
                    Update RSVP
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Elements */}
      <ConfettiButton />
      
      {/* Confetti Effect for Dress Code */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-30">
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 opacity-80"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#f472b6', '#ec4899', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa'][i % 6],
                animation: `confetti-fall ${2 + Math.random() * 3}s linear`,
                animationDelay: `${Math.random() * 1}s`,
                borderRadius: '50%'
              }}
            />
          ))}
          
          <style jsx>{`
            @keyframes confetti-fall {
              0% {
                transform: translateY(-100vh) rotate(0deg);
                opacity: 1;
              }
              100% {
                transform: translateY(100vh) rotate(720deg);
                opacity: 0;
              }
            }
          `}</style>
        </div>
      )}
      
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
