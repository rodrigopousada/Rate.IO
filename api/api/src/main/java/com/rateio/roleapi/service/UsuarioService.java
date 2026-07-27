package com.rateio.roleapi.service;

import com.rateio.roleapi.dto.CadastroUsuarioRequest;
import com.rateio.roleapi.dto.LoginRequest;
import com.rateio.roleapi.model.Usuario;
import com.rateio.roleapi.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public Usuario cadastrar(CadastroUsuarioRequest request) {
        Usuario usuario = new Usuario();
        usuario.setNome(request.nome());
        usuario.setEmail(request.email());
        usuario.setSenha(passwordEncoder.encode(request.senha()));
        return repository.save(usuario);
    }

    public Optional<Usuario> login(LoginRequest request) {
        return repository.findByEmail(request.email())
                .filter(usuario -> passwordEncoder.matches(request.senha(), usuario.getSenha()));
    }
}
