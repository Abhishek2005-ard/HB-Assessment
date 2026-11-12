import admin from 'firebase-admin';

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || 'mern-auth-demo';
  try {
    admin.initializeApp({
      projectId,
    });
  } catch (error) {
    console.warn('Firebase admin initialization warning:', error);
  }
}

export default admin;
