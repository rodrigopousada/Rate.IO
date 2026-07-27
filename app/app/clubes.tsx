import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
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

interface EntradaGrupoResponse {
    status: 'ENTROU' | 'PENDENTE';
    mensagem: string;
    grupo: Grupo;
}

export default function Clubes() {
    const router = useRouter();

    const [usuarioId, setUsuarioId] = useState<string | null>(null);
    const [busca, setBusca] = useState('');
    const [meusClubes, setMeusClubes] = useState<Grupo[]>([]);
    const [resultados, setResultados] = useState<Grupo[]>([]);
    const [buscando, setBuscando] = useState(false);
    const [carregandoClubes, setCarregandoClubes] = useState(true);
    const [entrandoClubeId, setEntrandoClubeId] = useState<number | null>(null);
    const [mensagemBusca, setMensagemBusca] = useState('');

    const carregarMeusClubes = useCallback(async (id: string) => {
        try {
            const resposta = await fetch(`${API_BASE_URL}/grupos/usuario/${id}`);
            if (!resposta.ok) {
                throw new Error('Nao foi possivel carregar seus clubes');
            }

            const dados = (await resposta.json()) as Grupo[];
            setMeusClubes(dados);
        } catch (erro) {
            console.error('Erro ao carregar clubes:', erro);
            Alert.alert('Erro', 'Nao foi possivel carregar seus clubes.');
        } finally {
            setCarregandoClubes(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            const iniciar = async () => {
                setCarregandoClubes(true);
                const id = await AsyncStorage.getItem('usuarioId');

                if (!id) {
                    router.replace('/login' as any);
                    return;
                }

                setUsuarioId(id);
                carregarMeusClubes(id);
            };

            iniciar();
        }, [carregarMeusClubes, router])
    );

    const buscarClubes = async () => {
        const termo = busca.trim();
        if (!termo) {
            setMensagemBusca('Digite o nome de um clube para pesquisar.');
            setResultados([]);
            return;
        }

        setBuscando(true);
        setMensagemBusca('');

        try {
            const resposta = await fetch(`${API_BASE_URL}/grupos/pesquisar?nome=${encodeURIComponent(termo)}`);
            if (!resposta.ok) {
                throw new Error(`Nao foi possivel buscar clubes: ${resposta.status}`);
            }

            const dados = (await resposta.json()) as Grupo[];
            setResultados(dados);
            setMensagemBusca(dados.length === 0 ? 'Nenhum clube encontrado com esse nome.' : '');
        } catch (erro) {
            console.error('Erro ao buscar clubes:', erro);
            setMensagemBusca(`Nao foi possivel buscar clubes agora. Confira se a API esta ligada em ${API_BASE_URL}.`);
            setResultados([]);
        } finally {
            setBuscando(false);
        }
    };

    const entrarNoClube = async (grupo: Grupo) => {
        if (!usuarioId) {
            Alert.alert('Erro', 'Nao foi possivel entrar nesse clube.');
            return;
        }

        setEntrandoClubeId(grupo.id);

        try {
            const resposta = await fetch(`${API_BASE_URL}/grupos/entrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    grupoId: grupo.id,
                    usuarioId: Number(usuarioId),
                }),
            });

            if (!resposta.ok) {
                throw new Error('Nao foi possivel entrar no clube');
            }

            const dados = (await resposta.json()) as EntradaGrupoResponse;
            await carregarMeusClubes(usuarioId);

            if (dados.status === 'ENTROU') {
                setResultados((atuais) => atuais.filter((resultado) => resultado.id !== grupo.id));
            }

            Alert.alert('Pronto', dados.mensagem);
        } catch (erro) {
            console.error('Erro ao entrar no clube:', erro);
            Alert.alert('Erro', 'Nao foi possivel entrar nesse clube.');
        } finally {
            setEntrandoClubeId(null);
        }
    };

    const participaDoClube = (grupoId: number) => meusClubes.some((grupo) => grupo.id === grupoId);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.headerIcon}>Voltar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.replace('/')}>
                    <Text style={styles.headerTitle}>rate.io</Text>
                </TouchableOpacity>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Entrar em um Clube</Text>
                    <View style={styles.searchRow}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nome do clube..."
                            placeholderTextColor="#9CA3AF"
                            value={busca}
                            onChangeText={setBusca}
                            returnKeyType="search"
                            onSubmitEditing={buscarClubes}
                        />
                        <TouchableOpacity style={styles.searchButton} onPress={buscarClubes} disabled={buscando}>
                            {buscando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.searchButtonText}>Buscar</Text>}
                        </TouchableOpacity>
                    </View>

                    {mensagemBusca ? <Text style={styles.messageText}>{mensagemBusca}</Text> : null}

                    {resultados.map((grupo) => {
                        const jaParticipa = participaDoClube(grupo.id);
                        const entrando = entrandoClubeId === grupo.id;

                        return (
                            <View key={grupo.id} style={styles.resultItem}>
                                <TouchableOpacity style={styles.resultTextBlock} onPress={() => router.push(`/clube/${grupo.id}` as any)}>
                                    <Text style={styles.clubName}>{grupo.nome}</Text>
                                    <Text style={styles.clubMeta}>
                                        {grupo.membros.length} membro{grupo.membros.length === 1 ? '' : 's'} | {grupo.entradaComAprovacao ? 'entrada com aprovacao' : 'entrada livre'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.joinButton, jaParticipa && styles.joinButtonDisabled]}
                                    onPress={() => entrarNoClube(grupo)}
                                    disabled={jaParticipa || entrando}
                                >
                                    {entrando ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.joinButtonText}>{jaParticipa ? 'Ja participo' : grupo.entradaComAprovacao ? 'Pedir' : 'Entrar'}</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </View>

                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={() => router.push('/criar-clube' as any)}
                    >
                        <Text style={styles.createButtonText}>+ Criar Novo Clube</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Clubes que participo</Text>

                    {carregandoClubes ? (
                        <ActivityIndicator color="#3B82F6" style={styles.clubLoader} />
                    ) : meusClubes.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>Voce ainda nao participa de nenhum clube.</Text>
                            <Text style={styles.emptyStateSubText}>Busque um clube acima ou crie o seu proprio para comecar a ratear.</Text>
                        </View>
                    ) : (
                        meusClubes.map((grupo) => (
                            <TouchableOpacity key={grupo.id} style={styles.clubCard} onPress={() => router.push(`/clube/${grupo.id}` as any)}>
                                <Text style={styles.clubName}>{grupo.nome}</Text>
                                <Text style={styles.clubMeta}>{grupo.administrador ? `Admin: ${grupo.administrador.nome}` : 'Admin nao definido'}</Text>
                                <Text style={styles.clubMeta}>Codigo: {grupo.conviteCodigo || 'indisponivel'}</Text>
                                {grupo.conviteLink ? <Text style={styles.inviteLink}>{grupo.conviteLink}</Text> : null}
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA', paddingTop: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#E5E7EB' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
    headerIcon: { fontSize: 14, color: '#374151', fontWeight: '700' },
    headerSpacer: { width: 48 },
    content: { flex: 1 },
    contentContainer: { padding: 20 },
    section: { marginBottom: 30 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 15 },
    searchRow: { flexDirection: 'row', gap: 10 },
    input: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 15, fontSize: 16, color: '#111827', minHeight: 50 },
    searchButton: { backgroundColor: '#3B82F6', paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center', borderRadius: 12, minWidth: 88 },
    searchButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
    messageText: { marginTop: 12, color: '#6B7280', fontSize: 14 },
    resultItem: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginTop: 12, borderWidth: 1, borderColor: '#E5E7EB', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
    resultTextBlock: { flex: 1 },
    clubName: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
    clubMeta: { fontSize: 13, color: '#6B7280', marginTop: 3 },
    inviteLink: { fontSize: 12, color: '#3B82F6', marginTop: 8 },
    joinButton: { backgroundColor: '#111827', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, minWidth: 86, alignItems: 'center' },
    joinButtonDisabled: { backgroundColor: '#9CA3AF' },
    joinButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
    createButton: { backgroundColor: '#111827', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    createButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
    clubLoader: { marginTop: 20 },
    clubCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
    emptyState: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed' },
    emptyStateText: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginBottom: 5, textAlign: 'center' },
    emptyStateSubText: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
});
