import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';

interface Grupo {
    id: number;
    nome: string;
}

interface GrupoResponse extends Grupo {
    conviteCodigo: string | null;
}

const hojeIso = () => new Date().toISOString().slice(0, 10);

export default function CriarEvento() {
    const router = useRouter();
    const [grupos, setGrupos] = useState<GrupoResponse[]>([]);
    const [grupoId, setGrupoId] = useState<number | null>(null);
    const [nome, setNome] = useState('');
    const [metaValor, setMetaValor] = useState('');
    const [dataEvento, setDataEvento] = useState(hojeIso());
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);

    const carregarGrupos = useCallback(async () => {
        try {
            const usuarioId = await AsyncStorage.getItem('usuarioId');
            if (!usuarioId) {
                router.replace('/login' as any);
                return;
            }

            const resposta = await fetch(`${API_BASE_URL}/grupos/usuario/${usuarioId}`);
            if (!resposta.ok) {
                throw new Error('Nao foi possivel carregar clubes');
            }

            const dados = (await resposta.json()) as GrupoResponse[];
            setGrupos(dados);
            setGrupoId(dados[0]?.id ?? null);
        } catch (erro) {
            console.error('Erro ao carregar clubes:', erro);
            Alert.alert('Erro', 'Nao foi possivel carregar seus clubes.');
        } finally {
            setCarregando(false);
        }
    }, [router]);

    useEffect(() => {
        carregarGrupos();
    }, [carregarGrupos]);

    const criarEvento = async () => {
        if (!grupoId || !nome.trim() || !dataEvento.trim()) {
            Alert.alert('Aviso', 'Escolha um clube, informe nome e data.');
            return;
        }

        setSalvando(true);

        try {
            const resposta = await fetch(`${API_BASE_URL}/eventos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: nome.trim(),
                    metaValor: Number(metaValor.replace(',', '.')) || 0,
                    dataEvento: dataEvento.trim(),
                    grupoId,
                }),
            });

            if (!resposta.ok) {
                throw new Error('Nao foi possivel criar evento');
            }

            router.replace('/' as any);
        } catch (erro) {
            console.error('Erro ao criar evento:', erro);
            Alert.alert('Erro', 'Nao foi possivel criar o role.');
        } finally {
            setSalvando(false);
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Novo Role', headerShadowVisible: false }} />
            {carregando ? (
                <ActivityIndicator color="#3B82F6" style={styles.loader} />
            ) : (
                <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                    <Text style={styles.title}>Novo role</Text>
                    <Text style={styles.subtitle}>Escolha o clube e defina a meta para esse evento.</Text>

                    <View style={styles.form}>
                        <Text style={styles.label}>Clube</Text>
                        {grupos.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyText}>Crie ou entre em um clube antes de criar um role.</Text>
                                <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/clubes' as any)}>
                                    <Text style={styles.secondaryButtonText}>Ir para Clubes</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.segmentList}>
                                {grupos.map((grupo) => (
                                    <TouchableOpacity
                                        key={grupo.id}
                                        style={[styles.segmentButton, grupoId === grupo.id && styles.segmentButtonActive]}
                                        onPress={() => setGrupoId(grupo.id)}
                                    >
                                        <Text style={[styles.segmentText, grupoId === grupo.id && styles.segmentTextActive]}>{grupo.nome}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        <Text style={styles.label}>Nome do role</Text>
                        <TextInput style={styles.input} placeholder="Ex: Churrasco de sabado" placeholderTextColor="#9CA3AF" value={nome} onChangeText={setNome} />

                        <Text style={styles.label}>Meta de arrecadacao</Text>
                        <TextInput style={styles.input} placeholder="Ex: 350.00" placeholderTextColor="#9CA3AF" keyboardType="decimal-pad" value={metaValor} onChangeText={setMetaValor} />

                        <Text style={styles.label}>Data</Text>
                        <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor="#9CA3AF" value={dataEvento} onChangeText={setDataEvento} />

                        <TouchableOpacity style={styles.submitButton} onPress={criarEvento} disabled={salvando || grupos.length === 0}>
                            {salvando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitButtonText}>Criar role</Text>}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    loader: { marginTop: 80 },
    content: { flex: 1 },
    contentContainer: { padding: 20 },
    title: { fontSize: 32, fontWeight: '900', color: '#111827', marginBottom: 6 },
    subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 22 },
    form: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#E5E7EB' },
    label: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 8 },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 14, fontSize: 16, color: '#111827', marginBottom: 16 },
    segmentList: { gap: 8, marginBottom: 18 },
    segmentButton: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, padding: 13 },
    segmentButtonActive: { backgroundColor: '#111827', borderColor: '#111827' },
    segmentText: { color: '#374151', fontWeight: '700' },
    segmentTextActive: { color: '#FFFFFF' },
    emptyBox: { borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed', borderRadius: 12, padding: 18, marginBottom: 18 },
    emptyText: { color: '#6B7280', lineHeight: 20, marginBottom: 14 },
    secondaryButton: { borderWidth: 1, borderColor: '#111827', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
    secondaryButtonText: { color: '#111827', fontWeight: 'bold' },
    submitButton: { backgroundColor: '#3B82F6', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
    submitButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
});
