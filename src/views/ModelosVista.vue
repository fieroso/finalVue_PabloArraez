<script setup>
import { ref, computed, onMounted } from 'vue'
import { URL_BASE } from '../configuracion.js'

const listaMarcas = ref([])
const listaModelos = ref([])
const listaVehiculos = ref([])
const idMarcaSeleccionada = ref('')
const valoresExtraNuevos = ref({})

const cargarDatos = () => {
  Promise.all([
    fetch(`${URL_BASE}/marcas`).then(r => r.json()),
    fetch(`${URL_BASE}/modelos`).then(r => r.json()),
    fetch(`${URL_BASE}/vehiculos`).then(r => r.json())
  ])
    .then(([marcas, modelos, vehiculos]) => {
      listaMarcas.value = marcas
      listaModelos.value = modelos
      listaVehiculos.value = vehiculos
    })
    .catch(error => {
      console.error('Error al cargar datos:', error)
    })
}

const modelosDeMarca = computed(() => {
  if (!idMarcaSeleccionada.value) return []
  return listaModelos.value
    .filter(modelo => modelo.idMarca === idMarcaSeleccionada.value)
    .map(modelo => {
      const vehiculosDelModelo = listaVehiculos.value.filter(
        vehiculo => vehiculo.idModelo === modelo.id
      )
      let precioMedioDia = 0
      if (vehiculosDelModelo.length > 0) {
        const suma = vehiculosDelModelo.reduce(
          (total, v) => total + v.precioDia, 0
        )
        precioMedioDia = suma / vehiculosDelModelo.length
      }
      return {
        ...modelo,
        precioMedioDia
      }
    })
})

const actualizarExtra = (idModelo) => {
  const nuevoExtra = Number(valoresExtraNuevos.value[idModelo])
  if (!nuevoExtra || nuevoExtra <= 0) return

  fetch(`${URL_BASE}/modelos/${idModelo}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ extraPorModelo: nuevoExtra })
  })
    .then(respuesta => {
      if (respuesta.ok) {
        return respuesta.json()
      } else {
        throw new Error('Error al actualizar el extra')
      }
    })
    .then(modeloActualizado => {
      const indice = listaModelos.value.findIndex(
        m => m.id === modeloActualizado.id
      )
      if (indice !== -1) {
        listaModelos.value[indice] = modeloActualizado
      }
      delete valoresExtraNuevos.value[idModelo]
    })
    .catch(error => {
      console.error(error.message)
    })
}

onMounted(() => {
  cargarDatos()
})
</script>

<template>
  <div>
    <h1>Modelos</h1>

    <div class="selector-marca-centrado">
      <select v-model="idMarcaSeleccionada">
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

    <div v-if="idMarcaSeleccionada">
      <p v-if="modelosDeMarca.length === 0">
        No hay modelos para esta marca.
      </p>
      <table v-else>
        <thead>
          <tr>
            <th>Modelo</th>
            <th>Precio medio (€/día)</th>
            <th>Extra por modelo (€)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="modelo in modelosDeMarca" :key="modelo.id">
            <td>{{ modelo.modelo }}</td>
            <td>{{ modelo.precioMedioDia.toFixed(2) }}€</td>
            <td>
              <span v-if="modelo.extraPorModelo && modelo.extraPorModelo > 0">
                {{ modelo.extraPorModelo }}€
              </span>
              <span v-else class="campo-extra-editable">
                <input
                  type="number"
                  min="1"
                  v-model="valoresExtraNuevos[modelo.id]"
                  placeholder="Precio extra"
                  class="input-extra"
                />
                <button
                  class="boton-primario boton-pequeno"
                  @click="actualizarExtra(modelo.id)"
                >
                  Guardar
                </button>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.selector-marca-centrado {
  text-align: center;
  margin-bottom: 25px;
}

.selector-marca-centrado select {
  max-width: 300px;
}

.campo-extra-editable {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-extra {
  max-width: 120px;
}
</style>
