import { collectionGroup, getDocs, limit, orderBy, query, startAfter, Timestamp, where } from "firebase/firestore";
import { useState } from "react";
import AdminCheck from "../../components/AdminCheck";
import Loader from "../../components/Loader";
import PostFeedReview from "../../components/PostFeedReview";
import { getFirebase, postToJSON } from "../../lib/firebase";

const { auth, firestore } = getFirebase();
const LIMIT = 5;
export default function ReviewPostsPage({ initPosts }) {
    const [posts, setPosts] = useState(initPosts);
    const [loading, setLoading] = useState(false);
    const [postsEnd, setPostsEnd] = useState(false);

    const getMorePosts = async () => {
        setLoading(true);
        const last = posts[posts.length - 1];
    
        const cursor = typeof last.createdAt === "number" ? Timestamp.fromMillis(last.createdAt) : last.createdAt;
    
        const qp = query(
          collectionGroup(firestore, 'posts'),
          where('published', '==', false),
          orderBy('createdAt', 'desc'),
          startAfter(cursor),
          limit(LIMIT)
        );
    
        const newPosts = (await getDocs(qp)).docs.map((doc) => doc.data());
        setPosts(posts.concat(newPosts));
        setLoading(false);
    
        if (newPosts.length < LIMIT) {
          setPostsEnd(true);
        }
      }

    return (
        <main className="pt-24">
            <div className='mx-auto max-w-3xl p-4'>
                <AdminCheck>
                    <PostFeedReview posts={posts} admin />
                    {!loading && !postsEnd && <button onClick={getMorePosts} className="py-2 px-4 rounded-md bg-slate-300 hover:bg-slate-200 hover:rounded-md">Muat lebih banyak</button>}
                    <Loader show={loading} />
                    {postsEnd && <p className='font-thin from-neutral-800'>You have reach the end.</p>}
                </AdminCheck>
            </div>
        </main>
    )
}

export async function getServerSideProps() {
    const qp = query(
        collectionGroup(firestore, 'posts'),
        where('published', '==', false),
        orderBy('createdAt', 'desc'),
        limit(LIMIT)
      );
    
    const initPosts = (await getDocs(qp)).docs.map(postToJSON);
  
    // Pass data to the page via props
    return { props: { initPosts } }
}
