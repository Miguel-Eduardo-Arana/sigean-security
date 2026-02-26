/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  Key, 
  LayoutGrid, 
  Settings, 
  Plus, 
  Trash2, 
  Edit2, 
  ChevronLeft,
  LayoutDashboard,
  Search,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Collection = 'usuarios' | 'roles' | 'permisos' | 'modulos' | 'opciones';

interface Item {
  id: string;
  [key: string]: any;
}

const MODULES = [
  { id: 'usuarios', name: 'Usuarios', icon: Users, description: 'Gestión de cuentas de usuario y estados.' },
  { id: 'roles', name: 'Roles', icon: Shield, description: 'Definición de perfiles y niveles de acceso.' },
  { id: 'permisos', name: 'Permisos', icon: Key, description: 'Control granular de acciones del sistema.' },
  { id: 'modulos', name: 'Módulos', icon: LayoutGrid, description: 'Configuración de secciones del sistema.' },
  { id: 'opciones', name: 'Opciones', icon: Settings, description: 'Configuración de opciones por módulo.' },
];

export default function App() {
  const [activeModule, setActiveModule] = useState<Collection | null>(null);
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (activeModule) {
      fetchData();
    }
  }, [activeModule]);

  const fetchData = async () => {
    setLoading(true);
    const url = `/api/${activeModule}`;
    console.log(`Fetching: ${url}`);
    try {
      const res = await fetch(url);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Expected JSON but got ${contentType}. Body: ${text.substring(0, 100)}...`);
      }
      const json = await res.json();
      if (Array.isArray(json)) {
        setData(json);
      } else {
        console.error('API did not return an array:', json);
        setData([]);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingItem ? 'PUT' : 'POST';
    const url = editingItem ? `/api/${activeModule}/${editingItem.id}` : `/api/${activeModule}`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({});
        fetchData();
      }
    } catch (err) {
      console.error('Error saving data:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este registro?')) return;
    try {
      await fetch(`/api/${activeModule}/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error('Error deleting data:', err);
    }
  };

  const openModal = (item: Item | null = null) => {
    setEditingItem(item);
    setFormData(item || {});
    setIsModalOpen(true);
  };

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {MODULES.map((module) => (
        <motion.div
          key={module.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveModule(module.id as Collection)}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer card-hover flex flex-col items-center text-center group"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
            <module.icon className="w-8 h-8 text-primary group-hover:text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{module.name}</h3>
          <p className="text-gray-500 text-sm">{module.description}</p>
        </motion.div>
      ))}
    </div>
  );

  const renderCrud = () => {
    const moduleInfo = MODULES.find(m => m.id === activeModule);
    if (!moduleInfo) return null;

    const columns = data.length > 0 ? Object.keys(data[0]).filter(k => k !== 'id' && k !== '_id') : [];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setActiveModule(null)}
            className="flex items-center text-gray-500 hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Volver al Dashboard
          </button>
          <button 
            onClick={() => openModal()}
            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-primary-hover transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo {moduleInfo.name.slice(0, -1)}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-bottom border-gray-50 flex items-center justify-between">
            <div className="flex items-center">
              <moduleInfo.icon className="w-6 h-6 text-primary mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">{moduleInfo.name}</h2>
            </div>
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 w-64 text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  {columns.map(col => (
                    <th key={col} className="px-6 py-4 font-semibold">{col.replace('_', ' ')}</th>
                  ))}
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={columns.length + 1} className="px-6 py-12 text-center text-gray-400">Cargando...</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={columns.length + 1} className="px-6 py-12 text-center text-gray-400">No hay registros encontrados.</td></tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      {columns.map(col => (
                        <td key={col} className="px-6 py-4 text-sm text-gray-600">
                          {String(item[col])}
                        </td>
                      ))}
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          onClick={() => openModal(item)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Shield className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Sigean Security</h1>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Módulo de Seguridad</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-sm font-medium text-primary border-b-2 border-primary pb-1">Dashboard</a>
            <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Reportes</a>
            <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Ajustes</a>
          </nav>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">Admin Sigean</p>
              <p className="text-xs text-gray-500">Super Usuario</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-full border-2 border-white shadow-sm overflow-hidden">
              <img src="https://picsum.photos/seed/admin/100/100" alt="Avatar" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeModule || 'dashboard'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {!activeModule ? renderDashboard() : renderCrud()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p>© 2026 Sigean Security Module - Evaluación Base de Datos</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary transition-colors">Documentación</a>
            <a href="#" className="hover:text-primary transition-colors">Soporte</a>
          </div>
        </div>
      </footer>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingItem ? 'Editar' : 'Nuevo'} {activeModule?.slice(0, -1)}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {activeModule === 'usuarios' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Usuario</label>
                      <input 
                        required
                        type="text" 
                        maxLength={10}
                        value={formData.usuario || ''} 
                        onChange={e => setFormData({...formData, usuario: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contraseña</label>
                      <input 
                        required
                        type="password" 
                        maxLength={10}
                        value={formData.contraseña || ''} 
                        onChange={e => setFormData({...formData, contraseña: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
                        <input 
                          type="text" 
                          maxLength={40}
                          value={formData.nombre || ''} 
                          onChange={e => setFormData({...formData, nombre: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Apellido</label>
                        <input 
                          type="text" 
                          maxLength={40}
                          value={formData.apellido || ''} 
                          onChange={e => setFormData({...formData, apellido: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Correo</label>
                      <input 
                        type="email" 
                        maxLength={60}
                        value={formData.correo || ''} 
                        onChange={e => setFormData({...formData, correo: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rol (ID)</label>
                        <input 
                          type="number" 
                          value={formData.rol || ''} 
                          onChange={e => setFormData({...formData, rol: parseInt(e.target.value)})}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estado</label>
                        <input 
                          type="text" 
                          maxLength={1}
                          placeholder="A"
                          value={formData.estado || ''} 
                          onChange={e => setFormData({...formData, estado: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                      </div>
                    </div>
                  </>
                )}
                {activeModule === 'roles' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del Rol</label>
                      <input 
                        required
                        type="text" 
                        value={formData.nombre || ''} 
                        onChange={e => setFormData({...formData, nombre: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                      <textarea 
                        value={formData.descripcion || ''} 
                        onChange={e => setFormData({...formData, descripcion: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all h-24"
                      />
                    </div>
                  </>
                )}
                {activeModule === 'permisos' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
                      <input 
                        required
                        type="text" 
                        value={formData.nombre || ''} 
                        onChange={e => setFormData({...formData, nombre: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Código</label>
                      <input 
                        required
                        type="text" 
                        value={formData.codigo || ''} 
                        onChange={e => setFormData({...formData, codigo: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                    </div>
                  </>
                )}
                {activeModule === 'modulos' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
                      <input 
                        required
                        type="text" 
                        value={formData.nombre || ''} 
                        onChange={e => setFormData({...formData, nombre: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ruta</label>
                      <input 
                        required
                        type="text" 
                        value={formData.ruta || ''} 
                        onChange={e => setFormData({...formData, ruta: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                    </div>
                  </>
                )}
                {activeModule === 'opciones' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ID Opción</label>
                      <input 
                        required
                        type="number" 
                        value={formData.id_opcion || ''} 
                        onChange={e => setFormData({...formData, id_opcion: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                      <input 
                        required
                        type="text" 
                        maxLength={40}
                        value={formData.desc_opcion || ''} 
                        onChange={e => setFormData({...formData, desc_opcion: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ID Módulo</label>
                      <input 
                        required
                        type="number" 
                        value={formData.id_modulo || ''} 
                        onChange={e => setFormData({...formData, id_modulo: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estado</label>
                      <input 
                        type="text" 
                        maxLength={1}
                        placeholder="A"
                        value={formData.estado || ''} 
                        onChange={e => setFormData({...formData, estado: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                    </div>
                  </>
                )}
                
                <div className="pt-4 flex space-x-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover transition-colors shadow-md"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
