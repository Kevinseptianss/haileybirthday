import { db } from '../../../lib/firebase-admin';

export async function GET() {
  try {
    const rsvpRef = db.collection('rsvp');
    const snapshot = await rsvpRef.get();
    
    const rsvpResponses = [];
    snapshot.forEach(doc => {
      rsvpResponses.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return Response.json(rsvpResponses);
  } catch (error) {
    console.error('Error fetching RSVP responses:', error);
    return Response.json({ error: 'Failed to fetch RSVP responses' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { guestId, guestName, attending, additionalGuests, guestCount, message } = body;
    
    let finalGuestName = guestName;
    
    // If guestId is provided, fetch guest data from the guests collection
    if (guestId) {
      const guestDoc = await db.collection('guests').doc(guestId).get();
      if (guestDoc.exists) {
        const guestData = guestDoc.data();
        finalGuestName = guestData.name;
        
        // Calculate total guest count
        const totalGuests = attending === 'yes' ? (additionalGuests ? parseInt(additionalGuests) + 1 : 1) : 0;
        
        // Create complete RSVP data object
        const completeRsvpData = {
          attending,
          additionalGuests: additionalGuests || 0,
          guestCount: totalGuests,
          message: message || '',
          submittedAt: new Date().toISOString()
        };
        
        // Update the guest document with RSVP information
        await db.collection('guests').doc(guestId).update({
          rsvpStatus: attending,
          additionalGuests: additionalGuests || 0,
          message: message || '',
          rsvpSubmittedAt: new Date().toISOString(),
          rsvpData: completeRsvpData  // Store complete RSVP data object
        });
      } else {
        return Response.json({ error: 'Guest not found' }, { status: 404 });
      }
    }
    
    const rsvpData = {
      guestId: guestId || null,
      guestName: finalGuestName,
      attending,
      guestCount: attending === 'yes' ? (additionalGuests ? parseInt(additionalGuests) + 1 : (guestCount ? parseInt(guestCount) : 1)) : 0,
      additionalGuests: additionalGuests || 0,
      message: message || '',
      submittedAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('rsvp').add(rsvpData);
    
    // Legacy: Update guest status if guest exists by name (for backward compatibility)
    if (!guestId && finalGuestName) {
      const guestsRef = db.collection('guests');
      const guestQuery = await guestsRef.where('name', '==', finalGuestName).get();
      
      if (!guestQuery.empty) {
        const guestDoc = guestQuery.docs[0];
        
        // Calculate total guest count
        const totalGuests = attending === 'yes' ? (additionalGuests ? parseInt(additionalGuests) + 1 : 1) : 0;
        
        // Create complete RSVP data object
        const completeRsvpData = {
          attending,
          additionalGuests: additionalGuests || 0,
          guestCount: totalGuests,
          message: message || '',
          submittedAt: new Date().toISOString()
        };
        
        await guestDoc.ref.update({
          rsvpStatus: attending,
          additionalGuests: additionalGuests || 0,
          message: message || '',
          rsvpSubmittedAt: new Date().toISOString(),
          rsvpData: completeRsvpData  // Store complete RSVP data object
        });
      }
    }
    
    return Response.json({ 
      success: true, 
      id: docRef.id,
      rsvp: { id: docRef.id, ...rsvpData }
    });
  } catch (error) {
    console.error('Error saving RSVP:', error);
    return Response.json({ error: 'Failed to save RSVP' }, { status: 500 });
  }
}
