<script setup>
import { ref, computed, onMounted } from 'vue'
import { URL_BASE } from '../configuracion.js'

const listaMarcas = ref([])
const listaModelos = ref([])
const listaVehiculos = ref([])
const idMarcaSeleccionada = ref(null)

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

const calcularPrecioMedioPorMarca = (idMarca) => {
  const modelosDeMarca = listaModelos.value.filter(
    modelo => modelo.idMarca === idMarca
  )
  const idsModelos = modelosDeMarca.map(modelo => modelo.id)
  const vehiculosDeMarca = listaVehiculos.value.filter(
    vehiculo => idsModelos.includes(vehiculo.idModelo)
  )
  if (vehiculosDeMarca.length === 0) return 0
  const sumaPrecios = vehiculosDeMarca.reduce(
    (suma, vehiculo) => suma + vehiculo.precioDia, 0
  )
  return sumaPrecios / vehiculosDeMarca.length
}

const marcasOrdenadas = computed(() => {
  const marcasConPrecio = listaMarcas.value.map(marca => ({
    ...marca,
    precioMedio: calcularPrecioMedioPorMarca(marca.id)
  }))
  return marcasConPrecio.sort((a, b) => b.precioMedio - a.precioMedio)
})

const seleccionarMarca = (idMarca) => {
  if (idMarcaSeleccionada.value === idMarca) {
    idMarcaSeleccionada.value = null
  } else {
    idMarcaSeleccionada.value = idMarca
  }
}

const modelosDeMarcaSeleccionada = computed(() => {
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
    <h1>Marcas</h1>

    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>País de origen</th>
          <th>Año de fundación</th>
          <th>Precio medio (€/día)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="marca in marcasOrdenadas" :key="marca.id" @click="seleccionarMarca(marca.id)"
          :class="{ 'fila-seleccionada': idMarcaSeleccionada === marca.id }" class="fila-clickable">
          <td>{{ marca.nombre }}</td>
          <td>{{ marca.origen }}</td>
          <td>{{ marca.anioFundacion }}</td>
          <td>{{ marca.precioMedio.toFixed(2) }}€</td>
        </tr>
      </tbody>
    </table>

    <div v-if="idMarcaSeleccionada" class="seccion-modelos">
      <h2>Modelos en stock</h2>
      <p v-if="modelosDeMarcaSeleccionada.length === 0">
        No hay modelos en stock para esta marca.
      </p>
      <table v-else>
        <thead>
          <tr>
            <th>Modelo</th>
            <th>Precio medio (€/día)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="modelo in modelosDeMarcaSeleccionada" :key="modelo.id">
            <td>{{ modelo.modelo }}</td>
            <td>{{ modelo.precioMedioDia.toFixed(2) }}€</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.fila-clickable {
  cursor: pointer;
}

.fila-seleccionada {
  background-color: #d5e8f0;
}

.seccion-modelos {
  margin-top: 30px;
  padding: 20px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.seccion-modelos h2 {
  margin-bottom: 15px;
  color: #1a2a3a;
}
</style>
