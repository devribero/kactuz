"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import styles from "./page.module.css";

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

export default function Perfil() {
  const [userId, setUserId] = useState<string | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [endereco, setEndereco] = useState<Endereco | null>(null);
  const [editing, setEditing] = useState(false);
  const [formEndereco, setFormEndereco] = useState<Endereco | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id ?? null;
      setUserId(uid);

      if (uid) {
        const { data: produtosData } = await supabase
          .from("Tamanhos")
          .select("*")
          .eq("id_user", uid);
        setProdutos(produtosData as Produto[]);

        const { data: enderecoData } = await supabase
          .from("Enderecos")
          .select("*")
          .eq("id_user", uid)
          .limit(1)
          .single();
        setEndereco(enderecoData as Endereco);
        setFormEndereco(enderecoData as Endereco);
      }
    };
    fetchData();
  }, []);

  const handleDeleteEndereco = async () => {
    if (!endereco) return;
    await supabase.from("Enderecos").delete().eq("id", endereco.id);
    setEndereco(null);
    setFormEndereco(null);
  };

  const handleSaveEndereco = async () => {
    if (!formEndereco || !userId) return;

    if (endereco) {
      await supabase.from("Enderecos").update({
        endereco: formEndereco.endereco,
        numero: formEndereco.numero,
        complemento: formEndereco.complemento,
        cep: formEndereco.cep
      }).eq("id", endereco.id);
    } else {
      await supabase.from("Enderecos").insert({
        id_user: userId,
        endereco: formEndereco.endereco,
        numero: formEndereco.numero,
        complemento: formEndereco.complemento,
        cep: formEndereco.cep
      });
    }

    setEndereco(formEndereco);
    setEditing(false);
  };

  if (!userId) return <p className={styles.message}>Você precisa estar logado para acessar o perfil.</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Perfil</h1>

      {/* Endereço */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Endereço de Entrega</h2>
        {editing ? (
          <div className={styles.editForm}>
            <input placeholder="Rua" value={formEndereco?.endereco || ''} onChange={e => setFormEndereco({...formEndereco!, endereco: e.target.value})} />
            <input placeholder="Número" value={formEndereco?.numero || ''} onChange={e => setFormEndereco({...formEndereco!, numero: e.target.value})} />
            <input placeholder="Complemento" value={formEndereco?.complemento || ''} onChange={e => setFormEndereco({...formEndereco!, complemento: e.target.value})} />
            <input placeholder="CEP" value={formEndereco?.cep || ''} onChange={e => setFormEndereco({...formEndereco!, cep: e.target.value})} />
            <div className={styles.buttonGroup}>
              <button className={styles.saveButton} onClick={handleSaveEndereco}>Salvar</button>
              <button className={styles.cancelButton} onClick={() => setEditing(false)}>Cancelar</button>
            </div>
          </div>
        ) : endereco ? (
          <div className={styles.addressCard}>
            <p><strong>{endereco.endereco}, {endereco.numero}</strong></p>
            {endereco.complemento && <p>{endereco.complemento}</p>}
            <p>CEP: {endereco.cep}</p>
            <div className={styles.buttonGroup}>
              <button className={styles.editButton} onClick={() => setEditing(true)}>Editar</button>
              <button className={styles.deleteButton} onClick={handleDeleteEndereco}>Excluir</button>
            </div>
          </div>
        ) : (
          <div className={styles.addressCard}>
            <p>Nenhum endereço cadastrado.</p>
            <button className={styles.editButton} onClick={() => setEditing(true)}>Adicionar</button>
          </div>
        )}
      </section>

      {/* Compras / Carrinho */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Minhas Compras</h2>
        <div className={styles.productsGrid}>
          {produtos.length > 0 ? (
            produtos.map(p => (
              <div key={p.id} className={styles.productCard}>
                <p className={styles.productName}>{p.produto}</p>
                <p>Tamanho: {p.tamanho}</p>
                <p className={styles.productPrice}>R$ {p.preco.toFixed(2)}</p>
              </div>
            ))
          ) : (
            <p className={styles.noProducts}>Nenhum produto comprado ainda.</p>
          )}
        </div>
      </section>
    </div>
  );
}
