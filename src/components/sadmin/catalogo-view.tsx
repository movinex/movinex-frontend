import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { Plus, Upload, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHeader, TableRow, TableWrap, SortHead } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Panel, SecH } from './bloques';
import { useOrden } from './use-orden';
import { formatoMoneda } from '@/lib/format';
import type { Configuracion, Phone } from '@/types';
import { calcularPagoSemanal } from '@/lib/amortizacion';

// El 15% de enganche (o lo que diga `configuracion`) es solo la sugerencia por default
// al elegir un precio — el admin puede pisarlo con un mínimo distinto por celular, por
// eso el pago semanal se calcula directo del monto financiado, no volviendo a derivar
// el enganche desde el precio. La fórmula en sí (228% anual, cargo de Seguridad y
// Bloqueo, amortización francesa) vive en un solo lugar: lib/amortizacion.ts — la
// misma que usa el Cotizador interno.
function calcularEngancheSugerido(precioBase: number, parametros: Configuracion): number {
  if (!precioBase || precioBase <= 0) return 0;
  return Math.round(precioBase * parametros.enganchePct);
}

function calcularSemanales(precioBase: number, enganche: number, parametros: Configuracion): { montoSemanal26: number; montoSemanal52: number } {
  if (!precioBase || precioBase <= 0) return { montoSemanal26: 0, montoSemanal52: 0 };
  const financiado = Math.max(precioBase - (enganche || 0), 0);
  return {
    montoSemanal26: calcularPagoSemanal(financiado, 26, parametros),
    montoSemanal52: calcularPagoSemanal(financiado, 52, parametros)
  };
}

const CAMPOS_SPECS: Array<{ key: keyof typeof SPECS_VACIO; label: string; placeholder: string }> = [
  { key: 'specsPantalla', label: 'Pantalla', placeholder: "ej. 6.8' Dynamic AMOLED 2X QHD+" },
  { key: 'specsProcesador', label: 'Procesador', placeholder: 'ej. Snapdragon 8 Gen 3' },
  { key: 'specsRamAlmacenamiento', label: 'RAM / Almacenamiento', placeholder: 'ej. 12 GB / 256 GB' },
  { key: 'specsMicrosd', label: 'MicroSD', placeholder: 'ej. No / Sí, hasta 1 TB' },
  { key: 'specsCamaraTrasera', label: 'Cámara trasera', placeholder: 'ej. 200 MP + 50 MP + 12 MP' },
  { key: 'specsCamaraFrontal', label: 'Cámara frontal', placeholder: 'ej. 12 MP' },
  { key: 'specsBateria', label: 'Batería', placeholder: 'ej. 5000 mAh · carga rápida 45 W' },
  { key: 'specsSistema', label: 'Sistema operativo', placeholder: 'ej. Android 14 · One UI 6.1' },
  { key: 'specsSeguridad', label: 'Seguridad', placeholder: 'ej. Huella + reconocimiento facial' },
  { key: 'specsResistencia', label: 'Resistencia', placeholder: 'ej. IP68' },
  { key: 'specsConectividad', label: 'Conectividad', placeholder: 'ej. 5G · Wi-Fi 7 · Bluetooth 5.3' },
  { key: 'specsDimensionesPeso', label: 'Dimensiones / Peso', placeholder: 'ej. 162.3 × 79.0 × 8.6 mm · 232 g' }
];

const SPECS_VACIO = {
  specsPantalla: '', specsProcesador: '', specsRamAlmacenamiento: '', specsMicrosd: '',
  specsCamaraTrasera: '', specsCamaraFrontal: '', specsBateria: '', specsSistema: '',
  specsSeguridad: '', specsResistencia: '', specsConectividad: '', specsDimensionesPeso: ''
};

const FORM_VACIO = {
  id: '', modelo: '', marca: '', precioBase: 0, enganche: 0, montoSemanal26: 0, montoSemanal52: 0,
  precioDescuento: '', imagen: '', imagenes: ['', '', ''] as string[], envioGratis: true, costoEnvio: 0, ...SPECS_VACIO
};

// Etiquetas del mini-carrusel de la Tienda — la del medio es la foto principal
// (normalmente la combo, mitad cámara / mitad pantalla) y se muestra primero.
const SLOTS_CARRUSEL = ['Lateral 1', 'Foto principal (centro, se muestra primero)', 'Lateral 2 / atrás'];

const ACCESORES: Record<string, (p: Phone) => string | number | null | undefined> = {
  modelo: (p) => p.modelo,
  marca: (p) => p.marca,
  precioBase: (p) => p.precioBase,
  enganche: (p) => p.enganche,
  montoSemanal26: (p) => p.montoSemanal26,
  envio: (p) => (p.envioGratis !== false ? 0 : p.costoEnvio || 0)
};
const CAMPOS_TEXTO = ['modelo', 'marca'];

