import { db } from '../../../../lib/firebase-admin';

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { guestId, invitationStatus } = body;
    
    if (!guestId || !invitationStatus) {
      return Response.json({ error: 'Guest ID and invitation status are required' }, { status: 400 });
    }
    
    const updateData = {
      invitationStatus,
      invitationSentAt: invitationStatus === 'sent' ? new Date().toISOString() : null
    };
    
    await db.collection('guests').doc(guestId).update(updateData);
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error updating invitation status:', error);
    return Response.json({ error: 'Failed to update invitation status' }, { status: 500 });
  }
}
