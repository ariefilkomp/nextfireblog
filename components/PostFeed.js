import Link from "next/link";
import Image from "next/image";

export default function PostFeed( {posts, admin} ) {
    return posts ? posts.map((post) => <PostItem post={post} key={post.slug} admin={admin} />) : <p>No posts!</p>
}

function PostItem({ post, admin, editlink }) {
    const wordCount = post?.content.trim().split(/\s+/g).length;
    const minutesToRead = (wordCount / 100 + 1).toFixed(0);
    const getSnippet = (html, title) => {
        const regexForStripHTML = /<([^</> ]+)[^<>]*?>[^<>]*?<\/\1> */gi;
        const stripContent = html.replaceAll(regexForStripHTML, '');
        let text = stripContent.substring(0, 160);
        return text;
    }

    const imageThumbnail = post?.imageThumbnail == '' || post?.imageThumbnail == null ? '/luffi.jpg' : post?.imageThumbnail;
    
    return (

        <div className='mb-4 rounded-lg shadow-lg bg-white overflow-clip lg:flex'>

            <figure className='flex-none w-full h-60 lg:w-60 lg:max-h-52 shadow-xl relative'>
                <Image src={imageThumbnail} fill alt={post?.title ?? 'title'} sizes="(max-width: 240px) 33vw" priority={true}/>
              
            </figure>

            <div className='p-4'>
                <Link href={`/${post.username}/${post.slug}`}>
                    <h1 className='text-slate-800 font-bold font-sans text-2xl  lg:text-3xl hover:text-slate-500 mb-4'>
                    {post.title}
                    </h1>
                </Link>
                <div>
                    <Link href={`/${post.username}`}>
                        <strong className="font-bold font-sans hover:text-slate-400">
                            by @{post.username}
                        </strong>
                    </Link>
                </div>

                <p className="text-xl leading-relaxed py-1">
                    {post?.description ?? getSnippet(post?.content, post?.title)}
                </p>

                <footer>
                    <span>
                        {wordCount} words. {minutesToRead} min read
                    </span>
                </footer>

            </div>
        </div>
    )
}