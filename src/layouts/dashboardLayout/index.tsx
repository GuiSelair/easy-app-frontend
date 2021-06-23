
import SideMenu from '../../components/SideMenu';

import styles from '../../styles/layouts/Dashboard.module.css';

export default function DashboardLayout({ children }) {
  return (
    <div className={styles.container}>
      <SideMenu />
      <main>
        { children }
      </main>
    </div>
  );
}