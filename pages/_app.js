import '../styles/globals.css'
import '../components/tiptap/styles.scss'
import 'highlight.js/styles/default.css';

import Header from '../components/Header'
import { UserContext } from '../lib/context'
import { useUserData } from '../lib/hooks'
import Footer from '../components/Footer'
import { Toaster } from 'react-hot-toast'
import Transition from '@/components/Transition';

function MyApp({ Component, pageProps }) {
  const userData = useUserData();
  return (
    <UserContext.Provider value={userData}>
      <Header />
      <Transition>
        <Component {...pageProps} />
      </Transition>
      <Footer />
      <Toaster />
    </UserContext.Provider>
  )
}

export default MyApp
