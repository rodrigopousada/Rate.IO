package com.rateio.roleapi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "usuarios")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Usuario {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(nullable = false)
        private String nome;

        @Column(nullable = false, unique = true)
        private String email;
        @JsonIgnore
        @Column(nullable = false)
        private String senha;

        @JsonIgnore
        @ManyToMany(mappedBy = "membros")
        private List<Grupo> grupos;

    }

