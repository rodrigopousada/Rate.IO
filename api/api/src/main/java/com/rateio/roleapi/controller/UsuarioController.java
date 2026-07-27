package com.rateio.roleapi.controller;

import com.rateio.roleapi.dto.CadastroUsuarioRequest;
import com.rateio.roleapi.dto.LoginRequest;
import com.rateio.roleapi.dto.LoginResponse;
import com.rateio.roleapi.dto.UsuarioResponse;
import com.rateio.roleapi.model.Usuario;
import com.rateio.roleapi.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "${app.cors.allowed-origins:*}")
@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> cadastrar(@Valid @RequestBody CadastroUsuarioRequest request) {
        Usuario usuario = service.cadastrar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(UsuarioResponse.from(usuario));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return service.login(request)
                .map(usuario -> ResponseEntity.ok(new LoginResponse(UsuarioResponse.from(usuario))))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }
}
