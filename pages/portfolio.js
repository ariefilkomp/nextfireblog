import { collectionGroup, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import React from 'react'
import MetaTags from '../components/Metatags'
import PortofolioCard from '../components/PortofolioCard'
import { getFirebase, postToJSON } from '../lib/firebase';

const { firestore } = getFirebase();

export async function getStaticProps(context) {

  const qp = query(
    collectionGroup(firestore, 'posts'),
    where('published', '==', true),
    where('categories', 'array-contains', 'javascript'),
    orderBy('createdAt', 'desc'),
    limit(25)
  );

  const posts = (await getDocs(qp)).docs.map(postToJSON);
  return {
    props: { posts },
    revalidate: 60 * 60 * 24 * 7,
  };
}

function Portfolio(props) {
  return (
    <main className='mt-24 max-w-4xl mx-auto min-h-[650px] lg:min-h-[850px]'>
      <MetaTags title={`ariefff.com - Portfolio`} description={`ariefff.com portfolio.`} />
      <header>
        <h1 className='text-3xl text-slate-700 font-bold font-sans px-4'>
          Portfolio
        </h1>
      </header>
      <div className="relative rounded-xl overflow-auto p-4">
        <div className="grid lg:grid-cols-2 gap-4 font-mono text-white text-sm text-center font-bold leading-6">
          {
            props.posts?.map((post, index) => {
              return <PortofolioCard post={post} key={index}/>
            })
          }
        </div>
      </div>
    </main>
  )
}

export default Portfolio