import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirebase } from "../lib/firebase";
import { useCallback, useContext, useEffect, useState } from "react";
import { UserContext } from "../lib/context";
import { doc, getDoc, setDoc, writeBatch } from "firebase/firestore";
import debounce from "lodash.debounce";
import toast from 'react-hot-toast';

const { auth, firestore } = getFirebase();

export default function Masuk(props) {
    const { user, username } = useContext(UserContext);
    // user signed out, <SignInButton/>
    // user signed in but missing username <UsernameForm />
    // user signed in <SignOutButton />
    return (
        <main className="pt-28 max-w-3xl mx-auto min-h-[660px] lg:min-h-[950px] px-4">
            {/* { !user ? !username ? <SignInButton /> : <SignOutButton /> : <UsernameForm/> } */}
            { user ? !username ? <UsernameForm /> : <SignOutButton /> : <SignInButton />}
        </main>
    )
}

function SignInButton() {
    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, new GoogleAuthProvider());
        } catch(error) {
            toast.error(error.toString());
        }
    };

    return (
        <button className="flex px-4 py-2 bg-slate-400 rounded-lg text-slate-100 align-middle hover:text-slate-700 hover:bg-slate-200 hover:shadow-md" onClick={signInWithGoogle}>
            <img src={'/google.png'} className="w-8 h-8 mr-4"/> SignIn With Google
        </button>
    );
}

function SignOutButton() {
    return <button onClick={()=>signOut(auth)} className="flex px-4 py-2 bg-slate-400 rounded-lg text-slate-100 hover:text-slate-700 hover:bg-slate-200 hover:shadow-md"> Sign Out</button>;
}

function UsernameForm() {
    const [formValue, setFormValue] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [loading, setLoading] = useState(false);

    const { user, username } = useContext(UserContext);

    useEffect(() => {
        checkUsername(formValue);
    },[ formValue ]);

    const onChange = (e) => {
        // force form value typed in form  to match correct format
        const val = e.target.value.toLowerCase();
        const re = /^(?=[a-zA-Z0-9._]{3,15})(?!.*[_.]{2})[^_.].*[^_.]$/;

        if(val.length < 3) {
            setFormValue(val);
            setLoading(false);
            setIsValid(false);
        }

        if(re.test(val)) {
            setFormValue(val);
            setLoading(true);
            setIsValid(false);
        }          
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        // create reff for both document
        // beginian lebih baik di wrap try catch
        const userDoc = doc(firestore, `users/${user.uid}`)
        const usernameDoc = doc(firestore, `username/${formValue}`)

        try {
            const batch = writeBatch(firestore);
            batch.set(userDoc, { username: formValue, photoURL: user.photoURL, displayName: user.displayName, roles: ['author']});
            batch.set(usernameDoc, { uid: user.uid });
    
            await batch.commit();

        } catch(error) {
            toast.error(error.toString());
        }
    }

    const checkUsername = useCallback( 
        debounce( async (username) => {
            if(username.length > 3) {
                const ref = doc(firestore, 'username', username);
                const docSnap = await getDoc(ref);
                setIsValid(!docSnap.exists());
                setLoading(false);
            }
        } , 500 ),
        []
    );

    return (
        !username &&
        <section>
            <h3 className="py-4">Pilih Username</h3>
            <form onSubmit={onSubmit}>
                <input name="username" placeholder="username" value={formValue} onChange={onChange} className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
                <UsernameMessage username={formValue} isValid={isValid} loading={loading} />
                <button type="submit" className="px-4 py-2 rounded-md bg-green-500 shadow hover:bg-green-400 hover:shadow-xl text-white" disabled={!isValid}>
                    Choose
                </button>

                
            </form>
        </section>
    );

}

function UsernameMessage({ username, isValid, loading }) {
    if(loading) {
        return <p>Checking ...</p>;
    } else if(isValid) {
        return <p className="text-green-500 font-sans font-bold">{username} is available</p>;
    } else if(username && !isValid) {
        return <p className="text-red-500 font-mono font-semibold">{username} is taken</p>;
    } else {
        return <p>disini kah?</p>;
    }
}