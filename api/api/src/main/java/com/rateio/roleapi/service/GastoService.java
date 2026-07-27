package com.rateio.roleapi.service;

import com.rateio.roleapi.dto.CriarGastoRequest;
import com.rateio.roleapi.model.Evento;
import com.rateio.roleapi.model.Gasto;
import com.rateio.roleapi.model.Usuario;
import com.rateio.roleapi.repository.EventoRepository;
import com.rateio.roleapi.repository.GastoRepository;
import com.rateio.roleapi.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GastoService {

    private final GastoRepository repository;
    private final EventoRepository eventoRepository;
    private final UsuarioRepository usuarioRepository;

    public GastoService(GastoRepository repository, EventoRepository eventoRepository, UsuarioRepository usuarioRepository) {
        this.repository = repository;
        this.eventoRepository = eventoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public Gasto criar(CriarGastoRequest request) {
        Evento evento = eventoRepository.findById(request.eventoId())
                .orElseThrow(() -> new IllegalArgumentException("Evento nao encontrado"));
        Usuario pagador = usuarioRepository.findById(request.pagadorId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario pagador nao encontrado"));
        List<Long> participantesIds = request.participantesIds() == null ? List.of() : request.participantesIds();

        Gasto gasto = new Gasto();
        gasto.setDescricao(request.descricao());
        gasto.setValor(request.valor());
        gasto.setCategoria(request.categoria());
        gasto.setComprovanteUrl(request.comprovanteUrl());
        gasto.setEvento(evento);
        gasto.setQuemPagou(pagador);
        gasto.setParticipantes(usuarioRepository.findAllById(participantesIds));
        gasto.setAtivo(true);

        return repository.save(gasto);
    }

    public List<Gasto> listarPorEvento(Long eventoId) {
        return repository.findByEventoIdAndAtivoTrueOrderByIdDesc(eventoId);
    }
}
