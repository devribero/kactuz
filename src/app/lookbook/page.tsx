import Image from 'next/image';
import styles from './page.module.css';

export default function LookBook() {
  const looks = [
    {
      id: 1,
      src: '/looks/look_duhploh_1.jpeg',
      alt: 'Look 1'
    },
    {
      id: 2,
      src: '/looks/look_duhploh_2.jpeg', 
      alt: 'Look 2'
    },
    {
      id: 3,
      src: '/looks/look_duhploh_3.jpeg',
      alt: 'Look 3'
    },
    {
      id: 4,
      src: '/looks/look_duhploh_4.jpeg',
      alt: 'Look 4'
    }
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>LookBook</h1>
      
      <div className={styles.looks}>
        {looks.map((look) => (
          <Image
            key={look.id}
            src={look.src}
            alt={look.alt}
            width={400}
            height={400}
            className={styles.lookImage}
            priority={look.id <= 2}
          />
        ))}
      </div>
    </div>
  );
}