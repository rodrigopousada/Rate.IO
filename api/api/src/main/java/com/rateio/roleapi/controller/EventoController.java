package com.rateio.roleapi.controller;

import com.rateio.roleapi.model.Evento;
import com.rateio.roleapi.service.EventoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/eventos")
public class EventoController {

    private final EventoService service;

    public EventoController(EventoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Evento> criar(@RequestBody Evento evento) {
        Evento novoEvento = service.criar(evento);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoEvento);
    }

    @GetMapping
    public ResponseEntity<List<Evento>> listar() {
        List<Evento> lista = service.listarTodos();
        return ResponseEntity.ok(lista);
    }
}