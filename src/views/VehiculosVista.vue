<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { URL_BASE } from '../configuracion.js'
import FormularioNuevoVehiculo from '../components/FormularioNuevoVehiculo.vue'

const listaMarcas = ref([])
const listaModelos = ref([])
const listaVehiculos = ref([])
const listaClientes = ref([])
const idMarcaSeleccionada = ref('')
const idModeloSeleccionado = ref('')
const mostrarFormulario = ref(false)

const cargarDatos = () => {
  Promise.all([
    fetch(`${URL_BASE}/marcas`).then(r => r.json()),
    fetch(`${URL_BASE}/modelos`).then(r => r.json()),
    fetch(`${URL_BASE}/vehiculos`).then(r => r.json()),
    fetch(`${URL_BASE}/clientes`).then(r => r.json())
  ])
    .then(([marcas, modelos, vehiculos, clientes]) => {
      listaMarcas.value = marcas
      listaModelos.value = modelos
      listaVehiculos.value = vehiculos
      listaClientes.value = clientes
    })
    .catch(error => {
      console.error('Error al cargar datos:', error)
    })
}

const modelosFiltrados = computed(() => {
  if (!idMarcaSeleccionada.value) return []
  return listaModelos.value.filter(
    modelo => modelo.idMarca === idMarcaSeleccionada.value
  )
})

watch(idMarcaSeleccionada, () => {
  idModeloSeleccionado.value = ''
})

const vehiculosFiltrados = computed(() => {
  let vehiculos = listaVehiculos.value

  if (idMarcaSeleccionada.value) {
    const idsModelosDeMarca = listaModelos.value
      .filter(m => m.idMarca === idMarcaSeleccionada.value)
      .map(m => m.id)
    vehiculos = vehiculos.filter(v => idsModelosDeMarca.includes(v.idModelo))
  }

  if (idModeloSeleccionado.value) {
    vehiculos = vehiculos.filter(
      v => v.idModelo === idModeloSeleccionado.value
    )
  }

  return vehiculos
})

const obtenerNombreModelo = (idModelo) => {
  const modelo = listaModelos.value.find(m => m.id === idModelo)
  return modelo ? modelo.modelo : 'Desconocido'
}

const obtenerClientesDeVehiculo = (idVehiculo) => {
  return listaClientes.value.filter(cliente =>
    cliente.alquileres &&
    cliente.alquileres.some(alquiler => alquiler.idVehiculo === idVehiculo)
  )
}

const alternarFormulario = () => {
  mostrarFormulario.value = !mostrarFormulario.value
}

const alVehiculoCreado = (vehiculoNuevo) => {
  listaVehiculos.value.push(vehiculoNuevo)
  mostrarFormulario.value = false
}

onMounted(() => {
  cargarDatos()
})
</script>

<template>
  <div>
    <h1>Vehículos</h1>

    <div class="filtros">
      <div class="grupo-formulario">
        <label for="filMarca">Marca</label>
        <select id="filMarca" v-model="idMarcaSeleccionada">
          <option value="">Todas las marcas</option>
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
        <label for="filModelo">Modelo</label>
        <select
          id="filModelo"
          v-model="idModeloSeleccionado"
          :disabled="!idMarcaSeleccionada"
        >
          <option value="">Todos los modelos</option>
          <option
            v-for="modelo in modelosFiltrados"
            :key="modelo.id"
            :value="modelo.id"
          >
            {{ modelo.modelo }}
          </option>
        </select>
      </div>
    </div>

    <div
      v-for="vehiculo in vehiculosFiltrados"
      :key="vehiculo.id"
      class="tarjeta-vehiculo"
    >
      <div class="vehiculo-cabecera">
        <strong>{{ obtenerNombreModelo(vehiculo.idModelo) }}</strong>
        — {{ vehiculo.precioDia }}€/día
        | {{ vehiculo.puertas }} puertas
        | Silla infantil: {{ vehiculo.sillaInfantil ? 'Sí' : 'No' }}
      </div>
      <div class="vehiculo-clientes">
        <span class="etiqueta-clientes">Clientes que lo han alquilado:</span>
        <ul v-if="obtenerClientesDeVehiculo(vehiculo.id).length > 0">
          <li
            v-for="cliente in obtenerClientesDeVehiculo(vehiculo.id)"
            :key="cliente.id"
          >
            {{ cliente.nombre }} ({{ cliente.dni }})
          </li>
        </ul>
        <p v-else class="sin-clientes">Ningún cliente ha alquilado este vehículo.</p>
      </div>
    </div>

    <p v-if="vehiculosFiltrados.length === 0">No hay vehículos para mostrar.</p>

    <button class="boton-primario boton-nuevo-vehiculo" @click="alternarFormulario">
      {{ mostrarFormulario ? 'Ocultar formulario' : 'Nuevo Vehículo' }}
    </button>

    <div v-if="mostrarFormulario" class="seccion-formulario-nuevo">
      <FormularioNuevoVehiculo
        :idMarcaInicial="idMarcaSeleccionada"
        :idModeloInicial="idModeloSeleccionado"
        :bloquearSeleccion="idMarcaSeleccionada !== '' && idModeloSeleccionado !== ''"
        @vehiculoCreado="alVehiculoCreado"
      />
    </div>
  </div>
</template>

<style scoped>
.filtros {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
}

.tarjeta-vehiculo {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 12px;
}

.vehiculo-cabecera {
  font-size: 1.05rem;
  margin-bottom: 8px;
}

.etiqueta-clientes {
  font-size: 0.9rem;
  color: #666;
}

.vehiculo-clientes ul {
  margin: 5px 0 0 20px;
}

.vehiculo-clientes li {
  font-size: 0.9rem;
}

.sin-clientes {
  font-size: 0.85rem;
  color: #999;
  margin-top: 4px;
}

.boton-nuevo-vehiculo {
  margin-top: 20px;
}

.seccion-formulario-nuevo {
  margin-top: 25px;
  padding: 20px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
}
</style>
