import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';


interface Grupo {
  id: number;
  nome: string;
}
// 1. Atualizamos o nosso "molde" para avisar o TypeScript que agora recebemos dinheiro do banco
interface Evento {
  id: number;
  nome: string;
  ativo: boolean;
  meta: number;
  arrecadado: number;
  grupo: Grupo;
}

export default function App() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [carregando, setCarregando] = useState(true);

  // 2. Novo estado pra controlar a "rodinha" do puxar pra atualizar
  const [atualizando, setAtualizando] = useState(false);

  // 3. Transformamos o fetch numa função reutilizável pra podermos chamar ela em dois lugares diferentes
  const buscarEventos = () => {
    fetch('http://10.0.0.142:8080/eventos') // O seu IP certinho
        .then(resposta => resposta.json())
        .then(dados => {
          setEventos(dados);
          setCarregando(false);
          setAtualizando(false); // Esconde a rodinha depois que puxa os dados
        })
        .catch(erro => {
          console.error("Erro ao buscar eventos: ", erro);
          setCarregando(false);
          setAtualizando(false);
        });
  };

  // Chama a função a primeira vez que a tela abre
  useEffect(() => {
    buscarEventos();
  }, []);

  // 4. A função que dispara quando você passa o dedo pra baixo
  const aoPuxarPraBaixo = () => {
    setAtualizando(true); // Mostra a rodinha girando
    buscarEventos();      // Bate no Java de novo pedindo os dados atualizados
  };

  return (
      <View style={styles.container}>

        <View style={styles.header}>
          <TouchableOpacity><Text style={styles.headerIcon}>☰</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>rate.io</Text>
          <TouchableOpacity><Text style={styles.headerIcon}>👤</Text></TouchableOpacity>
        </View>

        <ScrollView
            style={styles.content}
            contentContainerStyle={{ paddingBottom: 20 }}
            // 5. A mágica do Puxar para Atualizar acontece aqui:
            refreshControl={
              <RefreshControl
                  refreshing={atualizando}
                  onRefresh={aoPuxarPraBaixo}
                  colors={['#3B82F6']} // Cor da rodinha no Android
                  tintColor="#3B82F6"  // Cor da rodinha no iPhone
              />
            }
        >

          {carregando ? (
              <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 50 }} />
          ) : (
              eventos.map((evento) => {

                // 6. Pegando os dados REAIS do banco (com `|| 0` pra não quebrar se vier vazio/null)
                const meta = evento.meta || 0;
                const arrecadado = evento.arrecadado || 0;

                // 7. A Matemática da Barra:
                let porcentagem = meta > 0 ? (arrecadado / meta) * 100 : 0;

                // Trava de segurança: se a galera pagar mais do que a meta, a barra trava em 100% pra não vazar da tela
                if (porcentagem > 100) porcentagem = 100;

                return (
                    <View key={evento.id} style={styles.card}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.groupName}>{evento.grupo ? evento.grupo.nome : 'Sem grupo'}</Text>
                        <Text style={styles.date}>Em breve</Text>
                      </View>

                      <Text style={styles.eventName}>{evento.nome}</Text>
                      <Text style={styles.status}>{evento.ativo ? '🟢 Vai rolar' : '🔴 Finalizado'}</Text>

                      <View style={styles.progressContainer}>
                        <View style={styles.progressLabels}>
                          {/* Imprimindo os valores reais formatados */}
                          <Text style={styles.progressText}>R$ {arrecadado.toFixed(2)}</Text>
                          <Text style={styles.progressText}>Meta: R$ {meta.toFixed(2)}</Text>
                        </View>
                        <View style={styles.progressBarBackground}>
                          {/* Injetando a porcentagem matemática na largura do azul */}
                          <View style={[styles.progressBarFill, { width: `${porcentagem}%` }]} />
                        </View>
                      </View>
                    </View>
                );
              })
          )}

        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.buttonOutline}>
            <Text style={styles.buttonOutlineText}>entrar em um grupo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonSolid}>
            <Text style={styles.buttonSolidText}>criar grupo</Text>
          </TouchableOpacity>
        </View>

      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#E5E7EB' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  headerIcon: { fontSize: 24 },
  content: { flex: 1, padding: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  groupName: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
  date: { fontSize: 14, color: '#6B7280' },
  eventName: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 5 },
  status: { fontSize: 14, color: '#10B981', fontWeight: '600', marginBottom: 20 },
  progressContainer: { marginTop: 10 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  progressBarBackground: { height: 10, backgroundColor: '#E5E7EB', borderRadius: 10, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#3B82F6', borderRadius: 10 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: '#E5E7EB' },
  buttonOutline: { flex: 1, borderWidth: 2, borderColor: '#111827', paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginRight: 10 },
  buttonOutlineText: { color: '#111827', fontWeight: 'bold', fontSize: 14 },
  buttonSolid: { flex: 1, backgroundColor: '#111827', paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginLeft: 10 },
  buttonSolidText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }
});