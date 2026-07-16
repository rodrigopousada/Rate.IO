import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';

export default function Login() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');

    const fazerLogin = () => {
        // Validação básica
        if (!email || !senha) {
            setErro('Preencha e-mail e senha para entrar.');
            return;
        }

        setCarregando(true);
        setErro('');

        // Bate lá no nosso endpoint novo do Java
        fetch('http://10.0.0.142:8080/usuarios/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                senha: senha
            })
        })
            .then(resposta => {
                if (resposta.ok) {
                    return resposta.json();
                } else {
                    throw new Error('Credenciais inválidas');
                }
            })
            .then(dadosUsuario => {
                setCarregando(false);
                // MÁGICA AQUI: Se deu bom, joga o cara pra Home!
                // (No futuro vamos guardar o ID desse usuário na memória do celular aqui)
                router.replace('/');
            })
            .catch(error => {
                console.error("Erro no login:", error);
                setCarregando(false);
                setErro('E-mail ou senha incorretos. Tente novamente.');
            });
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.content}>

                {/* LOGO */}
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>rate.io</Text>
                    <Text style={styles.subLogoText}>O seu rateio inteligente</Text>
                </View>

                {/* FORMULÁRIO */}
                <View style={styles.formContainer}>

                    {erro ? <Text style={styles.errorText}>{erro}</Text> : null}

                    <TextInput
                        style={styles.input}
                        placeholder="E-mail"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Senha"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry
                        value={senha}
                        onChangeText={setSenha}
                    />

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={fazerLogin}
                        disabled={carregando}
                    >
                        {carregando ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.loginButtonText}>Entrar</Text>
                        )}
                    </TouchableOpacity>

                </View>

                {/* RODAPÉ */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Não tem uma conta? </Text>
                    <TouchableOpacity>
                        <Text style={styles.footerLink}>Cadastre-se</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    content: { flex: 1, justifyContent: 'center', padding: 20 },

    logoContainer: { alignItems: 'center', marginBottom: 50 },
    logoText: { fontSize: 48, fontWeight: '900', color: '#111827', letterSpacing: -1 },
    subLogoText: { fontSize: 16, color: '#6B7280', marginTop: 5 },

    formContainer: { backgroundColor: '#FFFFFF', padding: 25, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5 },

    errorText: { color: '#EF4444', marginBottom: 15, textAlign: 'center', fontWeight: '500' },

    input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 15, fontSize: 16, color: '#111827', marginBottom: 15 },

    loginButton: { backgroundColor: '#111827', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    loginButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },

    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
    footerText: { color: '#6B7280', fontSize: 14 },
    footerLink: { color: '#3B82F6', fontSize: 14, fontWeight: 'bold' }
});