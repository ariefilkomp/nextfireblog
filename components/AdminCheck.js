import Link from 'next/link';
import { useContext } from 'react';
import { UserContext } from '../lib/context';

// Component's children only shown to logged-in users
export default function AdminCheck(props) {
  const { username, roles } = useContext(UserContext);

  return username && roles.includes('admin') ? props.children : props.fallback || <Link href="/masuk">Anda tidak diijinkan untuk mereview</Link>;
}