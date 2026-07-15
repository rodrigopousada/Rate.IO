package com.rateio.roleapi.controller;

import com.rateio.roleapi.model.Grupo;
import com.rateio.roleapi.service.GrupoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/grupos")
public class GrupoController {

    private final GrupoService service;

    public GrupoController(GrupoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Grupo> criar(@RequestBody Grupo grupo) {
        Grupo novoGrupo = service.criar(grupo);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoGrupo);
    }
}