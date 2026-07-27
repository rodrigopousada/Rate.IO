package com.rateio.roleapi.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "grupos")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Grupo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(name = "convite_codigo", unique = true)
    private String conviteCodigo;

    @Column(name = "entrada_com_aprovacao", nullable = false)
    private Boolean entradaComAprovacao = true;

    @ManyToOne
    @JoinColumn(name = "administrador_id")
    private Usuario administrador;

    @ManyToMany
    @JoinTable(
            name = "grupo_usuario",
            joinColumns = @JoinColumn(name = "grupo_id"),
            inverseJoinColumns = @JoinColumn(name = "usuario_id")
    )
    private List<Usuario> membros;
}
