import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';

export default function Clubes() {
    const router = useRouter();

    // Caixinha para guardar o que o usuário digitar na barra de pesquisa
    const [busca, setBusca] = useState('');

    return (
        <View style={styles.container}>

            {/* ESCONDE O CABEÇALHO DO EXPO */}
            <Stack.Screen options={{ headerShown: false }} />

            {/* NOSSO CABEÇALHO */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.headerIcon}>←</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.replace('/')}>
                    <Text style={styles.headerTitle}>rate.io</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Text style={styles.headerIcon}>👤</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>

                {/* SESSÃO 1: BUSCAR CLUBE */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Entrar em um Clube</Text>
                    <View style={styles.searchRow}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nome ou ID do clube..."
                            placeholderTextColor="#9CA3AF"
                            value={busca}
                            onChangeText={setBusca}
                        />
                        <TouchableOpacity style={styles.searchButton}>
                            <Text style={styles.searchButtonText}>Buscar</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* SESSÃO 2: CRIAR NOVO */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.createButton}>
                        <Text style={styles.createButtonText}>+ Criar Novo Clube</Text>
                    </TouchableOpacity>
                </View>

                {/* SESSÃO 3: MEUS CLUBES (Onde no futuro vai ter a lista) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Clubes que participo</Text>

                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>Você ainda não participa de nenhum clube.</Text>
                        <Text style={styles.emptyStateSubText}>Busque um clube acima ou crie o seu próprio para começar a ratear!</Text>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA', paddingTop: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#E5E7EB' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
    headerIcon: { fontSize: 24 },
    content: { flex: 1, padding: 20 },

    section: { marginBottom: 30 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 15 },

    searchRow: { flexDirection: 'row', gap: 10 },
    input: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 15, fontSize: 16, color: '#111827' },
    searchButton: { backgroundColor: '#3B82F6', paddingHorizontal: 20, justifyContent: 'center', borderRadius: 12 },
    searchButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },

    createButton: { backgroundColor: '#111827', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    createButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },

    emptyState: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed' },
    emptyStateText: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginBottom: 5, textAlign: 'center' },
    emptyStateSubText: { fontSize: 14, color: '#6B7280', textAlign: 'center' }
});