import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';

interface GrupoResponse {
    id: number;
    nome: string;
    conviteCodigo: string | null;
    conviteLink: string | null;
}

export default function CriarClube() {
    const router = useRouter();

    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [entradaComAprovacao, setEntradaComAprovacao] = useState(true);
    const [carregando, setCarregando] = useState(false);

    const criarNovoClube = async () => {
        if (!nome.trim()) {
            Alert.alert('Aviso', 'O nome do clube e obrigatorio.');
            return;
        }

        setCarregando(true);

        try {
            const usuarioId = await AsyncStorage.getItem('usuarioId');

            if (!usuarioId) {
                router.replace('/login' as any);
                return;
            }

            const resposta = await fetch(`${API_BASE_URL}/grupos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nome: nome.trim(),
                    criadorId: Number(usuarioId),
                    entradaComAprovacao,
                    membrosIds: [],
                }),
            });

            if (!resposta.ok) {
                throw new Error('Falha ao criar clube no servidor.');
            }

            const clube = (await resposta.json()) as GrupoResponse;
            Alert.alert(
                'Clube criado',
                `Codigo de convite: ${clube.conviteCodigo || 'indisponivel'}\n${clube.conviteLink || ''}`,
                [{ text: 'OK', onPress: () => router.replace('/clubes' as any) }]
            );
        } catch (erro) {
            console.error('Erro ao criar clube:', erro);
            Alert.alert('Erro', 'Nao foi possivel criar o clube. Verifique a conexao.');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <Stack.Screen
                options={{
                    title: 'Novo Clube',
                    headerStyle: { backgroundColor: '#F5F7FA' },
                    headerShadowVisible: false,
                    headerTintColor: '#111827',
                }}
            />

            <View style={styles.content}>
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Crie um novo clube</Text>
                    <Text style={styles.subtitle}>Junte a galera para dividir os proximos roles.</Text>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.label}>Nome do Clube</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: Resenha de Sexta"
                        placeholderTextColor="#9CA3AF"
                        value={nome}
                        onChangeText={setNome}
                    />

                    <Text style={styles.label}>Descricao (opcional)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Qual o objetivo desse grupo?"
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={4}
                        value={descricao}
                        onChangeText={setDescricao}
                    />

                    <TouchableOpacity
                        style={[styles.toggleRow, entradaComAprovacao && styles.toggleRowActive]}
                        onPress={() => setEntradaComAprovacao((atual) => !atual)}
                    >
                        <View style={[styles.toggleDot, entradaComAprovacao && styles.toggleDotActive]} />
                        <View style={styles.toggleTextBlock}>
                            <Text style={styles.toggleTitle}>Entrada com aprovacao</Text>
                            <Text style={styles.toggleText}>Novos membros precisam ser aceitos pelo admin do clube.</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={criarNovoClube}
                        disabled={carregando}
                    >
                        {carregando ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.submitButtonText}>Criar Clube</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    content: { flex: 1, padding: 20 },
    headerContainer: { marginBottom: 30, marginTop: 10 },
    title: { fontSize: 28, fontWeight: '900', color: '#111827', marginBottom: 5 },
    subtitle: { fontSize: 16, color: '#6B7280' },
    formContainer: { backgroundColor: '#FFFFFF', padding: 25, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5 },
    label: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 8 },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 15, fontSize: 16, color: '#111827', marginBottom: 20 },
    textArea: { height: 100, textAlignVertical: 'top' },
    toggleRow: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 18 },
    toggleRowActive: { borderColor: '#111827', backgroundColor: '#F9FAFB' },
    toggleDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#9CA3AF' },
    toggleDotActive: { backgroundColor: '#111827', borderColor: '#111827' },
    toggleTextBlock: { flex: 1 },
    toggleTitle: { color: '#111827', fontWeight: '800', marginBottom: 2 },
    toggleText: { color: '#6B7280', fontSize: 12, lineHeight: 17 },
    submitButton: { backgroundColor: '#3B82F6', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    submitButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
});
