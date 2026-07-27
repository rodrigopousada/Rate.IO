import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';

interface Grupo {
  id: number;
  nome: string;
}

interface Evento {
  id: number;
  nome: string;
  ativo: boolean;
  metaValor: number | null;
  arrecadado: number;
  dataEvento: string;
  grupo: Grupo;
}

interface UsuarioSessao {
  id: string;
  nome: string;
  email: string;
}

export default function App() {
  const router = useRouter();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grupoFiltroId, setGrupoFiltroId] = useState<number | null>(null);
  const [ordemData, setOrdemData] = useState<'proximos' | 'distantes'>('proximos');
  const [usuario, setUsuario] = useState<UsuarioSessao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false);

  const buscarEventos = useCallback(async () => {
    try {
      const usuarioId = await AsyncStorage.getItem('usuarioId');
      const usuarioNome = await AsyncStorage.getItem('usuarioNome');
      const usuarioEmail = await AsyncStorage.getItem('usuarioEmail');

      if (!usuarioId) {
        router.replace('/login' as any);
        return;
      }

      setUsuario({
        id: usuarioId,
        nome: usuarioNome || 'Usuario',
        email: usuarioEmail || '',
      });

      const [eventosResposta, gruposResposta] = await Promise.all([
        fetch(`${API_BASE_URL}/eventos/usuario/${usuarioId}`),
        fetch(`${API_BASE_URL}/grupos/usuario/${usuarioId}`),
      ]);

      if (!eventosResposta.ok || !gruposResposta.ok) {
        throw new Error('Nao foi possivel carregar os eventos');
      }

      const eventosDados = (await eventosResposta.json()) as Evento[];
      const gruposDados = (await gruposResposta.json()) as Grupo[];
      setEventos(eventosDados);
      setGrupos(gruposDados);
    } catch (erro) {
      console.error('Erro ao buscar eventos:', erro);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      buscarEventos();
    }, [buscarEventos])
  );

  const aoPuxarPraBaixo = () => {
    setAtualizando(true);
    buscarEventos();
  };

  const sair = async () => {
    await AsyncStorage.multiRemove(['usuarioId', 'usuarioNome', 'usuarioEmail']);
    setMenuPerfilAberto(false);
    router.replace('/login' as any);
  };

  const eventosFiltrados = eventos
    .filter((evento) => grupoFiltroId === null || evento.grupo.id === grupoFiltroId)
    .sort((a, b) => {
      const dataA = new Date(a.dataEvento).getTime();
      const dataB = new Date(b.dataEvento).getTime();
      return ordemData === 'proximos' ? dataA - dataB : dataB - dataA;
    });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity><Text style={styles.headerAction}>Menu</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>rate.io</Text>
        <TouchableOpacity onPress={() => setMenuPerfilAberto(true)}>
          <Text style={styles.headerAction}>Perfil</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, !carregando && eventos.length === 0 && styles.contentEmpty]}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={aoPuxarPraBaixo}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
      >
        {!carregando && eventos.length > 0 ? (
          <View style={styles.filters}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              <TouchableOpacity style={[styles.filterChip, grupoFiltroId === null && styles.filterChipActive]} onPress={() => setGrupoFiltroId(null)}>
                <Text style={[styles.filterChipText, grupoFiltroId === null && styles.filterChipTextActive]}>Todos</Text>
              </TouchableOpacity>
              {grupos.map((grupo) => (
                <TouchableOpacity key={grupo.id} style={[styles.filterChip, grupoFiltroId === grupo.id && styles.filterChipActive]} onPress={() => setGrupoFiltroId(grupo.id)}>
                  <Text style={[styles.filterChipText, grupoFiltroId === grupo.id && styles.filterChipTextActive]}>{grupo.nome}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.sortRow}>
              <TouchableOpacity style={[styles.sortButton, ordemData === 'proximos' && styles.sortButtonActive]} onPress={() => setOrdemData('proximos')}>
                <Text style={[styles.sortText, ordemData === 'proximos' && styles.sortTextActive]}>Mais proximos</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.sortButton, ordemData === 'distantes' && styles.sortButtonActive]} onPress={() => setOrdemData('distantes')}>
                <Text style={[styles.sortText, ordemData === 'distantes' && styles.sortTextActive]}>Mais distantes</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {carregando ? (
          <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />
        ) : eventos.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nenhum role por aqui ainda</Text>
            <Text style={styles.emptyText}>
              Entre em um clube e crie o primeiro evento para comecar a dividir os gastos.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/criar-evento' as any)}
            >
              <Text style={styles.emptyButtonText}>Criar novo role</Text>
            </TouchableOpacity>
          </View>
        ) : (
          eventosFiltrados.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Nada nesse filtro</Text>
              <Text style={styles.emptyText}>Troque o clube selecionado ou veja todos os roles.</Text>
            </View>
          ) : eventosFiltrados.map((evento) => {
            const meta = evento.metaValor || 0;
            const arrecadado = evento.arrecadado || 0;
            const porcentagem = Math.min(meta > 0 ? (arrecadado / meta) * 100 : 0, 100);

            return (
              <TouchableOpacity key={evento.id} style={styles.card} onPress={() => router.push(`/evento/${evento.id}` as any)}>
                <View style={styles.cardHeader}>
                  <Text style={styles.groupName}>{evento.grupo ? evento.grupo.nome : 'Sem grupo'}</Text>
                  <Text style={styles.date}>{evento.dataEvento}</Text>
                </View>

                <Text style={styles.eventName}>{evento.nome}</Text>
                <Text style={styles.status}>{evento.ativo ? 'Vai rolar' : 'Finalizado'}</Text>

                <View style={styles.progressContainer}>
                  <View style={styles.progressLabels}>
                    <Text style={styles.progressText}>R$ {arrecadado.toFixed(2)}</Text>
                    <Text style={styles.progressText}>Meta: R$ {meta.toFixed(2)}</Text>
                  </View>
                  <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${porcentagem}%` }]} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => router.push('/criar-evento' as any)}
        >
          <Text style={styles.footerButtonText}>Novo Role</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerButtonDark}
          onPress={() => router.push('/clubes' as any)}
        >
          <Text style={styles.buttonSolidText}>Meus Clubes</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={menuPerfilAberto}
        onRequestClose={() => setMenuPerfilAberto(false)}
      >
        <View style={styles.modalLayer}>
          <Pressable style={styles.modalBackdrop} onPress={() => setMenuPerfilAberto(false)} />
          <View style={styles.sideMenu}>
            <View>
              <Text style={styles.sideMenuTitle}>Perfil</Text>
              <Text style={styles.profileName}>{usuario?.nome}</Text>
              {usuario?.email ? <Text style={styles.profileEmail}>{usuario.email}</Text> : null}
            </View>

            <View style={styles.sideMenuActions}>
              <TouchableOpacity style={styles.sideMenuButton} onPress={() => setMenuPerfilAberto(false)}>
                <Text style={styles.sideMenuButtonText}>Fechar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutButton} onPress={sair}>
                <Text style={styles.logoutButtonText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#E5E7EB' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  headerAction: { fontSize: 14, color: '#374151', fontWeight: '600' },
  content: { flex: 1, paddingHorizontal: 20 },
  contentContainer: { paddingTop: 20, paddingBottom: 20 },
  contentEmpty: { flexGrow: 1, justifyContent: 'center' },
  loader: { marginTop: 50 },
  emptyState: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 24, borderWidth: 1, borderColor: '#E5E7EB' },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  emptyText: { fontSize: 15, lineHeight: 22, color: '#6B7280', marginBottom: 20 },
  emptyButton: { backgroundColor: '#111827', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  emptyButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  filters: { marginBottom: 16 },
  filterScroll: { gap: 8, paddingBottom: 10 },
  filterChip: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#FFFFFF' },
  filterChipActive: { backgroundColor: '#111827', borderColor: '#111827' },
  filterChipText: { color: '#374151', fontWeight: '800', fontSize: 13 },
  filterChipTextActive: { color: '#FFFFFF' },
  sortRow: { flexDirection: 'row', gap: 8 },
  sortButton: { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  sortButtonActive: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  sortText: { color: '#374151', fontWeight: '800', fontSize: 13 },
  sortTextActive: { color: '#2563EB' },
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
  footer: { flexDirection: 'row', gap: 12, padding: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: '#E5E7EB' },
  footerButton: { flex: 1, backgroundColor: '#3B82F6', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  footerButtonDark: { flex: 1, backgroundColor: '#111827', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  footerButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  buttonSolidText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  modalLayer: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(17, 24, 39, 0.35)' },
  sideMenu: { width: 300, maxWidth: '82%', height: '100%', backgroundColor: '#FFFFFF', paddingTop: 58, paddingHorizontal: 22, paddingBottom: 24, justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: -2, height: 0 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  sideMenuTitle: { fontSize: 13, color: '#6B7280', fontWeight: '700', textTransform: 'uppercase', marginBottom: 16 },
  profileName: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  profileEmail: { fontSize: 14, color: '#6B7280' },
  sideMenuActions: { gap: 12 },
  sideMenuButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#D1D5DB' },
  sideMenuButtonText: { color: '#374151', fontWeight: '700', fontSize: 15 },
  logoutButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: '#EF4444' },
  logoutButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
});