const CONFIG_DEFAULT: Configuracion = {
  enganchePct: 0.15,
  tasaAnualPct: 2.28,
  ivaPct: 0.16,
  cargoSemanalNombre: 'Servicio de Seguridad y Bloqueo',
  cargoSemanalMonto: 17
};

interface CatalogoViewProps {
  phones: Phone[];
  onReloadPhones: () => void;
  adminToken: string | null;
  configuracion: Configuracion | null;
}

export function CatalogoView({ phones, onReloadPhones, adminToken, configuracion }: CatalogoViewProps) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://movinex-backend-production.up.railway.app';
  const parametros = configuracion || CONFIG_DEFAULT;

  const [form, setForm] = useState(FORM_VACIO);
  const [editando, setEditando] = useState<Phone | null>(null);
  const [creando, setCreando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [q, setQ] = useState('');

  const orden = useOrden<Phone>(ACCESORES, { inicial: 'modelo', dirInicial: 1, texto: CAMPOS_TEXTO });
  const mostrarForm = creando || editando !== null;

  const filtrados = orden.ordenar(
    q.trim()
      ? phones.filter((p) => [p.modelo, p.marca, p.id].some((c) => (c || '').toLowerCase().includes(q.trim().toLowerCase())))
      : phones
  );

  const resetForm = () => {
    setForm(FORM_VACIO);
    setEditando(null);
    setCreando(false);
  };

  const handleEditar = (phone: Phone) => {
    setEditando(phone);
    setCreando(false);
    setForm({
      id: phone.id, modelo: phone.modelo, marca: phone.marca, precioBase: phone.precioBase,
      enganche: phone.enganche, montoSemanal26: phone.montoSemanal26, montoSemanal52: phone.montoSemanal52,
      precioDescuento: phone.precioDescuento ? String(phone.precioDescuento) : '', imagen: phone.imagen,
      imagenes: [0, 1, 2].map((i) => phone.imagenes?.[i] || ''),
      envioGratis: phone.envioGratis !== false, costoEnvio: phone.costoEnvio || 0,
      specsPantalla: phone.specsPantalla || '', specsProcesador: phone.specsProcesador || '',
      specsRamAlmacenamiento: phone.specsRamAlmacenamiento || '', specsMicrosd: phone.specsMicrosd || '',
      specsCamaraTrasera: phone.specsCamaraTrasera || '', specsCamaraFrontal: phone.specsCamaraFrontal || '',
      specsBateria: phone.specsBateria || '', specsSistema: phone.specsSistema || '',
      specsSeguridad: phone.specsSeguridad || '', specsResistencia: phone.specsResistencia || '',
      specsConectividad: phone.specsConectividad || '', specsDimensionesPeso: phone.specsDimensionesPeso || ''
    });
  };

  const handlePrecioBaseChange = (valor: number) => {
    const engancheSugerido = calcularEngancheSugerido(valor, parametros);
    const semanales = calcularSemanales(valor, engancheSugerido, parametros);
    setForm((f) => ({ ...f, precioBase: valor, enganche: engancheSugerido, ...semanales }));
  };

  const handleEngancheChange = (valor: number) => {
    const semanales = calcularSemanales(form.precioBase, valor, parametros);
    setForm((f) => ({ ...f, enganche: valor, ...semanales }));
  };

  // `slot` undefined = la imagen de portada (`form.imagen`); un número = la posición
  // en el mini-carrusel de la Tienda (`form.imagenes[slot]`).
  const handleImagen = async (e: ChangeEvent<HTMLInputElement>, slot?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const response = await fetch(`${backendUrl}/api/celulares/imagen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}) },
        body: JSON.stringify({ imagen: base64 })
      });
      const res = await response.json();
      if (!response.ok) throw new Error(res.error || 'No se pudo subir la imagen.');
      if (slot === undefined) {
        setForm((f) => ({ ...f, imagen: res.url }));
      } else {
        setForm((f) => ({ ...f, imagenes: f.imagenes.map((u, i) => (i === slot ? res.url : u)) }));
      }
    } catch (err: any) {
      toast.error(err.message || 'No se pudo subir la imagen.');
    } finally {
      setSubiendo(false);
    }
  };

  const handleGuardar = async (e: FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    const payload = {
      id: form.id, modelo: form.modelo, marca: form.marca, precio_base: form.precioBase, enganche: form.enganche,
      monto_semanal_26: form.montoSemanal26, monto_semanal_52: form.montoSemanal52,
      precio_descuento: form.precioDescuento === '' ? null : Number(form.precioDescuento), imagen: form.imagen,
      imagenes: form.imagenes.filter((u) => u),
      envio_gratis: form.envioGratis, costo_envio: form.envioGratis ? 0 : form.costoEnvio,
      specs_pantalla: form.specsPantalla, specs_procesador: form.specsProcesador,
      specs_ram_almacenamiento: form.specsRamAlmacenamiento, specs_microsd: form.specsMicrosd,
      specs_camara_trasera: form.specsCamaraTrasera, specs_camara_frontal: form.specsCamaraFrontal,
      specs_bateria: form.specsBateria, specs_sistema: form.specsSistema, specs_seguridad: form.specsSeguridad,
      specs_resistencia: form.specsResistencia, specs_conectividad: form.specsConectividad,
      specs_dimensiones_peso: form.specsDimensionesPeso
    };
    try {
      const url = creando ? `${backendUrl}/api/celulares` : `${backendUrl}/api/celulares/${form.id}`;
      const method = creando ? 'POST' : 'PUT';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}) },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al guardar los datos del celular.');
      }
      toast.success('Celular guardado.');
      onReloadPhones();
      resetForm();
    } catch (err: any) {
      toast.error(err.message || 'Error al conectar con el servidor.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (phoneId: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este celular del catálogo?')) return;
    try {
      const response = await fetch(`${backendUrl}/api/celulares/${phoneId}`, {
        method: 'DELETE',
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined
      });
      if (!response.ok) throw new Error('Error al eliminar celular.');
      toast.success('Celular eliminado.');
      onReloadPhones();
    } catch (err: any) {
      toast.error(err.message || 'Error de conexión.');
    }
  };

  if (mostrarForm) {
    return (
      <div className="max-w-4xl">
        <form onSubmit={handleGuardar}>
          <SecH titulo={creando ? 'Agregar nuevo celular' : `Editar: ${form.modelo}`} />
          <Panel className="p-4">
            <div className="form-grid">
              <Campo label="ID único">
                <input placeholder="ej. samsung-s24" value={form.id} disabled={!creando} required onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))} />
              </Campo>
              <Campo label="Marca">
                <input placeholder="ej. Samsung" value={form.marca} required onChange={(e) => setForm((f) => ({ ...f, marca: e.target.value }))} />
              </Campo>
              <Campo label="Modelo">
                <input placeholder="ej. Galaxy S24 Ultra" value={form.modelo} required onChange={(e) => setForm((f) => ({ ...f, modelo: e.target.value }))} />
              </Campo>
              <Campo label="Precio base (MXN)">
                <input type="number" value={form.precioBase} required onChange={(e) => handlePrecioBaseChange(Number(e.target.value))} />
              </Campo>
              <Campo label="Enganche (MXN)" hint="Sugerido: el % de enganche de Configuración.">
                <input type="number" value={form.enganche} required onChange={(e) => handleEngancheChange(Number(e.target.value))} />
              </Campo>
              <Campo label="Precio con descuento" hint="Vacío si no hay oferta.">
                <input type="number" value={form.precioDescuento} onChange={(e) => setForm((f) => ({ ...f, precioDescuento: e.target.value }))} />
              </Campo>
              <Campo label="Semanal · 26 semanas" hint="Se calcula solo.">
                <input type="number" value={form.montoSemanal26} disabled />
              </Campo>
              <Campo label="Semanal · 52 semanas" hint="Se calcula solo.">
                <input type="number" value={form.montoSemanal52} disabled />
              </Campo>
              <Campo label="¿Envío gratis?">
                <select value={form.envioGratis ? 'si' : 'no'} onChange={(e) => setForm((f) => ({ ...f, envioGratis: e.target.value === 'si' }))}>
                  <option value="si">Sí, envío gratis</option>
                  <option value="no">Con costo adicional</option>
                </select>
              </Campo>
              {!form.envioGratis && (
                <Campo label="Costo de envío (MXN)">
                  <input type="number" required value={form.costoEnvio} onChange={(e) => setForm((f) => ({ ...f, costoEnvio: Number(e.target.value) }))} />
                </Campo>
              )}
              <div className="fld" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="img-url">Imagen del celular</label>
                <div className="flex items-center gap-2.5">
                  <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleImagen} />
                  <label htmlFor="file-upload" className="ctl shrink-0">
                    <Upload strokeWidth={1.7} /> {subiendo ? 'Subiendo...' : 'Cargar imagen'}
                  </label>
                  <input id="img-url" className="flex-1" placeholder="O ingresa la URL manualmente" value={form.imagen} required onChange={(e) => setForm((f) => ({ ...f, imagen: e.target.value }))} />
                  {form.imagen && <img src={form.imagen} alt="Vista previa" className="size-9 shrink-0 rounded border object-contain" />}
                </div>
              </div>
            </div>
          </Panel>

          <SecH titulo="Fotos de la Tienda" nota="Las 3 fotos del carrusel de la tarjeta del catálogo público. La de frente va en el medio: es la que se ve primero." />
          <Panel className="p-4">
            <div className="form-grid">
              {SLOTS_CARRUSEL.map((label, i) => (
                <Campo key={i} label={label}>
                  <div className="flex items-center gap-2.5">
                    <input id={`file-upload-${i}`} type="file" accept="image/*" className="hidden" onChange={(e) => handleImagen(e, i)} />
                    <label htmlFor={`file-upload-${i}`} className="ctl shrink-0">
                      <Upload strokeWidth={1.7} /> {subiendo ? 'Subiendo...' : 'Cargar'}
                    </label>
                    <input
                      className="flex-1"
                      placeholder="O ingresa la URL manualmente"
                      value={form.imagenes[i] || ''}
                      onChange={(e) => setForm((f) => ({ ...f, imagenes: f.imagenes.map((u, idx) => (idx === i ? e.target.value : u)) }))}
                    />
                    {form.imagenes[i] && <img src={form.imagenes[i]} alt="Vista previa" className="size-9 shrink-0 rounded border object-contain" />}
                  </div>
                </Campo>
              ))}
            </div>
          </Panel>

          <SecH titulo="Ficha técnica" nota="Se muestra en la vista rápida del catálogo público" />
          <Panel className="p-4">
            <div className="form-grid">
              {CAMPOS_SPECS.map(({ key, label, placeholder }) => (
                <Campo key={key} label={label}>
                  <input placeholder={placeholder} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
                </Campo>
              ))}
            </div>
          </Panel>

          <div className="mt-4 flex gap-2">
            <Button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar celular'}</Button>
            <button type="button" className="ctl" onClick={resetForm}>Cancelar</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2.5 rounded-[var(--radius)] border bg-card p-3 shadow-[var(--sh)]">
        <div className="srch">
          <Search strokeWidth={1.8} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Modelo, marca o ID…" aria-label="Buscar en el catálogo" />
        </div>
        <span className="flex-1" />
        <span className="chip"><b>{filtrados.length}</b> de {phones.length} equipos</span>
        <Button size="sm" onClick={() => { resetForm(); setCreando(true); }}>
          <Plus className="size-4" />
          Nuevo celular
        </Button>
      </div>

      <TableWrap>
        <Table>
          <TableHeader>
            <TableRow>
              <th />
              <SortHead campo="modelo" activo={orden.campo} dir={orden.dir} onSort={orden.alternar}>Modelo</SortHead>
              <SortHead campo="marca" activo={orden.campo} dir={orden.dir} onSort={orden.alternar}>Marca</SortHead>
              <SortHead campo="precioBase" activo={orden.campo} dir={orden.dir} onSort={orden.alternar} num>Precio base</SortHead>
              <SortHead campo="enganche" activo={orden.campo} dir={orden.dir} onSort={orden.alternar} num>Enganche</SortHead>
              <SortHead campo="montoSemanal26" activo={orden.campo} dir={orden.dir} onSort={orden.alternar} num>Semanal 26 / 52</SortHead>
              <SortHead campo="envio" activo={orden.campo} dir={orden.dir} onSort={orden.alternar}>Envío</SortHead>
              <th />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}>
                  <div className="empty">{q.trim() ? 'Ningún equipo coincide con la búsqueda.' : 'El catálogo está vacío.'}</div>
                </TableCell>
              </TableRow>
            )}
            {filtrados.map((phone) => (
              <TableRow key={phone.id}>
                <TableCell><img src={phone.imagen} alt="" className="size-8 rounded border object-contain" /></TableCell>
                <TableCell>
                  <div className="cell-2">
                    <b>{phone.modelo}</b>
                    <small className="mono">{phone.id}</small>
                  </div>
                </TableCell>
                <TableCell>{phone.marca}</TableCell>
                <TableCell className="num">{formatoMoneda(phone.precioBase)}</TableCell>
                <TableCell className="num">{formatoMoneda(phone.enganche)}</TableCell>
                <TableCell className="num">{formatoMoneda(phone.montoSemanal26)} / {formatoMoneda(phone.montoSemanal52)}</TableCell>
                <TableCell>
                  {phone.envioGratis !== false
                    ? <span className="tag g">Gratis</span>
                    : <span className="mono">{formatoMoneda(phone.costoEnvio || 0)}</span>}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => handleEditar(phone)} aria-label={`Editar ${phone.modelo}`}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleEliminar(phone.id)} aria-label={`Eliminar ${phone.modelo}`}>
                      <Trash2 className="size-4 text-[var(--crit-ink)]" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableWrap>
    </>
  );
}

function Campo({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="fld">
      <label>{label}</label>
      {children}
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}
