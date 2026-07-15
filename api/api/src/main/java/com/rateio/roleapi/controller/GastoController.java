package com.rateio.roleapi.controller;

import com.rateio.roleapi.model.Evento;
import com.rateio.roleapi.model.Gasto;
import com.rateio.roleapi.service.GastoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/gastos")
public class GastoController {

    private final GastoService service;

    public GastoController(GastoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Gasto> criar(@RequestBody Gasto gasto) {
        Gasto novoGasto = service.criar(gasto);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoGasto);
    }

}