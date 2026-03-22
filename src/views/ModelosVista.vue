<script setup>
import { ref, computed, onMounted } from 'vue'
import { URL_BASE } from '../configuracion.js'

const listaMarcas = ref([])
const listaModelos = ref([])
const listaVehiculos = ref([])
const idMarcaSeleccionada = ref('')

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
            <td>{{ modelo.extraPorModelo }}€</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.selector-marca-centrado {
  text-align: center;
  margin-bottom: 20px;
}

.selector-marca-centrado select {
  max-width: 300px;
}
</style>
