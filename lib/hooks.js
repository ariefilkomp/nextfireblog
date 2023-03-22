import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { getFirebase } from "./firebase";
import { useAuthState } from 'react-firebase-hooks/auth'


export function useUserData() {
    const { auth, firestore } = getFirebase();
    const [user] = useAuthState(auth);
    const [username, setUsername] = useState(null);
    const [roles, setRoles] = useState(null);

    useEffect(()=>{
        let unsubscribe;

        if(user) {
            unsubscribe = onSnapshot(
                doc(firestore, 'users', user.uid), (doc) => {
                setUsername(doc.data()?.username);
                setRoles(doc.data()?.roles);
            });
        } else {
            setUsername(null);
            setRoles(null);
        }

        return unsubscribe;
    },[user])

    return { user, username, roles };
}