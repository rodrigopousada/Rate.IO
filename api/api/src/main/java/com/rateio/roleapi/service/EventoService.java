package com.rateio.roleapi.service;

import com.rateio.roleapi.dto.CriarEventoRequest;
import com.rateio.roleapi.dto.EventoResponse;
import com.rateio.roleapi.model.Evento;
import com.rateio.roleapi.model.Grupo;
import com.rateio.roleapi.repository.EventoRepository;
import com.rateio.roleapi.repository.GastoRepository;
import com.rateio.roleapi.repository.GrupoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class EventoService {

    private final EventoRepository repository;
    private final GrupoRepository grupoRepository;
    private final GastoRepository gastoRepository;

    public EventoService(EventoRepository repository, GrupoRepository grupoRepository, GastoRepository gastoRepository) {
        this.repository = repository;
        this.grupoRepository = grupoRepository;
        this.gastoRepository = gastoRepository;
    }

    public Evento criar(CriarEventoRequest request) {
        Grupo grupo = grupoRepository.findById(request.grupoId())
                .orElseThrow(() -> new IllegalArgumentException("Grupo nao encontrado"));

        Evento evento = new Evento();
        evento.setNome(request.nome());
        evento.setMetaValor(request.metaValor());
        evento.setDataEvento(request.dataEvento());
        evento.setGrupo(grupo);
        evento.setAtivo(true);

        return repository.save(evento);
    }

    public Evento buscarPorId(Long eventoId) {
        return repository.findById(eventoId)
                .orElseThrow(() -> new IllegalArgumentException("Evento nao encontrado"));
    }

    public List<Evento> listarTodos() {
        return repository.findAll();
    }

    public List<Evento> buscarEventosDoUsuario(Long usuarioId) {
        return repository.findEventosDoUsuario(usuarioId);
    }

    public List<Evento> buscarEventosDoGrupo(Long grupoId) {
        return repository.findByGrupoIdOrderByDataEventoAsc(grupoId);
    }

    public EventoResponse toResponse(Evento evento) {
        BigDecimal arrecadado = gastoRepository.somarValorAtivoPorEvento(evento.getId());
        return EventoResponse.from(evento, arrecadado);
    }
}
