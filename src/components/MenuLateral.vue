<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <nav class="menu-lateral">
    <h2 class="menu-titulo">Renting Vehículos</h2>
    <ul class="menu-lista">
      <li><RouterLink to="/">Inicio</RouterLink></li>
      <li><RouterLink to="/marcas">Marcas</RouterLink></li>
      <li><RouterLink to="/nueva-marca">Nueva Marca</RouterLink></li>
      <li><RouterLink to="/modelos">Modelos</RouterLink></li>
      <li><RouterLink to="/nuevo-modelo">Nuevo Modelo</RouterLink></li>
      <li><RouterLink to="/vehiculos">Vehículos</RouterLink></li>
      <li><RouterLink to="/nuevo-vehiculo">Nuevo Vehículo</RouterLink></li>
      <li><RouterLink to="/alquiler">Alquiler</RouterLink></li>
      <li><RouterLink to="/clientes">Clientes</RouterLink></li>
    </ul>
  </nav>
</template>

<style scoped>
.menu-lateral {
  width: 220px;
  min-height: 100vh;
  background-color: #1a2a3a;
  padding: 20px 0;
  flex-shrink: 0;
}

.menu-titulo {
  color: #ffffff;
  text-align: center;
  padding: 0 15px 20px;
  border-bottom: 1px solid #2c3e50;
  font-size: 1.2rem;
}

.menu-lista {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-lista li {
  border-bottom: 1px solid #2c3e50;
}

.menu-lista li a {
  display: block;
  padding: 12px 20px;
  color: #bdc3c7;
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s;
}

.menu-lista li a:hover {
  background-color: #2c3e50;
  color: #ffffff;
}

.menu-lista li a.router-link-active {
  background-color: #2980b9;
  color: #ffffff;
}
</style>
