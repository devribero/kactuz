"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './ProdutoSlider.module.css';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ProdutoSlider() {
  const [mainImage, setMainImage] = useState('/roupas/roupa1.png');
  const [activeThumb, setActiveThumb] = useState(0);
  const [fade, setFade] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [address, setAddress] = useState({ endereco: '', numero: '', complemento: '', cep: '' });
  const [userId, setUserId] = useState<string | null>(null);

  const startX = useRef(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const imagens = [
    '/roupas/roupa1.png',
    '/roupas/roupa2.png',
    '/roupas/roupa3.png',
    '/roupas/roupa4.png',
    '/roupas/roupa5.png'
  ];

  // Buscar usuário logado
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id ?? null);
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  function changeImageWithFade(src: string, index: number) {
    setFade(true);
    setTimeout(() => {
      setMainImage(src);
      setActiveThumb(index);
      setFade(false);
    }, 200);
  }

  const showSlide = useCallback((index: number) => {
    let newIndex = index;
    if (index >= imagens.length) newIndex = 0;
    if (index < 0) newIndex = imagens.length - 1;
    setSlideIndex(newIndex);

    const slideElement = sliderRef.current?.querySelector(`.${styles.slide}`) as HTMLElement;
    const slidesContainer = sliderRef.current?.querySelector(`.${styles.slides}`) as HTMLElement;

    if (slideElement && slidesContainer) {
      const slideWidth = slideElement.clientWidth;
      slidesContainer.style.transform = `translateX(-${slideWidth * newIndex}px)`;
    }
  }, [imagens.length]);

  const changeSlide = (n: number) => showSlide(slideIndex + n);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const endX = e.changedTouches[0].clientX;
    if (startX.current - endX > 50) changeSlide(1);
    else if (endX - startX.current > 50) changeSlide(-1);
  };

  useEffect(() => { showSlide(slideIndex); }, [slideIndex, showSlide]);

  const handleAddToCart = async () => {
    if (!userId) {
      alert('Você precisa estar logado para adicionar ao carrinho!');
      return;
    }
    if (!selectedSize) {
      alert('Selecione um tamanho antes de adicionar ao carrinho!');
      return;
    }
  
    // Adiciona ao carrinho
    const { error } = await supabase.from('Tamanhos').insert([{
      id_user: userId,
      produto: 'Camiseta Boxy &ldquo;Lov Cross&rdquo;',
      preco: 90,
      tamanho: selectedSize
    }]);
  
    if (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      return;
    }
  
    // Checa se usuário já tem endereço cadastrado
    const { data: endereco } = await supabase
      .from('Enderecos')
      .select('*')
      .eq('id_user', userId)
      .limit(1)
      .single();
  
    if (endereco) {
      router.push('/carrinho'); // vai direto para carrinho
    } else {
      setShowCartModal(true); // abre modal para cadastrar endereço
    }
  };  

  const handleSaveAddress = async () => {
    if (!userId) {
      alert('Você precisa estar logado!');
      return;
    }

    const { error } = await supabase.from('Enderecos').insert([{
      id_user: userId,
      endereco: address.endereco,
      numero: address.numero,
      complemento: address.complemento,
      cep: address.cep
    }]);

    if (error) {
      console.error('Erro ao salvar endereço:', error);
    } else {
      setShowCartModal(false);
      router.push('/carrinho');
    }
  };

  return (
    <div className={styles.container}>
      {/* Mobile Slider */}
      <div
        className={styles.mobileSlider}
        ref={sliderRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.slides}>
          {imagens.map((img, i) => (
            <div className={styles.slide} key={i}>
              <img src={img} alt={`Produto ${i + 1}`} />
            </div>
          ))}
        </div>

        <div className={styles.indicators}>
          {imagens.map((_, i) => (
            <button
              key={i}
              className={`${styles.indicator} ${slideIndex === i ? styles.active : ''}`}
              onClick={() => showSlide(i)}
            />
          ))}
        </div>

        <button
          className={`${styles.navButton} ${styles.prevButton}`}
          onClick={() => changeSlide(-1)}
        >
          &#8249;
        </button>
        <button
          className={`${styles.navButton} ${styles.nextButton}`}
          onClick={() => changeSlide(1)}
        >
          &#8250;
        </button>
      </div>

      {/* Desktop View */}
      <div className={styles.desktopView}>
        <div className={styles.productContainer}>
          <div className={styles.mainImageContainer}>
            <img
              src={mainImage}
              alt="Produto principal"
              className={`${styles.mainImage} ${fade ? styles.fade : ''}`}
            />
          </div>

          <div className={styles.productInfo}>
            <div className={styles.thumbnailsContainer}>
              {imagens.map((img, i) => (
                <button
                  key={i}
                  className={`${styles.thumbnail} ${activeThumb === i ? styles.activeThumbnail : ''}`}
                  onClick={() => changeImageWithFade(img, i)}
                >
                  <img src={img} alt={`Miniatura ${i + 1}`} />
                </button>
              ))}
            </div>

            <div className={styles.productDetails}>
              <h1 className={styles.productTitle}>Camiseta Boxy &ldquo;Lov Cross&rdquo;</h1>
              <h2 className={styles.price}>R$ 90,00</h2>

              <div className={styles.sizes}>
                  {['P', 'M', 'G', 'GG'].map((size) => (
                    <button
                      key={size}
                      className={`${styles.sizeButton} ${selectedSize === size ? styles.activeSizeButton : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
              </div>

              <button className={styles.buyButton} onClick={handleAddToCart}>
                Adicionar ao Carrinho
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de endereço */}
      {showCartModal && (
        <div className={styles.cartModal}>
          <div>
            <h2>Adicionar endereço de entrega</h2>
            <input 
              placeholder="Rua" 
              value={address.endereco} 
              onChange={e => setAddress({...address, endereco: e.target.value})}
            />
            <input 
              placeholder="Número" 
              value={address.numero} 
              onChange={e => setAddress({...address, numero: e.target.value})}
            />
            <input 
              placeholder="Complemento" 
              value={address.complemento} 
              onChange={e => setAddress({...address, complemento: e.target.value})}
            />
            <input 
              placeholder="CEP" 
              value={address.cep} 
              onChange={e => setAddress({...address, cep: e.target.value})}
            />
            <button onClick={handleSaveAddress}>Salvar endereço</button>
          </div>
        </div>
      )}
    </div>
  );
}
