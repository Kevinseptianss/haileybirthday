import { db } from '../../../lib/firebase-admin';

export async function GET() {
  try {
    const guestsRef = db.collection('guests');
    const snapshot = await guestsRef.get();
    
    const guests = [];
    snapshot.forEach(doc => {
      guests.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return Response.json({ guests });
  } catch (error) {
    console.error('Error fetching guests:', error);
    return Response.json({ error: 'Failed to fetch guests' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone } = body;
    
    if (!name || !phone) {
      return Response.json({ error: 'Name and phone are required' }, { status: 400 });
    }
    
    const guestData = {
      name,
      phone,
      createdAt: new Date().toISOString(),
      rsvpStatus: 'pending', // pending, filled
      invitationStatus: 'not_sent', // not_sent, sent
      invitationSentAt: null,
      rsvpData: null
    };
    
    const docRef = await db.collection('guests').add(guestData);
    
    return Response.json({ 
      success: true, 
      id: docRef.id,
      guest: { id: docRef.id, ...guestData }
    });
  } catch (error) {
    console.error('Error adding guest:', error);
    return Response.json({ error: 'Failed to add guest' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get('id');
    
    if (!guestId) {
      return Response.json({ error: 'Guest ID is required' }, { status: 400 });
    }
    
    await db.collection('guests').doc(guestId).delete();
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting guest:', error);
    return Response.json({ error: 'Failed to delete guest' }, { status: 500 });
  }
}
