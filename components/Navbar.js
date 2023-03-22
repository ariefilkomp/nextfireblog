import { signOut } from 'firebase/auth';
import Link from 'next/link'
import { useContext } from 'react';
import { UserContext } from '../lib/context';
import { getFirebase } from '../lib/firebase';

export default function Navbar(props) {
    const { username, user } = useContext(UserContext);
    const { auth } = getFirebase();
    return (
        <div className="flex px-4 justify-between items-center">
            <div>
                <button id="hamburger" name="hamburger" type="button" className={`block absolute right-4 lg:hidden top-1/2 -translate-y-1/2 ${props.menuopen ? 'hamburger-active' : ''}`} onClick={props.onClick}>
                    <span className="hamburger-line transition duration-300 ease-in-out origin-top-left"></span>
                    <span className="hamburger-line transition duration-300 ease-in-out"></span>
                    <span className="hamburger-line transition duration-300 ease-in-out origin-bottom-left"></span>
                </button>
                <nav id="nav-menu" className={`${!props.menuopen ? 'hidden' : ''} absolute py-5 bg-white shadow-lg rounded-lg max-w-[250px] w-full right-4 top-full lg:block lg:static lg:bg-transparent lg:max-w-full lg:py=0 lg:px-6 lg:py-0 lg:shadow-none`}>
                    <ul className="block lg:flex">
                        <li className="group">
                            <Link href={`/`} className="text-base text-dark py-2 mx-8 flex group-hover:text-primary lg:inline-flex lg:py-6 lg:px-0 lg:mr-0">Blog</Link>
                        </li>
                        <li className="group">
                            <Link href={`/categories`} className="text-base text-dark py-2 mx-8 flex group-hover:text-primary lg:inline-flex lg:py-6 lg:px-0 lg:mr-0">Categories</Link>
                        </li>
                        <li className="group">
                            <Link href={`/about`}  className="text-base text-dark py-2 mx-8 flex group-hover:text-primary lg:inline-flex lg:py-6 lg:px-0 lg:mr-0">Tentang Saya</Link>
                        </li>
                        <li className="group">
                            <Link href={`/portfolio`}  className="text-base text-dark py-2 mx-8 flex group-hover:text-primary lg:inline-flex lg:py-6 lg:px-0 lg:mr-0">Portfolio</Link>
                        </li>
                        {username && (
                            <>
                            <li className="group">
                                <div className="text-base text-dark py-0 lg:mx-4 mx-8 flex group-hover:text-primary lg:inline-flex lg:py-6 lg:px-0 lg:mr-0">
                                    <button onClick={() => signOut(auth)} className={`py-1 px-4 text-red-50 rounded bg-red-200 hover:bg-red-300 hover:text-red-700`}>Sign Out</button>
                                </div>
                            </li>
                            <li className="group">
                                <Link href="/admin" className="text-base text-dark py-0 ml-4 flex group-hover:text-primary lg:inline-flex lg:py-6 lg:px-0 lg:mr-0">
                                    <button className="py-1 mt-2 lg:mt-0 px-4 mx-4 text-green-700 rounded bg-slate-300 hover:bg-slate-200 hover:text-green-500">Tulis Blog</button>
                                </Link>
                            </li>
                            <li className="group align-middle">
                                <Link href={`/${username}`} className="text-base text-dark align-middle py-0 mx-8 mt-4 lg:mt-0 flex group-hover:text-primary lg:inline-flex lg:py-6 lg:px-0 lg:mr-0">
                                    <img src={user?.photoURL || '/luffy.jpg'} className={`w-10 h-10 rounded-full`}/>
                                    <div className='ml-2 text-center inline-block align-middle'>{user?.displayName}</div>
                                </Link>
                            </li>
                            </>
                        )}
                        {!username && (
                            <li className="group">
                                <Link href="/masuk" className="text-base text-dark py-2 mx-8 flex group-hover:text-primary lg:inline-flex lg:py-6 lg:px-0 lg:mr-0">
                                    <button className="bg-slate-200 rounded-md p-2 text-xs">Log In</button>
                                </Link>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </div>
    );
}