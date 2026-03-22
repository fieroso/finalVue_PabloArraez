<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { URL_BASE } from '../configuracion.js'

const propiedades = defineProps({
  idMarcaInicial: {
    type: String,
    default: ''
  },
  idModeloInicial: {
    type: String,
    default: ''
  },
  bloquearSeleccion: {
    type: Boolean,
    default: false
  }
})

const emitir = defineEmits(['vehiculoCreado'])

const listaMarcas = ref([])
const listaModelos = ref([])
const idMarcaSeleccionada = ref(propiedades.idMarcaInicial)
const idModeloSeleccionado = ref(propiedades.idModeloInicial)
const precioDia = ref('')
const puertas = ref('')
const sillaInfantil = ref(false)
const mensajeExito = ref('')
const mensajeError = ref('')

const cargarMarcas = () => {
  fetch(`${URL_BASE}/marcas`)
    .then(r => r.json())
    .then(marcas => { listaMarcas.value = marcas })
    .catch(error => { console.error(error) })
}

const cargarModelos = () => {
  fetch(`${URL_BASE}/modelos`)
    .then(r => r.json())
    .then(modelos => { listaModelos.value = modelos })
    .catch(error => { console.error(error) })
}

const modelosFiltrados = computed(() => {
  if (!idMarcaSeleccionada.value) return []
  return listaModelos.value.filter(
    modelo => modelo.idMarca === idMarcaSeleccionada.value
  )
})

watch(() => idMarcaSeleccionada.value, () => {
  if (!propiedades.bloquearSeleccion) {
    idModeloSeleccionado.value = ''
  }
})

const limpiarFormulario = () => {
  if (!propiedades.bloquearSeleccion) {
    idMarcaSeleccionada.value = ''
    idModeloSeleccionado.value = ''
  }
  precioDia.value = ''
  puertas.value = ''
  sillaInfantil.value = false
}

const guardarVehiculo = () => {
  mensajeExito.value = ''
  mensajeError.value = ''

  if (!idModeloSeleccionado.value || !precioDia.value || !puertas.value) {
    mensajeError.value = 'Todos los campos son obligatorios'
    return
  }

  const nuevoVehiculo = {
    idModelo: idModeloSeleccionado.value,
    precioDia: Number(precioDia.value),
    puertas: Number(puertas.value),
    sillaInfantil: sillaInfantil.value
  }

  fetch(`${URL_BASE}/vehiculos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevoVehiculo)
  })
    .then(respuesta => {
      if (respuesta.ok) {
        return respuesta.json()
      } else {
        throw new Error('Error al guardar el vehículo')
      }
    })
    .then(vehiculoCreado => {
      mensajeExito.value = 'Vehículo creado correctamente'
      limpiarFormulario()
      emitir('vehiculoCreado', vehiculoCreado)
    })
    .catch(error => {
      mensajeError.value = error.message
    })
}

onMounted(() => {
  cargarMarcas()
  cargarModelos()
})
</script>

<template>
  <div class="formulario-vehiculo">
    <h2>Nuevo Vehículo</h2>

    <div v-if="mensajeExito" class="mensaje-exito">{{ mensajeExito }}</div>
    <div v-if="mensajeError" class="mensaje-error">{{ mensajeError }}</div>

    <form @submit.prevent="guardarVehiculo">
      <div class="grupo-formulario">
        <label for="marcaVehiculo">Marca</label>
        <select
          id="marcaVehiculo"
          v-model="idMarcaSeleccionada"
          :disabled="bloquearSeleccion"
        >
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
        <label for="modeloVehiculo">Modelo</label>
        <select
          id="modeloVehiculo"
          v-model="idModeloSeleccionado"
          :disabled="bloquearSeleccion || !idMarcaSeleccionada"
        >
          <option value="" disabled>Selecciona un modelo</option>
          <option
            v-for="modelo in modelosFiltrados"
            :key="modelo.id"
            :value="modelo.id"
          >
            {{ modelo.modelo }}
          </option>
        </select>
      </div>

      <div class="grupo-formulario">
        <label for="precioDia">Precio por día (€)</label>
        <input id="precioDia" type="number" v-model="precioDia" min="1" />
      </div>

      <div class="grupo-formulario">
        <label for="puertas">Número de puertas</label>
        <input id="puertas" type="number" v-model="puertas" min="2" max="5" />
      </div>

      <div class="grupo-formulario">
        <label>
          <input type="checkbox" v-model="sillaInfantil" />
          Silla infantil
        </label>
      </div>

      <button type="submit" class="boton-primario">Guardar Vehículo</button>
    </form>
  </div>
</template>

<style scoped>
.formulario-vehiculo {
  max-width: 450px;
}

.formulario-vehiculo h2 {
  margin-bottom: 15px;
  color: #1a2a3a;
}

label input[type="checkbox"] {
  margin-right: 8px;
}
</style>
