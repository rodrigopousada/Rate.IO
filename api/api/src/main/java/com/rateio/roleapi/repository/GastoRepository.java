package com.rateio.roleapi.repository;

import com.rateio.roleapi.model.Gasto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GastoRepository extends JpaRepository<Gasto, Long> {
}