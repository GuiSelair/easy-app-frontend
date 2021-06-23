import Link from 'next/link';
import { useRouter } from 'next/router'

import styles from './styles.module.css';

export default function SideMenu() {
  const { pathname } = useRouter();

  return (
    <aside className={styles.container}>
      <strong>Navegação</strong>
      <hr />
      <ul>
        <Link href="/niveis">
          <a>
            <li className={pathname === "/niveis" ? "active": ""}>
              Níveis de curso
            </li>
          </a>
        </Link>
        <Link href="/consulta-api">
          <a>
            <li className={pathname === "/consulta-api" ? "active": ""}>
              Consulta API
            </li>
          </a>
        </Link>
      </ul>
    </aside>
  );
}