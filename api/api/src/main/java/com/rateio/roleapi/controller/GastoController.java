package com.rateio.roleapi.controller;

import com.rateio.roleapi.dto.CriarGastoRequest;
import com.rateio.roleapi.dto.GastoResponse;
import com.rateio.roleapi.model.Gasto;
import com.rateio.roleapi.service.GastoService;
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
@RequestMapping("/gastos")
public class GastoController {

    private final GastoService service;

    public GastoController(GastoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<GastoResponse> criar(@Valid @RequestBody CriarGastoRequest request) {
        Gasto novoGasto = service.criar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(GastoResponse.from(novoGasto));
    }

    @GetMapping("/evento/{eventoId}")
    public ResponseEntity<List<GastoResponse>> listarPorEvento(@PathVariable Long eventoId) {
        List<GastoResponse> gastos = service.listarPorEvento(eventoId).stream()
                .map(GastoResponse::from)
                .toList();
        return ResponseEntity.ok(gastos);
    }
}
