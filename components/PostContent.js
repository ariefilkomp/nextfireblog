import Link from "next/link";
import parse from "html-react-parser"

export default function PostContent({ post }) {
    const createdAt = typeof post?.createdAt === "number" ? new Date(post.createdAt) : post.createdAt.toDate();

    return (
        <div className="text-xl font-sans leading-relaxed">
            <h1 className="text-slate-700 text-3xl lg:text-4xl font-sans">{post.title}</h1>
            <div className="text-sm">
                Written by { ' ' }
                <Link href={`/${post.username}`}>
                    @{post.username} 
                </Link>
                &nbsp; on {createdAt.toLocaleDateString("id-ID")}
            </div>

            <div className="text-slate-700">
                {parse(post?.content)}
            </div>
        </div>
    );
}