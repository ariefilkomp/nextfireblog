import { collection, doc, limit, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import kebabCase from 'lodash.kebabcase';
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import toast from "react-hot-toast";
import AuthCheck from "../../components/AuthCheck";
import PostFeed from "../../components/PostFeed";
import { UserContext } from "../../lib/context";
import { getFirebase } from "../../lib/firebase";

const { auth, firestore } = getFirebase();
export default function AdminPostsPage({ }) {
    return (
        <main className="pt-24 min-h-[600px] lg:min-h-[850px]">
            <div className='mx-auto max-w-3xl p-4'>
                <AuthCheck>
                    <CreateNewPost />
                    <PostList />
                </AuthCheck>
            </div>
        </main>
    )
}

function PostList() {
    const ref = collection(firestore, `users/${auth.currentUser.uid}/posts`);
    const qr = query(ref, orderBy('createdAt', 'desc'), limit(5));
    const [querySnapshot] = useCollection(qr);

    const posts = querySnapshot?.docs.map((doc) => doc.data());

    return (
        <>
            <h1>Manage Your Posts</h1>
            <PostFeed posts={posts} admin />
        </>
    );
}

function CreateNewPost() {
    const router = useRouter();

    const { username } = useContext(UserContext);

    const [title, setTitle] = useState('');

    //ensure slug is url safe

    const slug = encodeURI(kebabCase(title));

    // validate length
    const isValid = title.length > 3 && title.length < 100;

    const createPost = async (e) => {
        e.preventDefault();
        const uid = auth.currentUser.uid;
        const ref = doc(firestore, `users/${auth.currentUser.uid}/posts/${slug}`)

        // Tip: give all fields a default value here
        const data = {
            title,
            slug,
            uid,
            username,
            published: false,
            heartCount: 0,
            content: '# hello world!',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        await setDoc(ref, data);

        toast.success('Post Created!');
        await fetch('./api/revalidate?path=/&secret=IniAdalahTokenKamu');
        // Imperative navigation after doc is set
        router.push(`/admin/${slug}`);
    }

    return (
        <form onSubmit={createPost}>
            <input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="My Awesome Article!"
                className="p-2 border border-collapse rounded mb-4"    
            />
            <p>
                <strong>Slug : </strong> {slug}
            </p>
            <button className="bg-green-500 hover:bg-green-400 rounded-lg py-2 px-4 text-white hover:text-slate-800 cursor-pointer my-2" type="submit" disabled={!isValid}>
                Create New Post
            </button>
        </form>
    );

}