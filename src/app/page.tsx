import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.imageContainer}>
          <Image src="/estampa.png" alt="Minha logo" width={500} height={500}className={styles.logo} priority/>
        </div>
      </main>
    </div>
  );
}