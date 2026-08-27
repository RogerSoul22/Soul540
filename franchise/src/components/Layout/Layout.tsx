import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import ApiFeedback from '../ApiFeedback/ApiFeedback';
import styles from './Layout.module.scss';

export default function Layout() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <ApiFeedback />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
