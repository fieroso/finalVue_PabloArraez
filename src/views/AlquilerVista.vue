<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { URL_BASE } from '../configuracion.js'

const listaMarcas = ref([])
const listaModelos = ref([])
const listaVehiculos = ref([])
const listaClientes = ref([])

const idMarcaSeleccionada = ref('')
const idModeloSeleccionado = ref('')
const mostrarFormularioAlquiler = ref(false)

const idVehiculoSeleccionado = ref('')
const idClienteSeleccionado = ref('')
const numeroDias = ref('')
const fechaInicio = ref('')

const resumenAlquiler = ref(null)
const mensajeError = ref('')

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
    m => m.idMarca === idMarcaSeleccionada.value
  )
})

const vehiculosFiltrados = computed(() => {
  if (!idModeloSeleccionado.value) return []
  return listaVehiculos.value.filter(
    v => v.idModelo === idModeloSeleccionado.value
  )
})

const botonBuscarDeshabilitado = computed(() => {
  return !idMarcaSeleccionada.value || !idModeloSeleccionado.value
})

watch(idMarcaSeleccionada, () => {
  idModeloSeleccionado.value = ''
  mostrarFormularioAlquiler.value = false
  resumenAlquiler.value = null
})

watch(idModeloSeleccionado, () => {
  mostrarFormularioAlquiler.value = false
  resumenAlquiler.value = null
})

const buscarVehiculos = () => {
  mensajeError.value = ''
  resumenAlquiler.value = null
  idVehiculoSeleccionado.value = ''
  idClienteSeleccionado.value = ''
  numeroDias.value = ''
  fechaInicio.value = ''
  mostrarFormularioAlquiler.value = true
}

const obtenerNombreModelo = (idModelo) => {
  const modelo = listaModelos.value.find(m => m.id === idModelo)
  return modelo ? modelo.modelo : ''
}

