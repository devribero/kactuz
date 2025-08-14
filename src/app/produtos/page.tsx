import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
        <div className={styles.produto}>
        <a href="/camisa"><img className={styles.camisa} src="/roupas/camisa.png" alt="" /></a>
    </div>
    </div>
  );
}