import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';

interface UsuarioResponse {
    id: number;
    nome: string;
    email: string;
}

export default function Cadastro() {
    const router = useRouter();
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [carregando, setCarregando] = useState(false);

    const cadastrar = async () => {
        if (!nome.trim() || !email.trim() || !senha.trim()) {
            Alert.alert('Aviso', 'Preencha nome, e-mail e senha.');
            return;
        }

        setCarregando(true);

        try {
            const resposta = await fetch(`${API_BASE_URL}/usuarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: nome.trim(),
                    email: email.trim(),
                    senha,
                }),
            });

            if (!resposta.ok) {
                throw new Error('Nao foi possivel cadastrar');
            }

            const usuario = (await resposta.json()) as UsuarioResponse;
            await AsyncStorage.setItem('usuarioId', String(usuario.id));
            await AsyncStorage.setItem('usuarioNome', usuario.nome);
            await AsyncStorage.setItem('usuarioEmail', usuario.email);
            router.replace('/' as any);
        } catch (erro) {
            console.error('Erro ao cadastrar:', erro);
            Alert.alert('Erro', 'Nao foi possivel criar sua conta.');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <Stack.Screen options={{ title: 'Cadastro', headerShadowVisible: false }} />
            <View style={styles.content}>
                <Text style={styles.title}>Criar conta</Text>
                <Text style={styles.subtitle}>Entre no rate.io e organize o proximo role.</Text>

                <View style={styles.form}>
                    <TextInput style={styles.input} placeholder="Nome" placeholderTextColor="#9CA3AF" value={nome} onChangeText={setNome} />
                    <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor="#9CA3AF" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
                    <TextInput style={styles.input} placeholder="Senha" placeholderTextColor="#9CA3AF" secureTextEntry value={senha} onChangeText={setSenha} />

                    <TouchableOpacity style={styles.button} onPress={cadastrar} disabled={carregando}>
                        {carregando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Criar conta</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    content: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 34, fontWeight: '900', color: '#111827', marginBottom: 6 },
    subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 28 },
    form: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 22, borderWidth: 1, borderColor: '#E5E7EB' },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 15, fontSize: 16, color: '#111827', marginBottom: 14 },
    button: { backgroundColor: '#111827', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 6 },
    buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
});
