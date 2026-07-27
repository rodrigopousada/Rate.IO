import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';

interface GrupoResumo {
    id: number;
    nome: string;
}

interface Evento {
    id: number;
    nome: string;
    metaValor: number | null;
    arrecadado: number;
    dataEvento: string;
    ativo: boolean;
    grupo: GrupoResumo;
}

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
    membros: Usuario[];
}

interface Gasto {
    id: number;
    descricao: string;
    valor: number;
    categoria: string | null;
    eventoId: number;
    quemPagou: Usuario;
    participantes: Usuario[];
}

type Saldos = Record<number, { usuario: Usuario; pago: number; deve: number; saldo: number }>;

export default function EventoDetalhe() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [usuarioId, setUsuarioId] = useState<number | null>(null);
    const [evento, setEvento] = useState<Evento | null>(null);
    const [grupo, setGrupo] = useState<Grupo | null>(null);
    const [gastos, setGastos] = useState<Gasto[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [salvandoGasto, setSalvandoGasto] = useState(false);
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [categoria, setCategoria] = useState('');
    const [pagadorId, setPagadorId] = useState<number | null>(null);
    const [participantesIds, setParticipantesIds] = useState<number[]>([]);

    const carregar = useCallback(async () => {
        if (!id) {
            return;
        }

        try {
            const usuarioIdSalvo = await AsyncStorage.getItem('usuarioId');
            if (usuarioIdSalvo) {
                setUsuarioId(Number(usuarioIdSalvo));
            }

            const eventoResposta = await fetch(`${API_BASE_URL}/eventos/${id}`);
            if (!eventoResposta.ok) {
                throw new Error('Nao foi possivel carregar o evento');
            }

            const eventoDados = (await eventoResposta.json()) as Evento;
            setEvento(eventoDados);

            const [grupoResposta, gastosResposta] = await Promise.all([
                fetch(`${API_BASE_URL}/grupos/${eventoDados.grupo.id}`),
                fetch(`${API_BASE_URL}/gastos/evento/${eventoDados.id}`),
            ]);

            if (!grupoResposta.ok || !gastosResposta.ok) {
                throw new Error('Nao foi possivel carregar detalhes');
            }

            const grupoDados = (await grupoResposta.json()) as Grupo;
            const gastosDados = (await gastosResposta.json()) as Gasto[];

            setGrupo(grupoDados);
            setGastos(gastosDados);
            setPagadorId((atual) => atual ?? (usuarioIdSalvo ? Number(usuarioIdSalvo) : grupoDados.membros[0]?.id ?? null));
            setParticipantesIds((atuais) => atuais.length > 0 ? atuais : grupoDados.membros.map((membro) => membro.id));
        } catch (erro) {
            console.error('Erro ao carregar evento:', erro);
            Alert.alert('Erro', 'Nao foi possivel carregar esse role.');
        } finally {
            setCarregando(false);
        }
    }, [id]);

    useEffect(() => {
        carregar();
    }, [carregar]);

    const totalGastos = useMemo(() => gastos.reduce((total, gasto) => total + Number(gasto.valor || 0), 0), [gastos]);

    const saldos = useMemo(() => {
        const mapa: Saldos = {};

        grupo?.membros.forEach((membro) => {
            mapa[membro.id] = { usuario: membro, pago: 0, deve: 0, saldo: 0 };
        });

        gastos.forEach((gasto) => {
            if (!mapa[gasto.quemPagou.id]) {
                mapa[gasto.quemPagou.id] = { usuario: gasto.quemPagou, pago: 0, deve: 0, saldo: 0 };
            }

            mapa[gasto.quemPagou.id].pago += Number(gasto.valor || 0);

            const participantes = gasto.participantes.length > 0 ? gasto.participantes : grupo?.membros ?? [];
            const parte = participantes.length > 0 ? Number(gasto.valor || 0) / participantes.length : 0;

            participantes.forEach((participante) => {
                if (!mapa[participante.id]) {
                    mapa[participante.id] = { usuario: participante, pago: 0, deve: 0, saldo: 0 };
                }
                mapa[participante.id].deve += parte;
            });
        });

        Object.values(mapa).forEach((linha) => {
            linha.saldo = linha.pago - linha.deve;
        });

        return Object.values(mapa);
    }, [gastos, grupo]);

    const progresso = Math.min(evento?.metaValor ? (totalGastos / evento.metaValor) * 100 : 0, 100);

    const alternarParticipante = (idParticipante: number) => {
        setParticipantesIds((atuais) => {
            if (atuais.includes(idParticipante)) {
                return atuais.filter((item) => item !== idParticipante);
            }
            return [...atuais, idParticipante];
        });
    };

    const criarGasto = async () => {
        if (!evento || !pagadorId || !descricao.trim() || !valor.trim() || participantesIds.length === 0) {
            Alert.alert('Aviso', 'Preencha descricao, valor, pagador e participantes.');
            return;
        }

        setSalvandoGasto(true);

        try {
            const resposta = await fetch(`${API_BASE_URL}/gastos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    descricao: descricao.trim(),
                    valor: Number(valor.replace(',', '.')),
                    categoria: categoria.trim() || null,
                    comprovanteUrl: null,
                    eventoId: evento.id,
                    pagadorId,
                    participantesIds,
                }),
            });

            if (!resposta.ok) {
                throw new Error('Nao foi possivel criar gasto');
            }

            setDescricao('');
            setValor('');
            setCategoria('');
            await carregar();
        } catch (erro) {
            console.error('Erro ao criar gasto:', erro);
            Alert.alert('Erro', 'Nao foi possivel adicionar esse gasto.');
        } finally {
            setSalvandoGasto(false);
        }
    };

    if (carregando) {
        return (
            <View style={styles.loadingContainer}>
                <Stack.Screen options={{ title: 'Role' }} />
                <ActivityIndicator color="#3B82F6" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Stack.Screen options={{ title: evento?.nome || 'Role', headerShadowVisible: false }} />

            <View style={styles.headerBlock}>
                <Text style={styles.groupName}>{grupo?.nome}</Text>
                <Text style={styles.title}>{evento?.nome}</Text>
                <Text style={styles.date}>{evento?.dataEvento}</Text>
            </View>

            <View style={styles.summaryRow}>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabel}>Gastos</Text>
                    <Text style={styles.summaryValue}>R$ {totalGastos.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabel}>Meta</Text>
                    <Text style={styles.summaryValue}>R$ {(evento?.metaValor || 0).toFixed(2)}</Text>
                </View>
            </View>

            <View style={styles.progressBackground}>
                <View style={[styles.progressFill, { width: `${progresso}%` }]} />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Adicionar gasto</Text>
                <TextInput style={styles.input} placeholder="Descricao" placeholderTextColor="#9CA3AF" value={descricao} onChangeText={setDescricao} />
                <View style={styles.inputRow}>
                    <TextInput style={[styles.input, styles.inputHalf]} placeholder="Valor" placeholderTextColor="#9CA3AF" keyboardType="decimal-pad" value={valor} onChangeText={setValor} />
                    <TextInput style={[styles.input, styles.inputHalf]} placeholder="Categoria" placeholderTextColor="#9CA3AF" value={categoria} onChangeText={setCategoria} />
                </View>

                <Text style={styles.label}>Quem pagou</Text>
                <View style={styles.chipWrap}>
                    {grupo?.membros.map((membro) => (
                        <TouchableOpacity key={membro.id} style={[styles.chip, pagadorId === membro.id && styles.chipActive]} onPress={() => setPagadorId(membro.id)}>
                            <Text style={[styles.chipText, pagadorId === membro.id && styles.chipTextActive]}>{membro.nome}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Quem participa</Text>
                <View style={styles.chipWrap}>
                    {grupo?.membros.map((membro) => {
                        const selecionado = participantesIds.includes(membro.id);
                        return (
                            <TouchableOpacity key={membro.id} style={[styles.chip, selecionado && styles.chipActive]} onPress={() => alternarParticipante(membro.id)}>
                                <Text style={[styles.chipText, selecionado && styles.chipTextActive]}>{membro.nome}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <TouchableOpacity style={styles.primaryButton} onPress={criarGasto} disabled={salvandoGasto}>
                    {salvandoGasto ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Adicionar gasto</Text>}
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Rateio</Text>
                {saldos.map((linha) => (
                    <View key={linha.usuario.id} style={styles.balanceRow}>
                        <View>
                            <Text style={styles.balanceName}>{linha.usuario.nome}{usuarioId === linha.usuario.id ? ' (voce)' : ''}</Text>
                            <Text style={styles.balanceMeta}>Pagou R$ {linha.pago.toFixed(2)} | Deve R$ {linha.deve.toFixed(2)}</Text>
                        </View>
                        <Text style={[styles.balanceValue, linha.saldo >= 0 ? styles.balancePositive : styles.balanceNegative]}>
                            {linha.saldo >= 0 ? '+' : '-'}R$ {Math.abs(linha.saldo).toFixed(2)}
                        </Text>
                    </View>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Gastos</Text>
                {gastos.length === 0 ? (
                    <Text style={styles.emptyText}>Nenhum gasto lancado ainda.</Text>
                ) : (
                    gastos.map((gasto) => (
                        <View key={gasto.id} style={styles.expenseCard}>
                            <Text style={styles.expenseTitle}>{gasto.descricao}</Text>
                            <Text style={styles.expenseMeta}>{gasto.categoria || 'Sem categoria'} | pago por {gasto.quemPagou.nome}</Text>
                            <Text style={styles.expenseValue}>R$ {Number(gasto.valor).toFixed(2)}</Text>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F7FA' },
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    content: { padding: 20, paddingBottom: 40 },
    headerBlock: { marginBottom: 18 },
    groupName: { fontSize: 14, color: '#6B7280', fontWeight: '700', marginBottom: 4 },
    title: { fontSize: 30, fontWeight: '900', color: '#111827' },
    date: { fontSize: 14, color: '#6B7280', marginTop: 4 },
    summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    summaryBox: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
    summaryLabel: { color: '#6B7280', fontSize: 13, fontWeight: '700', marginBottom: 4 },
    summaryValue: { color: '#111827', fontSize: 20, fontWeight: '900' },
    progressBackground: { height: 10, backgroundColor: '#E5E7EB', borderRadius: 10, overflow: 'hidden', marginBottom: 22 },
    progressFill: { height: '100%', backgroundColor: '#3B82F6' },
    section: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 18, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '900', color: '#111827', marginBottom: 14 },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, color: '#111827', fontSize: 15, marginBottom: 12 },
    inputRow: { flexDirection: 'row', gap: 10 },
    inputHalf: { flex: 1 },
    label: { fontSize: 13, fontWeight: '800', color: '#374151', marginBottom: 8, marginTop: 4 },
    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    chip: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
    chipActive: { backgroundColor: '#111827', borderColor: '#111827' },
    chipText: { color: '#374151', fontWeight: '700', fontSize: 13 },
    chipTextActive: { color: '#FFFFFF' },
    primaryButton: { backgroundColor: '#3B82F6', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
    primaryButtonText: { color: '#FFFFFF', fontWeight: '900', fontSize: 15 },
    balanceRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    balanceName: { color: '#111827', fontWeight: '800', fontSize: 15 },
    balanceMeta: { color: '#6B7280', fontSize: 12, marginTop: 3 },
    balanceValue: { fontSize: 15, fontWeight: '900' },
    balancePositive: { color: '#10B981' },
    balanceNegative: { color: '#EF4444' },
    expenseCard: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14, marginBottom: 10 },
    expenseTitle: { color: '#111827', fontWeight: '900', fontSize: 15, marginBottom: 3 },
    expenseMeta: { color: '#6B7280', fontSize: 12 },
    expenseValue: { color: '#111827', fontWeight: '900', fontSize: 18, marginTop: 8 },
    emptyText: { color: '#6B7280', lineHeight: 20 },
});
