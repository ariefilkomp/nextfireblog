import Link from "next/link";

export default function Footer() {
    return (
        <div className="w-full h-16 bg-gradient-to-b from-slate-100 to-slate-300 align-middle">
            <div className="mt-4 max-w-5xl px-4 mx-auto text-center font-thin"> build by <Link href={`/`}> ariefff.com </Link> </div>
        </div>
    );
}