const registrarAlquiler = () => {
  mensajeError.value = ''
  resumenAlquiler.value = null

  if (
    !idVehiculoSeleccionado.value ||
    !idClienteSeleccionado.value ||
    !numeroDias.value ||
    !fechaInicio.value
  ) {
    mensajeError.value = 'Todos los campos son obligatorios'
    return
  }

  const cliente = listaClientes.value.find(
    c => c.id === idClienteSeleccionado.value
  )
  if (!cliente) {
    mensajeError.value = 'Cliente no encontrado'
    return
  }

  const nuevoAlquiler = {
    idVehiculo: idVehiculoSeleccionado.value,
    numDias: Number(numeroDias.value),
    fechaInic: fechaInicio.value
  }

  const alquileresActualizados = cliente.alquileres
    ? [...cliente.alquileres, nuevoAlquiler]
    : [nuevoAlquiler]

  fetch(`${URL_BASE}/clientes/${cliente.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ alquileres: alquileresActualizados })
  })
    .then(respuesta => {
      if (respuesta.ok) {
        return respuesta.json()
      } else {
        throw new Error('Error al registrar el alquiler')
      }
    })
    .then(clienteActualizado => {
      const indiceCliente = listaClientes.value.findIndex(
        c => c.id === clienteActualizado.id
      )
      if (indiceCliente !== -1) {
        listaClientes.value[indiceCliente] = clienteActualizado
      }

      const vehiculo = listaVehiculos.value.find(
        v => v.id === idVehiculoSeleccionado.value
      )
      const modelo = listaModelos.value.find(
        m => m.id === idModeloSeleccionado.value
      )
      const marca = listaMarcas.value.find(
        ma => ma.id === idMarcaSeleccionada.value
      )

      const extraModelo = modelo && modelo.extraPorModelo ? modelo.extraPorModelo : 0
      const precioTotal = (vehiculo.precioDia * Number(numeroDias.value)) + extraModelo

      resumenAlquiler.value = {
        marca: marca ? marca.nombre : '',
        modelo: modelo ? modelo.modelo : '',
        nombreCliente: clienteActualizado.nombre,
        dniCliente: clienteActualizado.dni,
        precioTotal
      }

      mostrarFormularioAlquiler.value = false
    })
    .catch(error => {
      mensajeError.value = error.message
    })
}

onMounted(() => {
  cargarDatos()
})
</script>

<template>
  <div>
    <h1>Alquiler de Vehículos</h1>

    <div v-if="mensajeError" class="mensaje-error">{{ mensajeError }}</div>

    <div class="filtros">
      <div class="grupo-formulario">
        <label for="alqMarca">Marca</label>
        <select id="alqMarca" v-model="idMarcaSeleccionada">
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
        <label for="alqModelo">Modelo</label>
        <select
          id="alqModelo"
          v-model="idModeloSeleccionado"
          :disabled="!idMarcaSeleccionada"
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

      <div class="grupo-formulario grupo-boton">
        <button
          class="boton-primario"
          :disabled="botonBuscarDeshabilitado"
          @click="buscarVehiculos"
        >
          Buscar Vehículos
        </button>
      </div>
    </div>

    <div v-if="mostrarFormularioAlquiler" class="formulario-alquiler">
      <div class="grupo-formulario">
        <label for="vehiculo">Vehículo</label>
        <select id="vehiculo" v-model="idVehiculoSeleccionado">
          <option value="" disabled>Selecciona un vehículo</option>
          <option
            v-for="vehiculo in vehiculosFiltrados"
            :key="vehiculo.id"
            :value="vehiculo.id"
          >
            {{ obtenerNombreModelo(vehiculo.idModelo) }} — {{ vehiculo.precioDia }}€/día
          </option>
        </select>
      </div>

      <div class="grupo-formulario">
        <label for="cliente">Cliente</label>
        <select id="cliente" v-model="idClienteSeleccionado">
          <option value="" disabled>Selecciona un cliente</option>
          <option
            v-for="cliente in listaClientes"
            :key="cliente.id"
            :value="cliente.id"
          >
            {{ cliente.nombre }} ({{ cliente.dni }})
          </option>
        </select>
      </div>

      <div class="grupo-formulario">
        <label for="numDias">Número de días</label>
        <input id="numDias" type="number" v-model="numeroDias" min="1" />
      </div>

      <div class="grupo-formulario">
        <label for="fechaInicio">Fecha de inicio</label>
        <input id="fechaInicio" type="text" v-model="fechaInicio" placeholder="dd/mm/aaaa" />
      </div>

      <button class="boton-primario" @click="registrarAlquiler">Alquilar</button>
    </div>

    <div v-if="resumenAlquiler" class="resumen-alquiler">
      <h2>Alquiler registrado</h2>
      <table>
        <tbody>
          <tr>
            <td><strong>Marca</strong></td>
            <td>{{ resumenAlquiler.marca }}</td>
          </tr>
          <tr>
            <td><strong>Modelo</strong></td>
            <td>{{ resumenAlquiler.modelo }}</td>
          </tr>
          <tr>
            <td><strong>Cliente</strong></td>
            <td>{{ resumenAlquiler.nombreCliente }}</td>
          </tr>
          <tr>
            <td><strong>DNI</strong></td>
            <td>{{ resumenAlquiler.dniCliente }}</td>
          </tr>
          <tr>
            <td><strong>Precio total</strong></td>
            <td>{{ resumenAlquiler.precioTotal }}€</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.filtros {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  margin-bottom: 25px;
}

.grupo-boton {
  padding-bottom: 2px;
}

.formulario-alquiler {
  max-width: 500px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 25px;
}

.resumen-alquiler {
  max-width: 500px;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
  padding: 20px;
}

.resumen-alquiler h2 {
  margin-bottom: 15px;
  color: #155724;
}

.resumen-alquiler table {
  margin-top: 0;
}

.resumen-alquiler td {
  border-bottom: 1px solid #c3e6cb;
}
</style>
