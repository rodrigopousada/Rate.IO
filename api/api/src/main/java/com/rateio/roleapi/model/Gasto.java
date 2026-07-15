package com.rateio.roleapi.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "gastos")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Gasto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String descricao; // Ex: "Picanha", "Heineken"

    @Column(nullable = false)
    private BigDecimal valor;

    private String categoria; // Ex: "#Bebida", "#Churrasco"

    // Aqui vai ficar o link da foto da nota fiscal quando integrar o upload
    @Column(name = "comprovante_url")
    private String comprovanteUrl;

    // Controle de cancelamento da despesa
    @Column(nullable = false)
    private Boolean ativo = true;

    @ManyToOne
    @JoinColumn(name = "evento_id", nullable = false)
    private Evento evento;

    // Quem passou o cartão na hora
    @ManyToOne
    @JoinColumn(name = "pagador_id", nullable = false)
    private Usuario quemPagou;

    // lista de quem vai dividir essa conta específica
    @ManyToMany
    @JoinTable(
            name = "gasto_participantes",
            joinColumns = @JoinColumn(name = "gasto_id"),
            inverseJoinColumns = @JoinColumn(name = "usuario_id")
    )
    private List<Usuario> participantes;
}