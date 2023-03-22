import { collectionGroup, doc, getDoc, getDocs, limit, orderBy, query, where, Timestamp, startAfter } from "firebase/firestore";
import { getFirebase, postToJSON } from "../../lib/firebase";
import MetaTags from "../../components/Metatags";
import { useState } from 'react';
import PostFeed from "../../components/PostFeed";
import Loader from "../../components/Loader";

const { firestore } = getFirebase();
const LIMIT = 5;

export async function getStaticProps({ params }) {
    const { slug } = params;
    const qp = query(
        collectionGroup(firestore, 'posts'),
        where('published', '==', true),
        where('categories', 'array-contains', slug ?? 'umum'),
        orderBy('createdAt', 'desc'),
        limit(LIMIT)
    );

    const posts = (await getDocs(qp)).docs.map(postToJSON);
    return {
        props: { posts, slug },
        revalidate: 60 * 60 * 24 * 7,
    };
}

export async function getStaticPaths() {

    const catRef = doc(firestore, 'simplelists/categories');
    const categories = (await getDoc(catRef)).data().names;
    const paths = categories.map((value, index) => {
        const { slug } = { slug: value };
        return {
            params: { slug }
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

export default function Category(props) {
    const [posts, setPosts] = useState(props.posts);
    const [loading, setLoading] = useState(false);

    const [postsEnd, setPostsEnd] = useState(false);

    const getMorePosts = async () => {
        setLoading(true);
        const last = posts[posts.length - 1];
        if(typeof last == "undefined") {
            setLoading(false);
            return;
        }

        const cursor = typeof last.createdAt === "number" ? Timestamp.fromMillis(last.createdAt) : last.createdAt;

        const qp = query(
            collectionGroup(firestore, 'posts'),
            where('categories', 'array-contains', props.slug ?? 'umum'),
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

    const thumbnail = posts.length > 0 ? posts[0].imageThumbnail : '';
    return (
        <section className="mt-20 px-4 lg:mt-24 min-h-[900px]">
            <div className='mx-auto max-w-3xl p-4'>
                <h2 className="mb-4">Category: {props.slug}</h2>
                <MetaTags title={`ariefff.com - semua artikel di kategori ${props.slug}`} description={`semua artike di kategori ${props.slug}`} image={thumbnail} />
                <PostFeed posts={posts} />

                { posts.length > 0 && !loading && !postsEnd && <button onClick={getMorePosts} className="py-2 px-4 rounded-md bg-slate-300 hover:bg-slate-200 hover:rounded-md">Muat lebih banyak</button>}
                { posts.length == 0 && <p>Tidak ditemukan artikel di kategori : {props.slug} </p>}
                <Loader show={loading} />

                {postsEnd && <p className='font-thin from-neutral-800'>Artikel Sudah Habis.</p>}

            </div>
        </section>
    )
}