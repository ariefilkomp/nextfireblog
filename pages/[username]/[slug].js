import { collectionGroup, doc, getDoc, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { getFirebase, getUserWithUsername, postToJSON } from "../../lib/firebase";
import { useDocumentData } from 'react-firebase-hooks/firestore';
import PostContent from "../../components/PostContent";
import MetaTags from "../../components/Metatags";
import { useContext, useEffect } from 'react';
import { UserContext } from '../../lib/context';
import Link from 'next/link';
import AuthCheck from "../../components/AuthCheck";

import hljs from 'highlight.js';

const { firestore } = getFirebase();

export async function getStaticProps({ params }) {
    const {username, slug} = params;
    const userDoc = await getUserWithUsername(username);

    let post;
    let path;
    let postsTerkait;

    if(userDoc) {
        const postRef = doc(userDoc.ref, 'posts', slug);
        const mydoc = await getDoc(postRef);
        
        post = postToJSON(mydoc);
        path = postRef.path;
        const catg = post?.categories == null || post?.categories.length == 0 ? ['umum'] : post?.categories;
        const qp = query(
            collectionGroup(firestore, 'posts'), 
            where('published', '==', true),
            where('categories', 'array-contains-any', catg ), 
            orderBy('createdAt', 'desc'),
            limit(3)
        );
    
        postsTerkait = (await getDocs(qp)).docs.map(postToJSON);

    }

    return {
        props: { post, path, postsTerkait},
        revalidate: 60*60*24*7,
    }

}

export async function getStaticPaths() {
    
    const snapshot = await getDocs(collectionGroup(firestore, 'posts'));
    const paths = snapshot.docs.map((doc) => {
        const { username, slug } = doc.data();
        return {
            params: { username, slug }
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

export default function Post(props) {

    useEffect(() => {
        hljs.highlightAll();
    }, []);

    const postRef = doc(firestore, props.path);
    const [realtimePost] = useDocumentData(postRef);
    const { user, roles } = useContext(UserContext);
    const post = realtimePost || props.post;
    return (<div className="mt-20 lg:mt-24 min-h-[600px] lg:min-h-[900px] w-full md:max-w-5xl px-4 py-4 bg-slate-50 rounded-xl md:mx-auto">
        <MetaTags title={post.title} description={post?.description} image={post?.imageThumbnail} />
        <main className="md:flex">
            <section className="w-full md:grow md:w-[480px] pr-4 pl-2">
                <PostContent post={post} />
            </section>
            <aside className="w-full mt-6 md:mt-0 md:w-64 md:shrink p-4 bg-slate-200 rounded-lg">
                <AuthCheck fallback={
                    <p></p>
                    }>
                    
                    {user?.uid == post.uid ? <Link href={`/admin/${post.slug}`}><span className="py-2 px-4 bg-slate-300 hover:bg-slate-400 hover:text-white rounded-md"> Edit </span></Link> : <p></p>}
                </AuthCheck>
                {
                    roles?.includes('admin') ? <Link href={`/review/${post.uid}/${post.slug}`}><span className="mx-4 py-2 px-4 bg-slate-300 hover:bg-slate-400 hover:text-white rounded-md">Review</span></Link> : <p></p>
                }
                <h2 className="my-4">Artikel Lain : </h2>
                <ul className="list-disc pl-4">
                    {
                        props?.postsTerkait.map( (item, index) => (
                            <li className="mb-4 font-semibold font-mono text-slate-600 hover:text-slate-400 hover:font-bold cursor-pointer" key={index}>
                                <Link href={`/${item.username}/${item.slug}`} >{item.title}</Link>
                            </li>
                        ))
                    }
                    
                </ul>

                <h2 className="my-4">Kategori : </h2>
                <ul className="">
                {
                    post?.categories?.map( (item, index) => (
                        <Link href={`/categories/${item}`} key={index}>
                            <li className="px-4 py-2 rounded-md font-mono bg-slate-50 hover:bg-slate-100 hover:font-semibold hover:shadow-md mb-2">
                                {item} 
                            </li>
                        </Link>  
                    ))
                }
                </ul>

                <div className="w-full h-60 bg-slate-400 sticky top-28"></div>
            </aside>
        </main>
        </div>
    )
}