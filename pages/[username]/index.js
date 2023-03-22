import UserProfile from '../../components/UserProfile';
import PostFeed from '../../components/PostFeed';
import { getUserWithUsername, postToJSON, getFirebase } from '../../lib/firebase';
import { collection, getDocs, limit, orderBy, query, startAfter, Timestamp, where } from 'firebase/firestore';
import { useState } from 'react';
import Loader from '../../components/Loader';
const LIMIT = 5;
const { firestore } = getFirebase();
async function getPosts(userDoc) {
    let posts = null;
    let user = null;
    if(userDoc) {
        user = userDoc.data();
        const postQuery = userDoc.ref;
        const qq = query( 
            collection(postQuery, 'posts'), 
            where('published', '==', true), 
            orderBy('createdAt', 'desc'), 
            limit(LIMIT)
        );

        posts = (await getDocs(qq)).docs.map(postToJSON);
    }

    return posts;
}

export async function getStaticProps({ params }) {

    const { username } = params;
    const userDoc = await getUserWithUsername(username);

    if(!userDoc) {
        return {
            notFound: true,
        }
    }
    //JSON serializable data
    let user = null;
    let posts = null;
    let uid = null;

    if(userDoc) {
        user = userDoc.data();
        uid = userDoc.id;
        posts = await getPosts(userDoc);
    }

    return {
      props: { user, posts, uid },
    };
}

export async function getStaticPaths() {
    
    const snapshot = await getDocs(collection(firestore, 'username'));
    const pathsArr = snapshot.docs.filter((doc) => {
        return doc.id != "admin";
    });
    
    const paths = pathsArr.map((doc) => {
        return {
            params: { username: doc.id }
        };
    });

    return {
        // must be in this format
        // paths : [
        //    {params: {username, slug}}
        // ]

        paths,
        fallback: 'blocking',
    }

}

export default function UserProfilePage(props) {
    const [posts, setPosts] = useState(props.posts);
    const [loading, setLoading] = useState(false);
    const [postsEnd, setPostsEnd] = useState(false);
    
    const getMorePosts = async () => {
        setLoading(true);
        const last = posts[posts.length - 1];
        const cursor = typeof last.createdAt === "number" ? Timestamp.fromMillis(last.createdAt) : last.createdAt;
        let newPosts = [];
        const qq = query( 
                collection(firestore, `users/${props.uid}/posts`), 
                where('published', '==', true), 
                orderBy('createdAt', 'desc'),
                startAfter(cursor),
                limit(LIMIT)
            );
        newPosts = (await getDocs(qq)).docs.map((doc) => doc.data());
        setPosts(posts.concat(newPosts));

    
        setLoading(false);
    
        if (newPosts.length < LIMIT) {
          setPostsEnd(true);
        }
    }
      
    return (
        <main className='mt-24 lg:mt-28 min-h-[900px] max-w-5xl px-4 py-4 bg-slate-50 rounded-xl mx-auto'>
            <UserProfile user={props.user}/>
            <PostFeed posts={posts} />
            {!loading && !postsEnd && <button onClick={getMorePosts} className="py-2 px-4 rounded-md bg-slate-300 hover:bg-slate-200 hover:rounded-md">Muat lebih banyak</button>}
            <Loader show={loading} />
            {postsEnd && <p className='font-thin from-neutral-800'>You have reach the end.</p>}
        </main>
    )
}