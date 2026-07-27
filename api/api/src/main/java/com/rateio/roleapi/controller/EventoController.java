package com.rateio.roleapi.controller;

import com.rateio.roleapi.dto.CriarEventoRequest;
import com.rateio.roleapi.dto.EventoResponse;
import com.rateio.roleapi.model.Evento;
import com.rateio.roleapi.service.EventoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = "${app.cors.allowed-origins:*}")
@RestController
@RequestMapping("/eventos")
public class EventoController {

    private final EventoService service;

    public EventoController(EventoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<EventoResponse> criar(@Valid @RequestBody CriarEventoRequest request) {
        Evento novoEvento = service.criar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(service.toResponse(novoEvento));
    }

    @GetMapping("/{eventoId}")
    public ResponseEntity<EventoResponse> buscarPorId(@PathVariable Long eventoId) {
        return ResponseEntity.ok(service.toResponse(service.buscarPorId(eventoId)));
    }

    @GetMapping
    public ResponseEntity<List<EventoResponse>> listar() {
        List<EventoResponse> lista = service.listarTodos().stream()
                .map(service::toResponse)
                .toList();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<EventoResponse>> getEventosDoUsuario(@PathVariable Long usuarioId) {
        List<EventoResponse> eventos = service.buscarEventosDoUsuario(usuarioId).stream()
                .map(service::toResponse)
                .toList();
        return ResponseEntity.ok(eventos);
    }

    @GetMapping("/grupo/{grupoId}")
    public ResponseEntity<List<EventoResponse>> getEventosDoGrupo(@PathVariable Long grupoId) {
        List<EventoResponse> eventos = service.buscarEventosDoGrupo(grupoId).stream()
                .map(service::toResponse)
                .toList();
        return ResponseEntity.ok(eventos);
    }
}
