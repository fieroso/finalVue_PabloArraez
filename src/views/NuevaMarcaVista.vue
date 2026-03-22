<script setup>
import { ref } from 'vue'
import { URL_BASE } from '../configuracion.js'

const nombre = ref('')
const anioFundacion = ref('')
const origen = ref('')
const mensajeExito = ref('')
const mensajeError = ref('')

const limpiarMensajes = () => {
  mensajeExito.value = ''
  mensajeError.value = ''
}

const limpiarFormulario = () => {
  nombre.value = ''
  anioFundacion.value = ''
  origen.value = ''
}

const guardarMarca = () => {
  limpiarMensajes()

  if (!nombre.value.trim() || !anioFundacion.value || !origen.value.trim()) {
    mensajeError.value = 'Rellena todos los campos'
    return
  }

  const nuevaMarca = {
    nombre: nombre.value.trim(),
    origen: origen.value.trim(),
    anioFundacion: Number(anioFundacion.value)
  }

  fetch(`${URL_BASE}/marcas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevaMarca)
  })
    .then(respuesta => {
      if (respuesta.ok) {
        return respuesta.json()
      } else {
        throw new Error('Error al guardar la marca')
      }
    })
    .then(marcaCreada => {
      mensajeExito.value = `Marca "${marcaCreada.nombre}" creada correctamente`
      limpiarFormulario()
    })
    .catch(error => {
      mensajeError.value = error.message
    })
}
</script>

<template>
  <div>
    <h1>Nueva Marca</h1>

    <div v-if="mensajeExito" class="mensaje-exito">{{ mensajeExito }}</div>
    <div v-if="mensajeError" class="mensaje-error">{{ mensajeError }}</div>

    <form @submit.prevent="guardarMarca">
      <div class="grupo-formulario">
        <label for="nombre">Nombre</label>
        <input id="nombre" type="text" v-model="nombre" />
      </div>

      <div class="grupo-formulario">
        <label for="anioFundacion">Año de fundación</label>
        <input id="anioFundacion" type="number" v-model="anioFundacion" />
      </div>

      <div class="grupo-formulario">
        <label for="origen">País de origen</label>
        <input id="origen" type="text" v-model="origen" />
      </div>

      <button type="submit" class="boton-primario">Guardar Marca</button>
    </form>
  </div>
</template>

<style scoped>
form {
  max-width: 450px;
}
</style>
