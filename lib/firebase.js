import { initializeApp, getApps } from 'firebase/app';
import { collection, connectFirestoreEmulator, getDocs, getFirestore, limit, query, where } from 'firebase/firestore';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { firebaseConfig } from '../config';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

function initializeService() {
    const isConfigured = getApps().length > 0;
    const firebaseApp = initializeApp(firebaseConfig);
    const firestore = getFirestore(firebaseApp);
    const storage = getStorage(firebaseApp);
    const auth = getAuth(firebaseApp);
    return { firebaseApp, firestore, auth, storage, isConfigured };
}

function connectToEmulators({auth, firestore, storage}) {
    if('location' == 'localhost') {
        connectAuthEmulator(auth, 'http://localhost:9099');
        connectFirestoreEmulator(firestore, 'localhost', 8080);
        connectStorageEmulator(storage, 'localhost', 9199);
    }
}

export function getFirebase() {
    const services = initializeService();
    //connectToEmulators(services);
    return services;
}

export async function getUserWithUsername(username) {
    const { firestore } = getFirebase();
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('username', '==', username), limit(1));
    const userDoc = (await getDocs(q)).docs[0];
    return userDoc;
}

export function postToJSON(doc) {
    const data = doc.data();
    return {
        ...data,
        // firestore timestamp not serializable
        createdAt: data.createdAt.toMillis(),
        updatedAt: data.updatedAt.toMillis(),
    }

}