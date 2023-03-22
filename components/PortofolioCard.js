import Link from 'next/link'
import React from 'react'

function PortofolioCard({ post }) {
  const createdAt = typeof post?.createdAt === "number" ? new Date(post.createdAt) : post.createdAt.toDate();
  const imageThumbnail = post?.imageThumbnail == '' ? '/luffi.jpg' : post?.imageThumbnail;
  return (
    <div className="rounded-lg bg-indigo-300 dark:bg-indigo-800 dark:text-indigo-400 overflow-clip">
      <figure className='flex-none'>
        <img src={imageThumbnail} alt="NextJS" className='w-full lg:max-h-72 ' />
        <figcaption className='text-sm font-sans text-slate-600 px-2 py-1 hidden'>{`${post?.imageCaption ?? 'Arief Adi Nugroho blog'}`}</figcaption>
      </figure>
      <div className='px-4'>
        <Link href={`/${post?.username}/${post?.slug}`}>
          <h1 className='text-slate-800 font-bold font-sans text-2xl hover:text-slate-500'>{`${post?.title ?? 'No Title'}`}</h1>
        </Link>
        <p >
          {post?.description}
        </p>
      </div>
    </div>
  )
}

export default PortofolioCard