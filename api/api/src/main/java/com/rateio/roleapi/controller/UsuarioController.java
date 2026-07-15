package com.rateio.roleapi.controller;

import com.rateio.roleapi.model.Usuario;
import com.rateio.roleapi.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Usuario> criar(@RequestBody Usuario usuario) {
        Usuario novoUsuario = service.cadastrar(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoUsuario);
    }
}