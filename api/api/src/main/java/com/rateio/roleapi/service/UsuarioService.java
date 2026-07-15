package com.rateio.roleapi.service;

import com.rateio.roleapi.model.Usuario;
import com.rateio.roleapi.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;

    public UsuarioService(UsuarioRepository repository) {
        this.repository = repository;
    }

    public Usuario cadastrar(Usuario usuario) {
        return repository.save(usuario);
    }
}