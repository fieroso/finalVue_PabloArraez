<script setup>
import { ref, computed, onMounted } from 'vue'
import { URL_BASE } from '../configuracion.js'

const listaClientes = ref([])
const listaMarcas = ref([])
const listaModelos = ref([])
const listaVehiculos = ref([])

const clienteSeleccionado = ref(null)
const nombreFormulario = ref('')
const dniFormulario = ref('')
const mensajeExito = ref('')
const mensajeError = ref('')

const cargarDatos = () => {
  Promise.all([
    fetch(`${URL_BASE}/clientes`).then(r => r.json()),
    fetch(`${URL_BASE}/marcas`).then(r => r.json()),
    fetch(`${URL_BASE}/modelos`).then(r => r.json()),
    fetch(`${URL_BASE}/vehiculos`).then(r => r.json())
  ])
    .then(([clientes, marcas, modelos, vehiculos]) => {
      listaClientes.value = clientes
      listaMarcas.value = marcas
      listaModelos.value = modelos
      listaVehiculos.value = vehiculos
    })
    .catch(error => {
      console.error('Error al cargar datos:', error)
    })
}

const seleccionarCliente = (cliente) => {
  limpiarMensajes()
  clienteSeleccionado.value = cliente
  nombreFormulario.value = cliente.nombre
  dniFormulario.value = cliente.dni
}

const limpiarSeleccion = () => {
  clienteSeleccionado.value = null
  nombreFormulario.value = ''
  dniFormulario.value = ''
}

const limpiarMensajes = () => {
  mensajeExito.value = ''
  mensajeError.value = ''
}

const historialAlquileres = computed(() => {
  if (!clienteSeleccionado.value || !clienteSeleccionado.value.alquileres) {
    return []
  }
  return clienteSeleccionado.value.alquileres.map(alquiler => {
    const vehiculo = listaVehiculos.value.find(
      v => v.id === alquiler.idVehiculo
    )
    if (!vehiculo) {
      return { marca: 'Desconocido', modelo: 'Desconocido', precioFinal: 0 }
    }
    const modelo = listaModelos.value.find(m => m.id === vehiculo.idModelo)
    const marca = modelo
      ? listaMarcas.value.find(ma => ma.id === modelo.idMarca)
      : null
    const extraModelo = modelo && modelo.extraPorModelo ? modelo.extraPorModelo : 0
    const precioFinal = (vehiculo.precioDia * alquiler.numDias) + extraModelo

    return {
      marca: marca ? marca.nombre : 'Desconocida',
      modelo: modelo ? modelo.modelo : 'Desconocido',
      precioFinal
    }
  })
})

const hayClienteSeleccionado = computed(() => {
  return clienteSeleccionado.value !== null
})

const altaCliente = () => {
  limpiarMensajes()

  if (!nombreFormulario.value.trim() || !dniFormulario.value.trim()) {
    mensajeError.value = 'El nombre y el DNI son obligatorios'
    return
  }

  const nuevoCliente = {
    nombre: nombreFormulario.value.trim(),
    dni: dniFormulario.value.trim(),
    alquileres: []
  }

  fetch(`${URL_BASE}/clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevoCliente)
  })
    .then(respuesta => {
      if (respuesta.ok) return respuesta.json()
      throw new Error('Error al dar de alta el cliente')
    })
    .then(clienteCreado => {
      listaClientes.value.push(clienteCreado)
      mensajeExito.value = `Cliente "${clienteCreado.nombre}" dado de alta`
      limpiarSeleccion()
    })
    .catch(error => {
      mensajeError.value = error.message
    })
}

const modificarCliente = () => {
  limpiarMensajes()

  if (!nombreFormulario.value.trim() || !dniFormulario.value.trim()) {
    mensajeError.value = 'El nombre y el DNI son obligatorios'
    return
  }

  const datosActualizados = {
    nombre: nombreFormulario.value.trim(),
    dni: dniFormulario.value.trim()
  }

  fetch(`${URL_BASE}/clientes/${clienteSeleccionado.value.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosActualizados)
  })
    .then(respuesta => {
      if (respuesta.ok) return respuesta.json()
      throw new Error('Error al modificar el cliente')
    })
    .then(clienteActualizado => {
      const indice = listaClientes.value.findIndex(
        c => c.id === clienteActualizado.id
      )
      if (indice !== -1) {
        listaClientes.value[indice] = clienteActualizado
      }
      mensajeExito.value = `Cliente "${clienteActualizado.nombre}" modificado`
      limpiarSeleccion()
    })
    .catch(error => {
      mensajeError.value = error.message
    })
}

