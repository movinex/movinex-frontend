import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { Plus, Upload, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input, Label, Select, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Phone } from '@/types';

// Fórmula oficial de Movinex (228% anual, cargo de Seguridad y Bloqueo $17 + IVA
// semanal, amortización francesa). El 15% de enganche es solo la sugerencia por
// default — el admin puede pisarlo con un mínimo distinto por celular.
function calcularEngancheSugerido(precioBase: number): number {
  if (!precioBase || precioBase <= 0) return 0;
  return Math.round(precioBase * 0.15 * 100) / 100;
}

function calcularSemanales(precioBase: number, enganche: number): { montoSemanal26: number; montoSemanal52: number } {
  if (!precioBase || precioBase <= 0) return { montoSemanal26: 0, montoSemanal52: 0 };
  const financiado = Math.max(precioBase - (enganche || 0), 0);
  const tasaSemanalConIva = (2.28 / 52) * 1.16;
  const cargoServicioConIva = 17 * 1.16;
  const pagoBase = (semanas: number) => {
    const factor = Math.pow(1 + tasaSemanalConIva, semanas);
    return (financiado * tasaSemanalConIva * factor) / (factor - 1);
  };
  return {
    montoSemanal26: Math.round(pagoBase(26) + cargoServicioConIva),
    montoSemanal52: Math.round(pagoBase(52) + cargoServicioConIva)
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
  precioDescuento: '', imagen: '', envioGratis: true, costoEnvio: 0, ...SPECS_VACIO
};

interface CatalogoViewProps {
  phones: Phone[];
  onReloadPhones: () => void;
  adminToken: string | null;
}

export function CatalogoView({ phones, onReloadPhones, adminToken }: CatalogoViewProps) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://movinex-backend-production.up.railway.app';

  const [form, setForm] = useState(FORM_VACIO);
  const [editando, setEditando] = useState<Phone | null>(null);
  const [creando, setCreando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);

  const mostrarForm = creando || editando !== null;

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
    const engancheSugerido = calcularEngancheSugerido(valor);
    const semanales = calcularSemanales(valor, engancheSugerido);
    setForm((f) => ({ ...f, precioBase: valor, enganche: engancheSugerido, ...semanales }));
  };

  const handleEngancheChange = (valor: number) => {
    const semanales = calcularSemanales(form.precioBase, valor);
    setForm((f) => ({ ...f, enganche: valor, ...semanales }));
  };

  const handleImagen = async (e: ChangeEvent<HTMLInputElement>) => {
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
      setForm((f) => ({ ...f, imagen: res.url }));
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
      <div className="mx-auto max-w-4xl space-y-5">
        <h1 className="text-2xl font-semibold tracking-tight">{creando ? 'Agregar nuevo celular' : `Editar: ${form.modelo}`}</h1>
        <form onSubmit={handleGuardar} className="space-y-6">
          <Card>
            <CardContent className="grid grid-cols-2 gap-4 pt-6">
              <Campo label="ID único">
                <Input placeholder="ej. samsung-s24" value={form.id} disabled={!creando} required onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))} />
              </Campo>
              <Campo label="Marca">
                <Input placeholder="ej. Samsung" value={form.marca} required onChange={(e) => setForm((f) => ({ ...f, marca: e.target.value }))} />
              </Campo>
              <Campo label="Modelo">
                <Input placeholder="ej. Galaxy S24 Ultra" value={form.modelo} required onChange={(e) => setForm((f) => ({ ...f, modelo: e.target.value }))} />
              </Campo>
              <Campo label="Precio base (MXN)">
                <Input type="number" value={form.precioBase} required onChange={(e) => handlePrecioBaseChange(Number(e.target.value))} />
              </Campo>
              <Campo label="Enganche (MXN)">
                <Input type="number" value={form.enganche} required title="Sugerido: 15% del precio base." onChange={(e) => handleEngancheChange(Number(e.target.value))} />
              </Campo>
              <Campo label="Precio con descuento (opcional)">
                <Input type="number" placeholder="Vacío si no hay oferta" value={form.precioDescuento} onChange={(e) => setForm((f) => ({ ...f, precioDescuento: e.target.value }))} />
              </Campo>
              <Campo label="Semanal · 26 semanas">
                <Input type="number" value={form.montoSemanal26} disabled />
              </Campo>
              <Campo label="Semanal · 52 semanas">
                <Input type="number" value={form.montoSemanal52} disabled />
              </Campo>
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label>Imagen del celular</Label>
                <div className="flex items-center gap-3">
                  <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleImagen} />
                  <Label htmlFor="file-upload" className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border bg-secondary px-3 py-2 text-xs font-semibold">
                    <Upload className="size-3.5" /> {subiendo ? 'Subiendo...' : 'Cargar imagen'}
                  </Label>
                  <Input className="flex-1" placeholder="O ingresa la URL manualmente" value={form.imagen} required onChange={(e) => setForm((f) => ({ ...f, imagen: e.target.value }))} />
                  {form.imagen && <img src={form.imagen} alt="preview" className="size-10 rounded border object-contain" />}
                </div>
              </div>
              <Campo label="¿Envío gratis?">
                <Select value={form.envioGratis ? 'si' : 'no'} onChange={(e) => setForm((f) => ({ ...f, envioGratis: e.target.value === 'si' }))}>
                  <option value="si">Sí, envío gratis</option>
                  <option value="no">Con costo adicional</option>
                </Select>
              </Campo>
              {!form.envioGratis && (
                <Campo label="Costo de envío ($ MXN)">
                  <Input type="number" required value={form.costoEnvio} onChange={(e) => setForm((f) => ({ ...f, costoEnvio: Number(e.target.value) }))} />
                </Campo>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 pt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Ficha técnica</h2>
              <div className="grid grid-cols-2 gap-4">
                {CAMPOS_SPECS.map(({ key, label, placeholder }) => (
                  <Campo key={key} label={label}>
                    <Textarea rows={1} placeholder={placeholder} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
                  </Campo>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar celular'}</Button>
            <Button type="button" variant="ghost" onClick={resetForm}>Cancelar</Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Catálogo</h1>
          <p className="text-muted-foreground">Equipos disponibles en la tienda.</p>
        </div>
        <Button onClick={() => { resetForm(); setCreando(true); }}>
          <Plus className="size-4" />
          Nuevo celular
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagen</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead className="text-right">Precio base</TableHead>
                <TableHead className="text-right">Enganche</TableHead>
                <TableHead>Semanal (26/52)</TableHead>
                <TableHead>Envío</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {phones.map((phone) => (
                <TableRow key={phone.id}>
                  <TableCell><img src={phone.imagen} alt={phone.modelo} className="size-10 rounded border object-contain" /></TableCell>
                  <TableCell className="font-medium">{phone.modelo}</TableCell>
                  <TableCell>{phone.marca}</TableCell>
                  <TableCell className="text-right tabular-nums">${phone.precioBase.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">${phone.enganche.toLocaleString()}</TableCell>
                  <TableCell className="tabular-nums">${phone.montoSemanal26}/${phone.montoSemanal52}</TableCell>
                  <TableCell>{phone.envioGratis !== false ? 'Gratis' : `$${phone.costoEnvio || 0}`}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEditar(phone)} aria-label="Editar">
                        <Pencil className="size-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleEliminar(phone.id)} aria-label="Eliminar">
                        <Trash2 className="size-4 text-[color:var(--status-critical)]" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
