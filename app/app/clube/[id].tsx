import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';

interface Usuario {
    id: number;
    nome: string;
    email: string;
}

interface Grupo {
    id: number;
    nome: string;
    conviteCodigo: string | null;
    conviteLink: string | null;
    entradaComAprovacao: boolean;
    administrador: Usuario | null;
    membros: Usuario[];
}

interface Evento {
    id: number;
    nome: string;
    metaValor: number | null;
    arrecadado: number;
    dataEvento: string;
    ativo: boolean;
}

interface Solicitacao {
    id: number;
    status: string;
    dataCriacao: string;
    usuario: Usuario;
}

export default function ClubeDetalhe() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [usuarioId, setUsuarioId] = useState<number | null>(null);
    const [grupo, setGrupo] = useState<Grupo | null>(null);
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [analisandoId, setAnalisandoId] = useState<number | null>(null);

    const isAdmin = useMemo(() => {
        return Boolean(usuarioId && grupo?.administrador?.id === usuarioId);
    }, [grupo, usuarioId]);

    const carregar = useCallback(async () => {
        if (!id) {
            return;
        }

        try {
            const usuarioSalvo = await AsyncStorage.getItem('usuarioId');
            const usuarioNumero = usuarioSalvo ? Number(usuarioSalvo) : null;
            setUsuarioId(usuarioNumero);

            const [grupoResposta, eventosResposta] = await Promise.all([
                fetch(`${API_BASE_URL}/grupos/${id}`),
                fetch(`${API_BASE_URL}/eventos/grupo/${id}`),
            ]);

            if (!grupoResposta.ok || !eventosResposta.ok) {
                throw new Error('Nao foi possivel carregar clube');
            }

            const grupoDados = (await grupoResposta.json()) as Grupo;
            const eventosDados = (await eventosResposta.json()) as Evento[];
            setGrupo(grupoDados);
            setEventos(eventosDados);

            if (usuarioNumero && grupoDados.administrador?.id === usuarioNumero) {
                const solicitacoesResposta = await fetch(`${API_BASE_URL}/grupos/${id}/solicitacoes?administradorId=${usuarioNumero}`);
                if (solicitacoesResposta.ok) {
                    setSolicitacoes((await solicitacoesResposta.json()) as Solicitacao[]);
                }
            } else {
                setSolicitacoes([]);
            }
        } catch (erro) {
            console.error('Erro ao carregar clube:', erro);
            Alert.alert('Erro', 'Nao foi possivel carregar esse clube.');
        } finally {
            setCarregando(false);
        }
    }, [id]);

    useEffect(() => {
        carregar();
    }, [carregar]);

    const analisar = async (solicitacaoId: number, aprovar: boolean) => {
        if (!usuarioId) {
            return;
        }

        setAnalisandoId(solicitacaoId);

        try {
            const resposta = await fetch(`${API_BASE_URL}/grupos/solicitacoes/${solicitacaoId}/analisar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    administradorId: usuarioId,
                    aprovar,
                }),
            });

            if (!resposta.ok) {
                throw new Error('Nao foi possivel analisar solicitacao');
            }

            await carregar();
        } catch (erro) {
            console.error('Erro ao analisar solicitacao:', erro);
            Alert.alert('Erro', 'Nao foi possivel responder esse pedido.');
        } finally {
            setAnalisandoId(null);
        }
    };

    if (carregando) {
        return (
            <View style={styles.loading}>
                <Stack.Screen options={{ title: 'Clube' }} />
                <ActivityIndicator color="#3B82F6" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Stack.Screen options={{ title: grupo?.nome || 'Clube', headerShadowVisible: false }} />

            <View style={styles.hero}>
                <Text style={styles.eyebrow}>Clube</Text>
                <Text style={styles.title}>{grupo?.nome}</Text>
                <Text style={styles.meta}>{grupo?.entradaComAprovacao ? 'Entrada com aprovacao do admin' : 'Entrada livre'}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Convite</Text>
                <Text style={styles.code}>{grupo?.conviteCodigo || 'indisponivel'}</Text>
                {grupo?.conviteLink ? <Text style={styles.link}>{grupo.conviteLink}</Text> : null}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Membros</Text>
                {grupo?.membros.map((membro) => (
                    <View key={membro.id} style={styles.memberRow}>
                        <View>
                            <Text style={styles.memberName}>{membro.nome}{grupo.administrador?.id === membro.id ? ' (admin)' : ''}</Text>
                            <Text style={styles.memberEmail}>{membro.email}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {isAdmin ? (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Pedidos de entrada</Text>
                    {solicitacoes.length === 0 ? (
                        <Text style={styles.emptyText}>Nenhum pedido pendente.</Text>
                    ) : (
                        solicitacoes.map((solicitacao) => (
                            <View key={solicitacao.id} style={styles.requestRow}>
                                <View style={styles.requestText}>
                                    <Text style={styles.memberName}>{solicitacao.usuario.nome}</Text>
                                    <Text style={styles.memberEmail}>{solicitacao.usuario.email}</Text>
                                </View>
                                <View style={styles.requestButtons}>
                                    <TouchableOpacity style={styles.approveButton} onPress={() => analisar(solicitacao.id, true)} disabled={analisandoId === solicitacao.id}>
                                        <Text style={styles.actionText}>Aceitar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.rejectButton} onPress={() => analisar(solicitacao.id, false)} disabled={analisandoId === solicitacao.id}>
                                        <Text style={styles.actionText}>Recusar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            ) : null}

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Roles do clube</Text>
                    <TouchableOpacity onPress={() => router.push('/criar-evento' as any)}>
                        <Text style={styles.linkAction}>Novo</Text>
                    </TouchableOpacity>
                </View>
                {eventos.length === 0 ? (
                    <Text style={styles.emptyText}>Esse clube ainda nao tem nenhum role.</Text>
                ) : (
                    eventos.map((evento) => (
                        <TouchableOpacity key={evento.id} style={styles.eventCard} onPress={() => router.push(`/evento/${evento.id}` as any)}>
                            <Text style={styles.eventName}>{evento.nome}</Text>
                            <Text style={styles.meta}>{evento.dataEvento} | R$ {Number(evento.arrecadado || 0).toFixed(2)} arrecadados</Text>
                        </TouchableOpacity>
                    ))
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F7FA' },
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    content: { padding: 20, paddingBottom: 40 },
    hero: { marginBottom: 18 },
    eyebrow: { color: '#6B7280', fontWeight: '800', fontSize: 13, marginBottom: 4 },
    title: { color: '#111827', fontSize: 32, fontWeight: '900' },
    meta: { color: '#6B7280', fontSize: 13, marginTop: 4 },
    section: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 18, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { color: '#111827', fontSize: 18, fontWeight: '900', marginBottom: 12 },
    code: { color: '#111827', fontSize: 26, fontWeight: '900', letterSpacing: 0 },
    link: { color: '#3B82F6', fontSize: 12, marginTop: 8 },
    linkAction: { color: '#3B82F6', fontWeight: '900' },
    memberRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    memberName: { color: '#111827', fontSize: 15, fontWeight: '800' },
    memberEmail: { color: '#6B7280', fontSize: 12, marginTop: 2 },
    requestRow: { gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    requestText: { gap: 2 },
    requestButtons: { flexDirection: 'row', gap: 8 },
    approveButton: { flex: 1, backgroundColor: '#10B981', borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
    rejectButton: { flex: 1, backgroundColor: '#EF4444', borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
    actionText: { color: '#FFFFFF', fontWeight: '900' },
    eventCard: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14, marginBottom: 10 },
    eventName: { color: '#111827', fontWeight: '900', fontSize: 15 },
    emptyText: { color: '#6B7280', lineHeight: 20 },
});