const eliminarCliente = () => {
  limpiarMensajes()

  fetch(`${URL_BASE}/clientes/${clienteSeleccionado.value.id}`, {
    method: 'DELETE'
  })
    .then(respuesta => {
      if (respuesta.ok) {
        listaClientes.value = listaClientes.value.filter(
          c => c.id !== clienteSeleccionado.value.id
        )
        mensajeExito.value = 'Cliente eliminado correctamente'
        limpiarSeleccion()
      } else {
        throw new Error('Error al eliminar el cliente')
      }
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
    <h1>Clientes</h1>

    <div v-if="mensajeExito" class="mensaje-exito">{{ mensajeExito }}</div>
    <div v-if="mensajeError" class="mensaje-error">{{ mensajeError }}</div>

    <div class="contenedor-clientes">
      <div class="lista-clientes">
        <h2>Listado de clientes</h2>
        <ul>
          <li
            v-for="cliente in listaClientes"
            :key="cliente.id"
            @click="seleccionarCliente(cliente)"
            :class="{ 'cliente-activo': clienteSeleccionado && clienteSeleccionado.id === cliente.id }"
            class="item-cliente"
          >
            {{ cliente.nombre }} — {{ cliente.dni }}
          </li>
        </ul>
        <p v-if="listaClientes.length === 0">No hay clientes registrados.</p>
      </div>

      <div class="detalle-cliente">
        <div class="historial-alquileres">
          <div v-if="hayClienteSeleccionado">
            <h2>Historial de alquileres de {{ clienteSeleccionado.nombre }}</h2>
            <table v-if="historialAlquileres.length > 0">
              <thead>
                <tr>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Precio final (€)</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(alquiler, indice) in historialAlquileres"
                  :key="indice"
                >
                  <td>{{ alquiler.marca }}</td>
                  <td>{{ alquiler.modelo }}</td>
                  <td>{{ alquiler.precioFinal }}€</td>
                </tr>
              </tbody>
            </table>
            <p v-else>Este cliente no tiene alquileres registrados.</p>
          </div>
        </div>

        <div class="formulario-cliente">
          <h2>Datos del cliente</h2>
          <form @submit.prevent>
            <div class="grupo-formulario">
              <label for="nombreCliente">Nombre</label>
              <input
                id="nombreCliente"
                type="text"
                v-model="nombreFormulario"
              />
            </div>

            <div class="grupo-formulario">
              <label for="dniCliente">DNI</label>
              <input
                id="dniCliente"
                type="text"
                v-model="dniFormulario"
              />
            </div>

            <div class="grupo-botones">
              <button
                class="boton-primario"
                :disabled="hayClienteSeleccionado"
                @click="altaCliente"
              >
                Alta
              </button>
              <button
                class="boton-secundario"
                :disabled="!hayClienteSeleccionado"
                @click="modificarCliente"
              >
                Modificar
              </button>
              <button
                class="boton-peligro"
                :disabled="!hayClienteSeleccionado"
                @click="eliminarCliente"
              >
                Eliminar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contenedor-clientes {
  display: flex;
  gap: 30px;
}

.lista-clientes {
  width: 320px;
  flex-shrink: 0;
}

.lista-clientes h2 {
  margin-bottom: 12px;
  color: #1a2a3a;
  font-size: 1.1rem;
}

.lista-clientes ul {
  list-style: none;
  padding: 0;
}

.item-cliente {
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.item-cliente:hover {
  background-color: #eef2f7;
}

.cliente-activo {
  background-color: #d5e8f0;
  border-color: #2980b9;
}

.detalle-cliente {
  flex: 1;
}

.historial-alquileres {
  min-height: 150px;
  margin-bottom: 25px;
}

.historial-alquileres h2 {
  margin-bottom: 12px;
  color: #1a2a3a;
  font-size: 1.1rem;
}

.formulario-cliente {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 20px;
  max-width: 450px;
}

.formulario-cliente h2 {
  margin-bottom: 15px;
  color: #1a2a3a;
  font-size: 1.1rem;
}

.grupo-botones {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
</style>
