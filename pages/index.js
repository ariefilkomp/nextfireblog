import { collectionGroup, getDocs, limit, orderBy, query, startAfter, Timestamp, where } from 'firebase/firestore';
import { useState } from 'react';
import PostFeed from '../components/PostFeed';
import Loader from '../components/Loader';
import { getFirebase, postToJSON } from '../lib/firebase';
import MetaTags from '../components/Metatags';

const LIMIT = 5;
const { firestore } = getFirebase();
export async function getStaticProps(context) {

  const qp = query(
    collectionGroup(firestore, 'posts'),
    where('published', '==', true),
    orderBy('createdAt', 'desc'),
    limit(LIMIT)
  );

  const posts = (await getDocs(qp)).docs.map(postToJSON);
  return {
    props: { posts },
  };
}

export default function Home(props) {
  const [posts, setPosts] = useState(props.posts);
  const [loading, setLoading] = useState(false);

  const [postsEnd, setPostsEnd] = useState(false);

  const getMorePosts = async () => {
    setLoading(true);
    const last = posts[posts.length - 1];

    const cursor = typeof last.createdAt === "number" ? Timestamp.fromMillis(last.createdAt) : last.createdAt;

    const qp = query(
      collectionGroup(firestore, 'posts'),
      where('published', '==', true),
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
    <section className="pt-20 lg:pt-24 min-h-[660px] lg:min-h-[850px]">
      <div className='mx-auto max-w-3xl p-4'>
        <MetaTags title={`ariefff.com - Arief Adi Nugroho's home page`} description={`Website tentang pemrograman dan tutorial pemrograman. Terutama JavaScript, PHP dan Flutter.`} />
        <PostFeed posts={posts} />

        {!loading && !postsEnd && <button onClick={getMorePosts} className="py-2 px-4 rounded-md bg-slate-300 hover:bg-slate-200 hover:rounded-md">Muat lebih banyak</button>}

        <Loader show={loading} />

        {postsEnd && <p className='font-thin from-neutral-800'>You have reach the end.</p>}

      </div>
    </section>
  )
}
