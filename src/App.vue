<script setup>
import MenuLateral from './components/MenuLateral.vue'
</script>

<template>
  <div class="contenedor-principal">
    <MenuLateral />
    <main class="contenido-principal">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.contenedor-principal {
  display: flex;
  min-height: 100vh;
}

.contenido-principal {
  flex: 1;
  padding: 30px;
}
</style>
