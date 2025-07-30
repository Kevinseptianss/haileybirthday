import { db } from '../../../../lib/firebase-admin';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const guestDoc = await db.collection('guests').doc(id).get();
    
    if (!guestDoc.exists) {
      return Response.json(
        { error: 'Guest not found' },
        { status: 404 }
      );
    }
    
    const guestData = {
      id: guestDoc.id,
      ...guestDoc.data()
    };
    
    return Response.json(guestData);
  } catch (error) {
    console.error('Error fetching guest:', error);
    return Response.json(
      { error: 'Failed to fetch guest' },
      { status: 500 }
    );
  }
}
