<script setup>
import { ref, onMounted } from 'vue'
import { URL_BASE } from '../configuracion.js'

const listaMarcas = ref([])
const idMarcaSeleccionada = ref('')
const nombreModelo = ref('')
const extraPorModelo = ref('')
const mensajeExito = ref('')
const mensajeError = ref('')

const cargarMarcas = () => {
  fetch(`${URL_BASE}/marcas`)
    .then(respuesta => {
      if (respuesta.ok) {
        return respuesta.json()
      } else {
        throw new Error('Error al cargar las marcas')
      }
    })
    .then(marcas => {
      listaMarcas.value = marcas
    })
    .catch(error => {
      mensajeError.value = error.message
    })
}

const limpiarMensajes = () => {
  mensajeExito.value = ''
  mensajeError.value = ''
}

const limpiarFormulario = () => {
  idMarcaSeleccionada.value = ''
  nombreModelo.value = ''
  extraPorModelo.value = ''
}

const guardarModelo = () => {
  limpiarMensajes()

  if (!idMarcaSeleccionada.value || !nombreModelo.value.trim()) {
    mensajeError.value = 'La marca y el nombre del modelo son obligatorios'
    return
  }

  const nuevoModelo = {
    idMarca: idMarcaSeleccionada.value,
    modelo: nombreModelo.value.trim(),
    extraPorModelo: extraPorModelo.value ? Number(extraPorModelo.value) : 0
  }

  fetch(`${URL_BASE}/modelos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevoModelo)
  })
    .then(respuesta => {
      if (respuesta.ok) {
        return respuesta.json()
      } else {
        throw new Error('Error al guardar el modelo')
      }
    })
    .then(modeloCreado => {
      mensajeExito.value = `Modelo "${modeloCreado.modelo}" creado correctamente`
      limpiarFormulario()
    })
    .catch(error => {
      mensajeError.value = error.message
    })
}

onMounted(() => {
  cargarMarcas()
})
</script>

<template>
  <div>
    <h1>Nuevo Modelo</h1>

    <div v-if="mensajeExito" class="mensaje-exito">{{ mensajeExito }}</div>
    <div v-if="mensajeError" class="mensaje-error">{{ mensajeError }}</div>

    <form @submit.prevent="guardarModelo">
      <div class="grupo-formulario">
        <label for="marca">Marca</label>
        <select id="marca" v-model="idMarcaSeleccionada">
          <option value="" disabled>Selecciona una marca</option>
          <option
            v-for="marca in listaMarcas"
            :key="marca.id"
            :value="marca.id"
          >
            {{ marca.nombre }}
          </option>
        </select>
      </div>

      <div class="grupo-formulario">
        <label for="modelo">Nombre del modelo</label>
        <input id="modelo" type="text" v-model="nombreModelo" />
      </div>

      <div class="grupo-formulario">
        <label for="extra">Precio extra por modelo (opcional)</label>
        <input id="extra" type="number" v-model="extraPorModelo" min="0" />
      </div>

      <button type="submit" class="boton-primario">Guardar Modelo</button>
    </form>
  </div>
</template>

<style scoped>
form {
  max-width: 450px;
}
</style>
