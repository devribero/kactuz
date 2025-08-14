"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import Image from "next/image";
import styles from './page.module.css';
import { useRouter } from 'next/navigation';

interface Produto {
  id: string;
  produto: string;
  preco: number;
  tamanho: string;
}

interface Endereco {
  id: string;
  endereco: string;
  numero: string;
  complemento?: string;
  cep: string;
}

export default function Carrinho() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [endereco, setEndereco] = useState<Endereco | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

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

  // Buscar produtos e endereço
  useEffect(() => {
    if (!userId) return;

    const fetchProdutos = async () => {
      const { data, error } = await supabase
        .from('Tamanhos')
        .select('*')
        .eq('id_user', userId);

      if (error) console.error(error);
      else setProdutos(data as Produto[]);
    };

    const fetchEndereco = async () => {
      const { data, error } = await supabase
        .from('Enderecos')
        .select('*')
        .eq('id_user', userId)
        .limit(1)
        .single();

      if (!error) setEndereco(data as Endereco);
    };

    fetchProdutos();
    fetchEndereco();
  }, [userId]);

  const handleFinalizarCompra = () => {
    if (!endereco) {
      alert('Você precisa adicionar um endereço antes de finalizar a compra.');
      return;
    }
    router.push('/breve'); // Redireciona para a página "breve"

  };

  const handleRemoveProduto = async (produtoId: string) => {
    if (!userId) return;
  
    const { error } = await supabase
      .from('Tamanhos')
      .delete()
      .eq('id', produtoId);
  
    if (error) {
      console.error("Erro ao remover produto:", error);
    } else {
      // Atualizar estado local para refletir a remoção sem precisar recarregar
      setProdutos(prev => prev.filter(p => p.id !== produtoId));
    }
  };
  

  const calcularTotal = () => {
    return produtos.reduce((total, produto) => total + produto.preco, 0);
  };

  if (!userId) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🔒</div>
          <h2>Acesso Restrito</h2>
          <p>Você precisa estar logado para ver o carrinho.</p>
          <button className={styles.loginButton} onClick={() => router.push('/login')}>
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Carrinho de Compras</h1>
        {produtos.length > 0 && (
          <span className={styles.itemCount}>{produtos.length} {produtos.length === 1 ? 'item' : 'itens'}</span>
        )}
      </div>

      {produtos.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🛒</div>
          <h2>Seu carrinho está vazio</h2>
          <p>Que tal adicionar alguns produtos incríveis?</p>
          <button className={styles.shopButton} onClick={() => router.push('/produtos')}>
            Continuar Comprando
          </button>
        </div>
      ) : (
        <>
          <div className={styles.content}>
            {/* Lista de Produtos */}
            <div className={styles.produtosSection}>
              <h2 className={styles.sectionTitle}>Seus Produtos</h2>
              
              {/* Desktop Table */}
              <div className={styles.desktopTable}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Tamanho</th>
                      <th>Preço</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtos.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div className={styles.productInfo}>
                            <div className={styles.productImage}>
                              <Image src="/roupas/camisa.png" alt={p.produto} width={60} height={60} className={styles.logo} priority/>
                            </div>
                            <span className={styles.productName}>{p.produto}</span>
                          </div>
                        </td>
                        <td>
                          <span className={styles.sizeTag}>{p.tamanho}</span>
                        </td>
                        <td>
                          <span className={styles.price}>R$ {p.preco.toFixed(2)}</span>
                        </td>
                        <td>
                          <button 
                            className={styles.removeButton}
                            onClick={() => handleRemoveProduto(p.id)}
                          >
                            <Image src="/trash.svg" alt="Carrinho" width={24} height={24} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className={styles.mobileCards}>
                {produtos.map(p => (
                  <div key={p.id} className={styles.productCard}>
                    <div className={styles.cardHeader}>
                      <div className={styles.productImage}>
                        <Image src="/roupas/camisa.png" alt="Minha logo" width={50} height={50}className={styles.logo} priority/>
                      </div>
                      <div className={styles.cardInfo}>
                        <h3 className={styles.cardTitle}>{p.produto}</h3>
                        <span className={styles.sizeTag}>Tamanho: {p.tamanho}</span>
                      </div>
                    </div>
                    <div className={styles.cardPrice}>
                      <span className={styles.price}>R$ {p.preco.toFixed(2)}</span>
                      <button 
                        className={styles.removeButton}
                        onClick={() => handleRemoveProduto(p.id)}
                      >
                        <Image src="/trash.svg" alt="Carrinho" width={24} height={24} />
                      </button>
                    </div>  
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar com resumo */}
            <div className={styles.sidebar}>
              {/* Resumo da Compra */}
              <div className={styles.summary}>
                <h2 className={styles.sectionTitle}>Resumo da Compra</h2>
                <div className={styles.summaryLine}>
                  <span>Subtotal ({produtos.length} {produtos.length === 1 ? 'item' : 'itens'})</span>
                  <span>R$ {calcularTotal().toFixed(2)}</span>
                </div>
                <div className={`${styles.summaryLine} ${styles.total}`}>
                  <span>Total</span>
                  <span>R$ {calcularTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Endereço */}
              <div className={styles.addressSection}>
                <h2 className={styles.sectionTitle}>Endereço de Entrega</h2>
                {endereco ? (
                  <div className={styles.addressCard}>
                    <div className={styles.addressIcon}>📍</div>
                    <div className={styles.addressInfo}>
                      <p className={styles.addressMain}>
                        {endereco.endereco}, {endereco.numero}
                      </p>
                      {endereco.complemento && (
                        <p className={styles.addressComplement}>{endereco.complemento}</p>
                      )}
                      <p className={styles.addressCep}>CEP: {endereco.cep}</p>
                    </div>
                  </div>
                ) : (
                  <div className={styles.noAddress}>
                    <div className={styles.noAddressIcon}>📍</div>
                    <p>Você ainda não adicionou um endereço.</p>
                  </div>
                )}
              </div>

              {/* Botão Finalizar */}
              <button 
                className={styles.finalizarButton} 
                onClick={handleFinalizarCompra}
                disabled={!endereco}
              >
                Finalizar Compra
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}