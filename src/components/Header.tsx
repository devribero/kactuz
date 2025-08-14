"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./Header.module.css";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation"; // importa aqui

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter(); // cria instância do router

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchCartCount(session.user.id);
      }
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchCartCount(session.user.id);
      } else {
        setCartCount(0);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const fetchCartCount = async (userId: string) => {
    const { count, error } = await supabase
      .from("Tamanhos")
      .select("*", { count: "exact", head: true })
      .eq("id_user", userId);

    if (!error && count !== null) {
      setCartCount(count);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCartCount(0);
    setIsAvatarMenuOpen(false);
    setIsMenuOpen(false);
    router.push("/"); // manda pra home
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo} onClick={closeMenu}>
          <Image src="/logo.png" alt="Minha logo" width={80} height={80} />
        </Link>

        <nav className={styles.nav}>
          <Link href="/" onClick={closeMenu}>Home</Link>
          <Link href="/produtos" onClick={closeMenu}>Produtos</Link>
          <Link href="/contato" onClick={closeMenu}>Contato</Link>
          <Link href="/lookbook" onClick={closeMenu}>LookBook</Link>
        </nav>

        <div className={styles.authButton}>
          {user ? (
            <>
              <Link href="/carrinho" className={styles.cartIcon}>
                <Image src="/cart.svg" alt="Carrinho" width={24} height={24} />
                {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
              </Link>

              <div className={styles.avatarWrapper}>
                <button
                  className={styles.avatarButton}
                  onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                >
                  <Image src="/avatar.svg" alt="Perfil" width={28} height={28} />
                </button>

                {isAvatarMenuOpen && (
                  <div className={styles.avatarMenu}>
                    <Link href="/perfil" onClick={() => setIsAvatarMenuOpen(false)}>Perfil</Link>
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link href="/login" className={styles.button} onClick={closeMenu}>Login</Link>
          )}
        </div>

        <button className={styles.hamburger} onClick={toggleMenu} aria-label="Menu">
          <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.active : ''}`}></span>
          <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.active : ''}`}></span>
          <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.active : ''}`}></span>
        </button>
      </div>

      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}>
        <nav className={styles.mobileNav}>
          <Link href="/" onClick={closeMenu}>Home</Link>
          <Link href="/produtos" onClick={closeMenu}>Produtos</Link>
          <Link href="/contato" onClick={closeMenu}>Contato</Link>
          <Link href="/lookbook" onClick={closeMenu}>LookBook</Link>

          <div className={styles.mobileAuthButton}>
  {user ? (
    <>
      {/* Carrinho */}
      <Link href="/carrinho" className={styles.cartIcon}>
        <Image src="/cart.svg" alt="Carrinho" width={24} height={24} />
        {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
      </Link>

      {/* Avatar */}
      <div className={styles.avatarWrapper}>
          <button
            className={styles.avatarButton}
            onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
          >
            <Image src="/avatar.svg" alt="Perfil" width={28} height={28} />
          </button>

          {isAvatarMenuOpen && (
            <div className={styles.avatarMenu}>
              <Link href="/perfil" onClick={closeMenu}>Perfil</Link>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
    </>
  ) : (
    <Link href="/login" className={styles.button} onClick={closeMenu}>Login</Link>
  )}
</div>
        </nav>
      </div>

      {isMenuOpen && <div className={styles.overlay} onClick={closeMenu}></div>}
    </header>
  );
}
