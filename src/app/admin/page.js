'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { IoMail, IoMailOpen, IoTrash, IoLogoWhatsapp, IoRefresh, IoReload, IoCopy, IoPencil, IoSave, IoClose } from 'react-icons/io5';

export default function AdminPanel() {
  const [guests, setGuests] = useState([]);
  const [rsvpResponses, setRsvpResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: '', phone: '' });
  const [editingGuest, setEditingGuest] = useState(null);
  const [editData, setEditData] = useState({ name: '', phone: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [stats, setStats] = useState({
    totalGuests: 0,
    totalInvited: 0,
    totalResponded: 0,
    totalAttending: 0,
    totalPeople: 0
  });

  useEffect(() => {
    // Check if user is already authenticated
    const savedPassword = localStorage.getItem('adminPassword');
    if (savedPassword === 'szukngin') {
      setIsAuthenticated(true);
      fetchData();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    calculateStats();
  }, [guests, rsvpResponses]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'szukngin') {
      localStorage.setItem('adminPassword', password);
      setIsAuthenticated(true);
      setLoginError('');
      fetchData();
    } else {
      setLoginError('Invalid password. Please try again.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminPassword');
    setIsAuthenticated(false);
    setPassword('');
    setGuests([]);
    setRsvpResponses([]);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [guestsRes, rsvpRes] = await Promise.all([
        fetch('/api/guests'),
        fetch('/api/rsvp')
      ]);
      
      const guestsData = await guestsRes.json();
      const rsvpData = await rsvpRes.json();
      
      setGuests(guestsData.guests || []);
      setRsvpResponses(rsvpData.rsvpResponses || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalGuests = guests.length;
    const totalInvited = guests.filter(g => g.invitationStatus === 'sent').length;
    
    // Count responded guests by checking both guest document RSVP status and RSVP collection
    const guestsWithRsvp = guests.filter(g => g.rsvpStatus && g.rsvpStatus !== 'pending');
    const rsvpGuestNames = rsvpResponses.map(r => r.guestName);
    const additionalRsvpResponses = rsvpResponses.filter(r => 
      !guests.find(g => g.name === r.guestName)
    );
    const totalResponded = guestsWithRsvp.length + additionalRsvpResponses.length;
    
    // Count attending guests
    const attendingFromGuests = guests.filter(g => g.rsvpStatus === 'yes');
    const attendingFromRsvp = rsvpResponses.filter(r => 
      r.attending === 'yes' && !guests.find(g => g.name === r.guestName)
    );
    const totalAttending = attendingFromGuests.length + attendingFromRsvp.length;
    
    // Calculate total people (including additional guests)
    const peopleFromGuests = attendingFromGuests.reduce((sum, g) => {
      const additionalGuests = g.additionalGuests ? parseInt(g.additionalGuests) : 0;
      return sum + 1 + additionalGuests; // 1 for main guest + additional guests
    }, 0);
    const peopleFromRsvp = attendingFromRsvp.reduce((sum, r) => sum + (r.guestCount || 1), 0);
    const totalPeople = peopleFromGuests + peopleFromRsvp;

    setStats({
      totalGuests,
      totalInvited,
      totalResponded,
      totalAttending,
      totalPeople
    });
  };

  const addGuest = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGuest),
      });

      if (response.ok) {
        const result = await response.json();
        setGuests([...guests, result.guest]);
        setNewGuest({ name: '', phone: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding guest:', error);
    }
  };

  const deleteGuest = async (guestId, guestName) => {
    // Show confirmation dialog
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${guestName}?\n\nThis action cannot be undone and will permanently remove all guest data including RSVP responses.`
    );
    
    if (!confirmDelete) {
      return; // User cancelled
    }

    try {
      const response = await fetch(`/api/guests?id=${guestId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setGuests(guests.filter(g => g.id !== guestId));
        alert(`${guestName} has been successfully deleted.`);
      } else {
        alert('Failed to delete guest. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting guest:', error);
      alert('Error deleting guest. Please check your connection and try again.');
    }
  };

  const startEditGuest = (guest) => {
    setEditingGuest(guest.id);
    setEditData({ name: guest.name, phone: guest.phone });
  };

  const cancelEdit = () => {
    setEditingGuest(null);
    setEditData({ name: '', phone: '' });
  };

  const saveEdit = async (guestId) => {
    try {
      const response = await fetch(`/api/guests?id=${guestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editData.name,
          phone: editData.phone
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setGuests(guests.map(g => g.id === guestId ? { ...g, name: editData.name, phone: editData.phone } : g));
        setEditingGuest(null);
        setEditData({ name: '', phone: '' });
        alert('Guest information updated successfully!');
      } else {
        alert('Failed to update guest. Please try again.');
      }
    } catch (error) {
      console.error('Error updating guest:', error);
      alert('Error updating guest. Please check your connection and try again.');
    }
  };

  const updateInvitationStatus = async (guestId, status) => {
    try {
      const response = await fetch('/api/guests/invitation', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guestId,
          invitationStatus: status
        }),
      });

      if (response.ok) {
        // Update local state
        setGuests(guests.map(guest => 
          guest.id === guestId 
            ? { 
                ...guest, 
                invitationStatus: status,
                invitationSentAt: status === 'sent' ? new Date().toISOString() : null
              }
            : guest
        ));
      }
    } catch (error) {
      console.error('Error updating invitation status:', error);
    }
  };

  const resetInvitation = async (guestId) => {
    await updateInvitationStatus(guestId, 'not_sent');
  };

  const copyInvitationLink = (guest) => {
    const personalUrl = `${window.location.origin}/guest/${guest.id}`;
    navigator.clipboard.writeText(personalUrl).then(() => {
      alert(`Invitation link copied for ${guest.name}!`);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const formatPhoneForWhatsApp = (phone) => {
    // Remove all non-numeric characters
    let cleanPhone = phone.replace(/\D/g, '');
    
    // If starts with 0, replace with 62
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.substring(1);
    }
    
    // If doesn't start with 62, add 62
    if (!cleanPhone.startsWith('62')) {
      cleanPhone = '62' + cleanPhone;
    }
    
    return cleanPhone;
  };

  const sendWhatsApp = (guest) => {
    const formattedPhone = formatPhoneForWhatsApp(guest.phone);
    const personalUrl = `${window.location.origin}/guest/${guest.id}`;
    const message = encodeURIComponent(`Halo ${guest.name}! 👋\n\nKami mengundang Anda ke acara ulang tahun pertama Hailey! 🎂✨\n\n📅 Tanggal: 8 Agustus 2025\n🕕 Waktu: 18:00 - 22:00\n📍 Lokasi: Aroem Restaurant & Ballroom\n\nSilakan konfirmasi kehadiran Anda melalui link personal berikut:\n${personalUrl}\n\nTerima kasih! 💕`);
    
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
    
    // Mark invitation as sent
    updateInvitationStatus(guest.id, 'sent');
  };

  const sendFollowUp = (guest) => {
    const formattedPhone = formatPhoneForWhatsApp(guest.phone);
    const personalUrl = `${window.location.origin}/guest/${guest.id}`;
    const message = encodeURIComponent(`Halo ${guest.name}! 👋\n\nIni reminder untuk acara ulang tahun pertama Hailey! 🎂\n\n📅 Tanggal: 8 Agustus 2025\n🕕 Waktu: 18:00 - 22:00\n📍 Lokasi: Aroem Restaurant & Ballroom\n\nJangan lupa untuk konfirmasi kehadiran ya!\n${personalUrl}\n\nDitunggu kehadirannya! 💕`);
    
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  const getGuestRsvpStatus = (guest) => {
    // First check if the guest document has RSVP status
    if (guest.rsvpStatus && guest.rsvpStatus !== 'pending') {
      const totalGuests = guest.additionalGuests ? parseInt(guest.additionalGuests) + 1 : 1;
      return {
        status: 'filled',
        attending: guest.rsvpStatus,
        guestCount: totalGuests,
        message: guest.message || ''
      };
    }
    
    // Fallback to checking RSVP collection for legacy data
    const rsvp = rsvpResponses.find(r => r.guestName === guest.name);
    if (rsvp) {
      return {
        status: 'filled',
        attending: rsvp.attending,
        guestCount: rsvp.guestCount,
        message: rsvp.message
      };
    }
    
    return { status: 'pending' };
  };

  // Login form for non-authenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-pink-200/60">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔐</span>
            </div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-2">
              Admin Access
            </h1>
            <p className="text-pink-600">Enter password to access Hailey's Birthday Admin Panel</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-pink-700 font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border-2 border-pink-200 rounded-xl focus:border-pink-400 focus:outline-none"
                placeholder="Enter admin password"
                required
              />
              {loginError && (
                <p className="text-red-500 text-sm mt-2">{loginError}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Access Admin Panel 🎈
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-pink-500 text-sm">
              🎂 Hailey's 1st Birthday Administration
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-pink-600 font-medium">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-pink-200/60">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-600 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">👑</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                  Admin Panel - Hailey's Birthday
                </h1>
                <p className="text-pink-600">Manage guests and RSVP responses</p>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                + Add Guest
              </button>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                title="Logout"
              >
                🔓 Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-pink-200/60">
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600">{stats.totalGuests}</div>
              <div className="text-sm text-pink-500 font-medium">Total Guests</div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-blue-200/60">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.totalInvited}</div>
              <div className="text-sm text-blue-500 font-medium">Invited</div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-purple-200/60">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.totalResponded}</div>
              <div className="text-sm text-purple-500 font-medium">Responded</div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-green-200/60">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.totalAttending}</div>
              <div className="text-sm text-green-500 font-medium">Attending</div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-orange-200/60">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{stats.totalPeople}</div>
              <div className="text-sm text-orange-500 font-medium">Total People</div>
            </div>
          </div>
        </div>
      </div>

      {/* Guests Table */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-pink-200/60">
          <h2 className="text-2xl font-bold text-pink-600 mb-6">
            Guest Management
          </h2>
          
          {/* Mobile-friendly card layout */}
          <div className="space-y-4">
            {guests.map((guest) => {
              const rsvpStatus = getGuestRsvpStatus(guest);
              const invitationSent = guest.invitationStatus === 'sent';
              return (
                <div key={guest.id} className="bg-white/60 rounded-2xl p-4 border border-pink-100 hover:shadow-lg transition-all duration-300">
                  {/* Mobile Layout */}
                  <div className="block sm:hidden">
                    {/* Guest Info */}
                    <div className="mb-3">
                      {editingGuest === guest.id ? (
                        // Edit Mode
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            className="w-full p-2 border border-pink-300 rounded-lg font-bold text-gray-800 focus:border-pink-500 focus:outline-none"
                            placeholder="Guest Name"
                          />
                          <input
                            type="text"
                            value={editData.phone}
                            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                            className="w-full p-2 border border-pink-300 rounded-lg text-gray-600 focus:border-pink-500 focus:outline-none"
                            placeholder="Phone Number"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEdit(guest.id)}
                              className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center gap-1"
                            >
                              <IoSave size={14} />
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="bg-gray-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-gray-600 transition-colors flex items-center gap-1"
                            >
                              <IoClose size={14} />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-800">{guest.name}</h3>
                            <button
                              onClick={() => startEditGuest(guest)}
                              className="bg-blue-500 text-white px-2 py-1 rounded-lg text-xs hover:bg-blue-600 transition-colors flex items-center gap-1"
                              title="Edit Guest"
                            >
                              <IoPencil size={12} />
                              Edit
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {/* Invitation Status */}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              invitationSent 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {invitationSent ? '📧 Sent' : '📨 Not Sent'}
                            </span>
                            {/* RSVP Status */}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              rsvpStatus.status === 'filled' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {rsvpStatus.status === 'filled' ? '✅ RSVP Done' : '⏳ RSVP Pending'}
                            </span>
                            {/* Attending Status */}
                        {rsvpStatus.status === 'filled' && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            rsvpStatus.attending === 'yes' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {rsvpStatus.attending === 'yes' ? `👥 ${rsvpStatus.guestCount} people` : '❌ Not attending'}
                          </span>
                        )}
                          </div>
                          <div className="text-sm text-gray-600">{guest.phone}</div>
                          {invitationSent && guest.invitationSentAt && (
                            <div className="text-xs text-gray-500 mt-1">
                              Invited: {new Date(guest.invitationSentAt).toLocaleDateString('id-ID')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons - Grid layout on mobile */}
                    <div className="grid grid-cols-2 gap-2">
                      {!invitationSent ? (
                        // Send Initial Invitation
                        <button
                          onClick={() => sendWhatsApp(guest)}
                          className="bg-blue-500 text-white px-3 py-2 rounded-xl text-sm hover:bg-blue-600 transition-colors shadow-lg flex items-center justify-center gap-2 col-span-2"
                          title="Send Invitation"
                        >
                          <IoMail size={16} />
                          <span>Send Invite</span>
                        </button>
                      ) : (
                        // Follow Up Button
                        <button
                          onClick={() => sendFollowUp(guest)}
                          className="bg-orange-500 text-white px-3 py-2 rounded-xl text-sm hover:bg-orange-600 transition-colors shadow-lg flex items-center justify-center gap-2 col-span-2"
                          title="Follow Up"
                        >
                          <IoRefresh size={16} />
                          <span>Follow Up</span>
                        </button>
                      )}
                      
                      {/* WhatsApp Button */}
                      <button
                        onClick={() => {
                          const formattedPhone = formatPhoneForWhatsApp(guest.phone);
                          window.open(`https://wa.me/${formattedPhone}`, '_blank');
                        }}
                        className="bg-green-500 text-white px-3 py-2 rounded-xl text-sm hover:bg-green-600 transition-colors shadow-lg flex items-center justify-center gap-2"
                        title="Open WhatsApp"
                      >
                        <IoLogoWhatsapp size={16} />
                        <span>WhatsApp</span>
                      </button>
                      
                      {/* Copy Link Button */}
                      <button
                        onClick={() => copyInvitationLink(guest)}
                        className="bg-purple-500 text-white px-3 py-2 rounded-xl text-sm hover:bg-purple-600 transition-colors shadow-lg flex items-center justify-center gap-2"
                        title="Copy Invitation Link"
                      >
                        <IoCopy size={16} />
                        <span>Copy Link</span>
                      </button>
                      
                      {/* Reset Button */}
                      <button
                        onClick={() => resetInvitation(guest.id)}
                        className="bg-yellow-500 text-white px-3 py-2 rounded-xl text-sm hover:bg-yellow-600 transition-colors shadow-lg flex items-center justify-center gap-2"
                        title="Reset Invitation"
                      >
                        <IoReload size={16} />
                        <span>Reset</span>
                      </button>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => deleteGuest(guest.id, guest.name)}
                        className="bg-red-500 text-white px-3 py-2 rounded-xl text-sm hover:bg-red-600 transition-colors shadow-lg flex items-center justify-center gap-2"
                        title="Delete Guest"
                      >
                        <IoTrash size={16} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:flex items-center justify-between gap-4">
                    {/* Guest Info */}
                    <div className="flex-1 min-w-0">
                      {editingGuest === guest.id ? (
                        // Edit Mode
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editData.name}
                              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                              className="flex-1 p-2 border border-pink-300 rounded-lg font-bold text-gray-800 focus:border-pink-500 focus:outline-none"
                              placeholder="Guest Name"
                            />
                            <input
                              type="text"
                              value={editData.phone}
                              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                              className="flex-1 p-2 border border-pink-300 rounded-lg text-gray-600 focus:border-pink-500 focus:outline-none"
                              placeholder="Phone Number"
                            />
                            <button
                              onClick={() => saveEdit(guest.id)}
                              className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
                            >
                              <IoSave size={16} />
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-1"
                            >
                              <IoClose size={16} />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-gray-800 truncate">{guest.name}</h3>
                              <button
                                onClick={() => startEditGuest(guest)}
                                className="bg-blue-500 text-white px-2 py-1 rounded-lg text-xs hover:bg-blue-600 transition-colors flex items-center gap-1"
                                title="Edit Guest"
                              >
                                <IoPencil size={12} />
                                Edit
                              </button>
                            </div>
                        <div className="flex flex-wrap gap-2">
                          {/* Invitation Status */}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            invitationSent 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {invitationSent ? '📧 Sent' : '📨 Not Sent'}
                          </span>
                          {/* RSVP Status */}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            rsvpStatus.status === 'filled' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {rsvpStatus.status === 'filled' ? '✅ RSVP Done' : '⏳ RSVP Pending'}
                          </span>
                          {/* Attending Status */}
                          {rsvpStatus.status === 'filled' && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              rsvpStatus.attending === 'yes' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {rsvpStatus.attending === 'yes' ? `👥 ${rsvpStatus.guestCount} people` : '❌ Not attending'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">{guest.phone}</div>
                      {invitationSent && guest.invitationSentAt && (
                        <div className="text-xs text-gray-500 mt-1">
                          Invited: {new Date(guest.invitationSentAt).toLocaleDateString('id-ID')}
                        </div>
                      )}
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons - Horizontal on desktop */}
                    <div className="flex gap-2 flex-shrink-0">
                      {!invitationSent ? (
                        // Send Initial Invitation
                        <button
                          onClick={() => sendWhatsApp(guest)}
                          className="bg-blue-500 text-white px-3 py-2 rounded-xl text-sm hover:bg-blue-600 transition-colors shadow-lg min-w-[50px] flex items-center justify-center"
                          title="Send Invitation"
                        >
                          <IoMail size={16} />
                        </button>
                      ) : (
                        // Follow Up Button
                        <button
                          onClick={() => sendFollowUp(guest)}
                          className="bg-orange-500 text-white px-3 py-2 rounded-xl text-sm hover:bg-orange-600 transition-colors shadow-lg min-w-[50px] flex items-center justify-center"
                          title="Follow Up"
                        >
                          <IoRefresh size={16} />
                        </button>
                      )}
                      
                      {/* WhatsApp Button - Always available */}
                      <button
                        onClick={() => {
                          const formattedPhone = formatPhoneForWhatsApp(guest.phone);
                          window.open(`https://wa.me/${formattedPhone}`, '_blank');
                        }}
                        className="bg-green-500 text-white px-3 py-2 rounded-xl text-sm hover:bg-green-600 transition-colors shadow-lg min-w-[50px] flex items-center justify-center"
                        title="Open WhatsApp"
                      >
                        <IoLogoWhatsapp size={16} />
                      </button>
                      
                      {/* Copy Link Button */}
                      <button
                        onClick={() => copyInvitationLink(guest)}
                        className="bg-purple-500 text-white px-3 py-2 rounded-xl text-sm hover:bg-purple-600 transition-colors shadow-lg min-w-[50px] flex items-center justify-center"
                        title="Copy Invitation Link"
                      >
                        <IoCopy size={16} />
                      </button>
                      
                      {/* Reset Button */}
                      <button
                        onClick={() => resetInvitation(guest.id)}
                        className="bg-yellow-500 text-white px-3 py-2 rounded-xl text-sm hover:bg-yellow-600 transition-colors shadow-lg min-w-[50px] flex items-center justify-center"
                        title="Reset Invitation"
                      >
                        <IoReload size={16} />
                      </button>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => deleteGuest(guest.id, guest.name)}
                        className="bg-red-500 text-white px-3 py-2 rounded-xl text-sm hover:bg-red-600 transition-colors shadow-lg min-w-[50px] flex items-center justify-center"
                        title="Delete Guest"
                      >
                        <IoTrash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {guests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No guests added yet. Click "Add Guest" to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Guest Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-pink-600 mb-6 text-center">
              Add New Guest
            </h3>
            
            <form onSubmit={addGuest} className="space-y-4">
              <div>
                <label className="block text-pink-600 font-medium mb-2">Guest Name</label>
                <input
                  type="text"
                  value={newGuest.name}
                  onChange={(e) => setNewGuest({...newGuest, name: e.target.value})}
                  className="w-full p-3 border border-pink-200 rounded-2xl focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                  placeholder="Enter guest name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-pink-600 font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={newGuest.phone}
                  onChange={(e) => setNewGuest({...newGuest, phone: e.target.value})}
                  className="w-full p-3 border border-pink-200 rounded-2xl focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                  placeholder="08123456789 or 6281234567890"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewGuest({ name: '', phone: '' });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-2xl font-medium hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-2xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  Add Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
