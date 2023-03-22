import Link from "next/link";
import { useState } from "react";
import Navbar from "./Navbar";

export default function Header() {
    const [menuopen, setMenuopen] = useState(false);
    return (
        <header className="bg-transparent absolute top-0 left-0 z-10 w-full flex items-center transition duration-500 navbar-fixed">
            <div className="container">
                <div className="flex items-center justify-between relative">
                    <div className="px-4 max-w-full">
                        <Link href="/" className="font-bold text-lg text-secondary block py-6">ariefff.com</Link>
                    </div>
                    <Navbar menuopen={menuopen} onClick={() => setMenuopen(!menuopen)}/>
                </div>
            </div>
        </header>
    );
}