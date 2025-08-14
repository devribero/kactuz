import styles from './page.module.css';

export default function EmBreve() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Em Breve</h1>
        <p className={styles.subtitle}>Estamos preparando algo incrível para você</p>
      </div>
    </div>
  );
}